"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const sharp = require("sharp");
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

test("large originals are downsampled once for preview and stay full size for export", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    const png = await sharp({
      create: { width: 4000, height: 3000, channels: 3, background: { r: 85, g: 145, b: 205 } },
    }).png().toBuffer();
    const dataUrl = "data:image/png;base64," + png.toString("base64");
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    await context.addInitScript(source => {
      window.__largeSourceDraws = [];
      const original = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (image, ...args) {
        const sourceWidth = image.naturalWidth || image.videoWidth || image.width || 0;
        const sourceHeight = image.naturalHeight || image.videoHeight || image.height || 0;
        if (sourceWidth > this.canvas.width || sourceHeight > this.canvas.height) {
          window.__largeSourceDraws.push({ sourceWidth, sourceHeight, targetWidth: this.canvas.width, targetHeight: this.canvas.height });
        }
        return original.call(this, image, ...args);
      };
      localStorage.setItem("threadline-studio-project-state", JSON.stringify({ source: { dataUrl: "", fileName: "", mimeType: "" } }));
      localStorage.setItem("threadline-studio-project-source", JSON.stringify({ dataUrl: source, fileName: "large.png", mimeType: "image/png" }));
    }, dataUrl);
    const page = await context.newPage();
    await page.goto(url + "/index.html", { waitUntil: "load" });
    await page.waitForFunction(() => document.querySelector("#projectMetaText")?.textContent.includes("large.png"));
    await page.waitForFunction(() => window.__largeSourceDraws.length >= 1);

    const initialDraws = await page.evaluate(() => window.__largeSourceDraws.slice());
    assert.deepEqual(initialDraws[0], { sourceWidth: 4000, sourceHeight: 3000, targetWidth: 1280, targetHeight: 960 });

    const brightness = page.locator('input[type="range"][data-group="corrections"][data-key="brightness"]');
    await brightness.evaluate(input => {
      input.value = "20";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.evaluate(() => window.__largeSourceDraws.length), 1);

    const width = Number(await page.locator("#exportWidthSelect").inputValue());
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#exportButton").click();
    const download = await downloadPromise;
    const metadata = await sharp(await download.path()).metadata();
    assert.equal(metadata.width, width);
    assert.equal(metadata.height, Math.round(width * 3000 / 4000));
    assert.equal(await page.evaluate(() => window.__largeSourceDraws.at(-1).sourceWidth), 4000);
  } finally {
    if (browser) await browser.close();
    await closeServer(server);
  }
});
