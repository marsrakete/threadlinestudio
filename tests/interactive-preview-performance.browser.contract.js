"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const sharp = require("sharp");
const { chromium } = require("@playwright/test");
const test = require("node:test");
const root = path.resolve(__dirname, "..");
const imageDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j2ioAAAAASUVORK5CYII=";

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

test("slider previews use fewer pixels while dragging and restore quality before the next frame", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    await context.addInitScript(dataUrl => {
      localStorage.setItem("threadline-studio-project-state", JSON.stringify({ source: { dataUrl: "", fileName: "", mimeType: "" } }));
      localStorage.setItem("threadline-studio-project-source", JSON.stringify({ dataUrl, fileName: "preview.png", mimeType: "image/png" }));
    }, imageDataUrl);
    const page = await context.newPage();
    await page.goto(url + "/index.html", { waitUntil: "load" });
    await page.waitForFunction(() => document.querySelector("#projectMetaText")?.textContent.includes("preview.png"));
    const range = page.locator('input[type="range"][data-group="corrections"]').first();
    await range.waitFor();
    const initial = await page.locator("#previewCanvas").evaluate(canvas => ({ width: canvas.width, height: canvas.height }));
    await range.dispatchEvent("pointerdown", { pointerId: 1, bubbles: true });
    await range.evaluate(input => {
      input.value = input.max;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.waitForFunction(() => {
      const canvas = document.querySelector("#previewCanvas");
      return canvas.width > 0 && canvas.height > 0;
    });
    const dragging = await page.locator("#previewCanvas").evaluate(canvas => ({ width: canvas.width, height: canvas.height }));
    assert.ok(dragging.width < initial.width * 0.7, `expected reduced preview width, got ${dragging.width} from ${initial.width}`);

    const exportWidth = Number(await page.locator("#exportWidthSelect").inputValue());
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#exportButton").click();
    const download = await downloadPromise;
    const image = await sharp(await download.path()).metadata();
    assert.equal(image.width, exportWidth);
    assert.equal(image.height, exportWidth);

    await range.dispatchEvent("pointerup", { pointerId: 1, bubbles: true });
    await page.waitForFunction(width => document.querySelector("#previewCanvas").width > width, dragging.width);
    const restored = await page.locator("#previewCanvas").evaluate(canvas => ({ width: canvas.width, height: canvas.height }));
    assert.ok(restored.width > dragging.width);
    assert.ok(restored.height > dragging.height);
  } finally {
    if (browser) await browser.close();
    await closeServer(server);
  }
});
