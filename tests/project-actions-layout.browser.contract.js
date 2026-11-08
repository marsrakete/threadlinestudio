"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("@playwright/test");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const url = new URL(request.url, "http://127.0.0.1");
      const file = path.resolve(root, "." + decodeURIComponent(url.pathname));
      if (!file.startsWith(root + path.sep)) {
        response.writeHead(403);
        response.end();
        return;
      }
      fs.readFile(file, (error, contents) => {
        if (error) {
          response.writeHead(404);
          response.end();
          return;
        }
        const types = { ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
        response.writeHead(200, { "content-type": types[path.extname(file)] || "text/html" });
        response.end(contents);
      });
    });
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve({ server, url: "http://127.0.0.1:" + server.address().port }));
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

async function openPage(browser, url, viewport) {
  const page = await browser.newPage({ viewport });
  await page.goto(url + "/index.html", { waitUntil: "load" });
  await page.waitForFunction(() => document.querySelector("#versionText")?.textContent.includes("App "));
  return page;
}

test("wide and landscape layouts scroll preview and tools independently", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    for (const viewport of [{ width: 1440, height: 900 }, { width: 1024, height: 768 }]) {
      const page = await openPage(browser, url, viewport);
      await page.locator(".side-panels .collapsible").evaluateAll(panels => panels.forEach(panel => { panel.open = true; }));
      const panes = await page.evaluate(() => {
        const preview = document.querySelector(".canvas-wrap");
        const tools = document.querySelector(".side-panels");
        return {
          previewClient: preview.clientHeight,
          previewScroll: preview.scrollHeight,
          toolsClient: tools.clientHeight,
          toolsScroll: tools.scrollHeight,
          openPanelCount: document.querySelectorAll(".side-panels .collapsible[open]").length,
          panelCount: document.querySelectorAll(".side-panels .collapsible").length,
          panelBounds: [...document.querySelectorAll(".side-panels .collapsible")].map(panel => {
            const rect = panel.getBoundingClientRect();
            return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), height: Math.round(rect.height), content: panel.scrollHeight };
          }),
          projectVisible: getComputedStyle(document.querySelector(".desktop-stage-panel")).display !== "none",
          projectInsidePreview: document.querySelector(".desktop-stage-panel").closest(".canvas-wrap") === preview,
          canvasWidthRatio: document.querySelector("#previewCanvas").getBoundingClientRect().width
            / document.querySelector(".canvas-frame").clientWidth,
          previewColumnRatio: Number.parseFloat(getComputedStyle(document.querySelector(".workspace")).gridTemplateColumns.split(" ")[0])
            / document.querySelector(".workspace").clientWidth,
        };
      });
      assert.ok(panes.previewClient > 0 && panes.previewScroll > panes.previewClient, `preview should scroll independently at ${viewport.width}px: ${JSON.stringify(panes)}`);
      assert.ok(panes.toolsClient > 0 && panes.toolsScroll > panes.toolsClient, `tools should scroll independently at ${viewport.width}px: ${JSON.stringify(panes)}`);
      assert.equal(panes.projectVisible, true);
      assert.equal(panes.projectInsidePreview, true);
      assert.ok(panes.canvasWidthRatio > 0.99, `canvas should fill its frame at ${viewport.width}px: ${JSON.stringify(panes)}`);
      if (viewport.width > 1180) {
        assert.ok(panes.previewColumnRatio > 0.65, `desktop preview should use at least two thirds of the workspace at ${viewport.width}px: ${JSON.stringify(panes)}`);
      } else {
        assert.ok(panes.previewColumnRatio > 0.57, `landscape preview should use the available width at ${viewport.width}px: ${JSON.stringify(panes)}`);
      }

      await page.evaluate(() => { document.querySelector(".side-panels").scrollTop = 180; });
      assert.equal(await page.locator(".canvas-wrap").evaluate(node => node.scrollTop), 0);
      await page.evaluate(() => { document.querySelector(".canvas-wrap").scrollTop = 120; });
      assert.equal(await page.locator(".side-panels").evaluate(node => node.scrollTop), 180);
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    await closeServer(server);
  }
});

test("portrait mobile returns to the original page flow without a fixed action dock", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1024, height: 1366 }]) {
      const page = await openPage(browser, url, viewport);
      assert.equal(await page.locator(".mobile-action-dock").count(), 0);
      assert.equal(await page.locator(".mobile-project-panel").isVisible(), true);
      assert.equal(await page.locator(".canvas-wrap").evaluate(node => getComputedStyle(node).position), "sticky");
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(40);
      assert.ok(await page.evaluate(() => window.scrollY > 0), `mobile layout should use document scrolling at ${viewport.width}px`);
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    await closeServer(server);
  }
});
