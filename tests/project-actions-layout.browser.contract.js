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
    for (const viewport of [
      { width: 1920, height: 1080 },
      { width: 1440, height: 900 },
      { width: 1024, height: 768 },
      { width: 1180, height: 820 },
      { width: 1024, height: 1366 },
    ]) {
      const page = await openPage(browser, url, viewport);
      await page.locator(".side-panels .collapsible").evaluateAll(panels => panels.forEach(panel => { panel.open = true; }));
      const panes = await page.evaluate(() => {
        const preview = document.querySelector(".canvas-wrap");
        const tools = document.querySelector(".side-panels");
        const isMobileLayout = document.body.classList.contains("mobile-layout");
        const projectPanel = document.querySelector(isMobileLayout ? ".mobile-project-panel" : ".desktop-stage-panel");
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
          projectVisible: getComputedStyle(projectPanel).display !== "none",
          projectInsidePreview: projectPanel.closest(".canvas-wrap") === preview,
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
          heroWidth: Math.round(document.querySelector(".hero").getBoundingClientRect().width),
          shellWidth: Math.round(document.querySelector(".app-shell").getBoundingClientRect().width),
          overflowingSliders: [...document.querySelectorAll(".side-panels input[type='range']")].filter(slider => {
            const sliderBounds = slider.getBoundingClientRect();
            const fieldBounds = slider.closest(".field").getBoundingClientRect();
            return sliderBounds.left < fieldBounds.left - 1 || sliderBounds.right > fieldBounds.right + 1;
          }).length,
          canvasWidthRatio: document.querySelector("#previewCanvas").getBoundingClientRect().width
            / document.querySelector(".canvas-frame").clientWidth,
          previewColumnRatio: Number.parseFloat(getComputedStyle(document.querySelector(".workspace")).gridTemplateColumns.split(" ")[0])
            / document.querySelector(".workspace").clientWidth,
        };
      });
      if (viewport.width > 1180) {
        assert.ok(panes.previewClient > 0 && panes.previewScroll > panes.previewClient, `preview should scroll independently at ${viewport.width}px: ${JSON.stringify(panes)}`);
        assert.ok(panes.toolsClient > 0 && panes.toolsScroll > panes.toolsClient, `tools should scroll independently at ${viewport.width}px: ${JSON.stringify(panes)}`);
      }
      assert.equal(panes.projectVisible, true);
      if (viewport.width > 1180) {
        assert.equal(panes.projectInsidePreview, true);
      }
      assert.ok(panes.canvasWidthRatio > 0.99, `canvas should fill its frame at ${viewport.width}px: ${JSON.stringify(panes)}`);
      assert.ok(panes.documentWidth <= panes.viewportWidth, `layout should not overflow horizontally at ${viewport.width}px: ${JSON.stringify(panes)}`);
      assert.ok(panes.heroWidth >= panes.shellWidth - 2, `hero should span the app shell at ${viewport.width}px: ${JSON.stringify(panes)}`);
      assert.equal(panes.overflowingSliders, 0, `sliders should stay inside their fields at ${viewport.width}px: ${JSON.stringify(panes)}`);
      if (viewport.width > 1180) {
        assert.ok(panes.previewColumnRatio > 0.54, `desktop preview should keep a generous share of the workspace at ${viewport.width}px: ${JSON.stringify(panes)}`);
      } else if (viewport.height < viewport.width) {
        assert.ok(panes.previewColumnRatio > 0.57, `landscape workspace should keep a wide preview column at ${viewport.width}px: ${JSON.stringify(panes)}`);
      } else if (viewport.width >= 821) {
        assert.ok(panes.previewColumnRatio > 0.99, `portrait tablet workspace should use one full-width column at ${viewport.width}px: ${JSON.stringify(panes)}`);
      } else {
        assert.ok(panes.previewColumnRatio > 0.57, `landscape preview should use the available width at ${viewport.width}px: ${JSON.stringify(panes)}`);
      }

      if (viewport.width > 1180) {
        await page.evaluate(() => { document.querySelector(".side-panels").scrollTop = 180; });
        assert.equal(await page.locator(".canvas-wrap").evaluate(node => node.scrollTop), 0);
        await page.evaluate(() => { document.querySelector(".canvas-wrap").scrollTop = 120; });
        assert.equal(await page.locator(".side-panels").evaluate(node => node.scrollTop), 180);
      }
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    await closeServer(server);
  }
});

test("portrait mobile centers the preview and keeps its actions in the page flow", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    for (const viewport of [{ width: 390, height: 844 }, { width: 1024, height: 1366 }]) {
      const page = await openPage(browser, url, viewport);
      assert.equal(await page.locator(".mobile-action-dock").count(), 0);
      assert.equal(await page.locator(".mobile-project-panel").isVisible(), true);
      for (const actionId of ["mobileFitButton", "mobileResetImageButton", "mobileCenterButton"]) {
        assert.equal(await page.locator(`#${actionId}`).isVisible(), true, `${actionId} should be visible at ${viewport.width}px`);
      }
      if (viewport.width <= 820) {
        assert.equal(await page.locator(".canvas-wrap").evaluate(node => getComputedStyle(node).position), "sticky");
      } else {
        assert.equal(await page.locator(".canvas-wrap").evaluate(node => getComputedStyle(node).position), "static");
      }
      const alignment = await page.evaluate(() => {
        const frame = document.querySelector(".canvas-frame").getBoundingClientRect();
        const stage = document.querySelector(".stage").getBoundingClientRect();
        return Math.abs((frame.left + frame.right) / 2 - (stage.left + stage.right) / 2);
      });
      assert.ok(alignment < 2, `preview should be horizontally centered at ${viewport.width}px`);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(40);
      assert.ok(await page.evaluate(() => window.scrollY > 0), `mobile layout should use document scrolling at ${viewport.width}px`);
      if (viewport.width <= 820) {
        const stickyTop = await page.locator(".canvas-wrap").evaluate(node => node.getBoundingClientRect().top);
        assert.ok(stickyTop >= -1 && stickyTop <= 1, `mobile preview should remain flush with the top while scrolling: ${stickyTop}`);
      }
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    await closeServer(server);
  }
});

test("phone landscape keeps the project panel under the preview in an independently scrolling left pane", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    for (const viewport of [{ width: 844, height: 390 }, { width: 956, height: 440 }]) {
      const page = await openPage(browser, url, viewport);
      await page.locator(".side-panels .collapsible").evaluateAll(panels => panels.forEach(panel => { panel.open = true; }));
      const focusControls = await page.evaluate(() => [...document.querySelectorAll(".focus-pair .field-grid")].map(grid => {
      const fields = [...grid.querySelectorAll(":scope > .field")];
      const first = fields[0].getBoundingClientRect();
      const second = fields[1].getBoundingClientRect();
      return {
        columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
        verticallyStacked: second.top >= first.bottom,
        contained: fields.every(field => {
          const fieldBounds = field.getBoundingClientRect();
          const gridBounds = grid.getBoundingClientRect();
          return fieldBounds.left >= gridBounds.left - 1 && fieldBounds.right <= gridBounds.right + 1;
        }),
      };
      }));
      assert.equal(focusControls.length, 2);
      assert.ok(focusControls.every(control => control.columns === 1 && control.verticallyStacked && control.contained), JSON.stringify(focusControls));
      const layout = await page.evaluate(() => {
      const preview = document.querySelector(".canvas-wrap");
      const tools = document.querySelector(".side-panels");
      const workspace = document.querySelector(".workspace");
      const project = document.querySelector(".desktop-stage-panel");
        const parsePixels = value => Number.parseFloat(value);
      return {
        previewClient: preview.clientHeight,
        previewScroll: preview.scrollHeight,
        toolsClient: tools.clientHeight,
        toolsScroll: tools.scrollHeight,
        projectVisible: getComputedStyle(project).display !== "none",
        projectUnderPreview: project.closest(".canvas-wrap") === preview,
        previewColumnRatio: preview.clientWidth / workspace.clientWidth,
        canvasFrameWidth: document.querySelector(".canvas-frame").clientWidth,
        previewWidth: preview.clientWidth,
        stageWidth: document.querySelector(".stage").clientWidth,
        frameRectWidth: document.querySelector(".canvas-frame").getBoundingClientRect().width,
        panelGap: parsePixels(getComputedStyle(tools).gap),
        panelInset: parsePixels(getComputedStyle(document.querySelector(".side-panels .panel-summary")).paddingTop),
        fieldInset: parsePixels(getComputedStyle(document.querySelector(".side-panels .field")).paddingTop),
        buttonPaddingTop: parsePixels(getComputedStyle(document.querySelector(".header-actions button:not([hidden])")).paddingTop),
        buttonPaddingInline: parsePixels(getComputedStyle(document.querySelector(".header-actions button:not([hidden])")).paddingLeft),
        buttonHeight: document.querySelector(".header-actions button:not([hidden])").getBoundingClientRect().height,
      };
      });
      assert.ok(layout.previewClient > 0 && layout.previewScroll > layout.previewClient, JSON.stringify(layout));
      assert.ok(layout.toolsClient > 0 && layout.toolsScroll > layout.toolsClient, JSON.stringify(layout));
      assert.ok(layout.previewColumnRatio > 0.58, `phone landscape should give the preview most of the width: ${JSON.stringify(layout)}`);
      assert.ok(layout.frameRectWidth >= (layout.stageWidth - 40) * 0.98, `preview frame should fill the stage content width: ${JSON.stringify(layout)}`);
      assert.ok(layout.canvasFrameWidth > viewport.width * 0.5, `preview should use the available phone width: ${JSON.stringify(layout)}`);
      assert.ok(layout.panelGap <= 6, `phone landscape panel gaps should be compact: ${JSON.stringify(layout)}`);
      assert.ok(layout.panelInset <= 8 && layout.fieldInset <= 6, `phone landscape insets should be compact: ${JSON.stringify(layout)}`);
      assert.ok(layout.buttonPaddingTop <= 7 && layout.buttonPaddingInline === 16, `phone landscape buttons should use compact padding: ${JSON.stringify(layout)}`);
      assert.ok(layout.buttonHeight >= 38, `phone landscape buttons should retain a touch-friendly height: ${JSON.stringify(layout)}`);
      assert.equal(layout.projectVisible, true);
      assert.equal(layout.projectUnderPreview, true);
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    await closeServer(server);
  }
});
