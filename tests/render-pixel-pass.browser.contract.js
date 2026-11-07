"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
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

async function flushAnimationFrames(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function setRangeValue(page, selector, value) {
  await page.locator(selector).evaluate((input, nextValue) => {
    input.value = String(nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

test("simple correction and finish effects share a single pixel read", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addInitScript(dataUrl => {
      localStorage.setItem("threadline-studio-project-state", JSON.stringify({ source: { dataUrl: "", fileName: "", mimeType: "" } }));
      localStorage.setItem("threadline-studio-project-source", JSON.stringify({ dataUrl, fileName: "pixel-pass.png", mimeType: "image/png" }));
    }, imageDataUrl);
    const page = await context.newPage();
    await page.goto(url + "/index.html", { waitUntil: "load" });
    await page.waitForFunction(() => document.querySelector("#projectMetaText")?.textContent.includes("pixel-pass.png"));
    await flushAnimationFrames(page);

    await page.evaluate(() => {
      const prototype = CanvasRenderingContext2D.prototype;
      window.__originalGetImageData = prototype.getImageData;
      window.__pixelReadCount = 0;
      prototype.getImageData = function (...args) {
        window.__pixelReadCount += 1;
        return window.__originalGetImageData.apply(this, args);
      };
    });
    const brightness = 'input[type="range"][data-group="corrections"][data-key="brightness"]';
    const vignette = 'input[type="range"][data-group="atmosphere"][data-key="vignette"]';
    const blur = 'input[type="range"][data-group="corrections"][data-key="blur"]';
    await page.locator(brightness).dispatchEvent("pointerdown", { pointerId: 1, bubbles: true });
    await flushAnimationFrames(page);
    await page.evaluate(() => { window.__pixelReadCount = 0; });
    await page.evaluate(() => {
      const setValue = (selector, value) => {
        const input = document.querySelector(selector);
        input.value = String(value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      };
      setValue('input[type="range"][data-group="corrections"][data-key="brightness"]', 18);
      setValue('input[type="range"][data-group="atmosphere"][data-key="vignette"]', 45);
    });
    await flushAnimationFrames(page);
    assert.equal(await page.evaluate(() => window.__pixelReadCount), 1);

    await page.evaluate(() => { window.__pixelReadCount = 0; });
    await setRangeValue(page, blur, 5);
    await flushAnimationFrames(page);
    assert.equal(await page.evaluate(() => window.__pixelReadCount), 2);

    await page.locator(brightness).dispatchEvent("pointerup", { pointerId: 1, bubbles: true });
    await page.evaluate(() => {
      CanvasRenderingContext2D.prototype.getImageData = window.__originalGetImageData;
      const canvas = document.querySelector("#previewCanvas");
      const pixel = canvas.getContext("2d").getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data;
      window.__centerAlpha = pixel[3];
    });
    assert.equal(await page.evaluate(() => window.__centerAlpha), 255);
  } finally {
    if (browser) await browser.close();
    await closeServer(server);
  }
});
