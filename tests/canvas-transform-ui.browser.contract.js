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
        response.writeHead(403); response.end(); return;
      }
      fs.readFile(file, (error, contents) => {
        if (error) { response.writeHead(404); response.end(); return; }
        const ext = path.extname(file);
        const types = { ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
        response.writeHead(200, { "content-type": types[ext] || "text/html" });
        response.end(contents);
      });
    });
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve({ server, url: "http://127.0.0.1:" + server.address().port }));
  });
}

async function closeServer(server) {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

test("canvas drag updates transform controls without rewriting project status", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(url + "/index.html", { waitUntil: "load" });
    await page.waitForFunction(() => document.querySelector("#versionText")?.textContent.includes("Revision r0"));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.evaluate(() => {
      window.__statusMutations = 0;
      new MutationObserver(records => { window.__statusMutations += records.length; })
        .observe(document.querySelector("#versionText"), { childList: true, characterData: true, subtree: true });
    });

    const frame = await page.locator("#canvasFrame").boundingBox();
    assert.ok(frame);
    const startX = frame.x + frame.width / 2;
    const startY = frame.y + frame.height / 2;
    const initialWidth = await page.locator("#previewCanvas").evaluate(canvas => canvas.width);
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    for (let step = 1; step <= 6; step += 1) {
      await page.mouse.move(startX + step * 12, startY + step * 6);
    }
    await page.waitForFunction(width => document.querySelector("#previewCanvas").width < width * 0.7, initialWidth);

    const panX = Number(await page.locator("#panXInput").inputValue());
    assert.ok(panX > 0.05);
    assert.equal(await page.evaluate(() => window.__statusMutations), 0);

    await page.mouse.up();
    await page.waitForFunction(width => document.querySelector("#previewCanvas").width > width, initialWidth * 0.7);
    assert.equal(await page.evaluate(() => window.__statusMutations), 0);
  } finally {
    if (browser) await browser.close();
    await closeServer(server);
  }
});
