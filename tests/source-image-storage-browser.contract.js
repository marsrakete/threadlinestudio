"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("@playwright/test");
const test = require("node:test");
const root = path.resolve(__dirname, "..");
const pngDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j2ioAAAAASUVORK5CYII=";

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const url = new URL(request.url, "http://127.0.0.1");
      const file = path.resolve(root, "." + decodeURIComponent(url.pathname));
      if (!file.startsWith(root + path.sep)) {
        response.writeHead(403); response.end(); return;
      }
      fs.readFile(file, (error, bytes) => {
        if (error) { response.writeHead(404); response.end(); return; }
        const types = { ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
        response.writeHead(200, { "content-type": types[path.extname(file)] || "text/html" });
        response.end(bytes);
      });
    });
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve({ server, url: "http://127.0.0.1:" + server.address().port }));
  });
}

async function closeServer(server) {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

function seededProject() {
  return { source: { dataUrl: "", fileName: "", mimeType: "" } };
}

test("automatically migrates legacy source image to IndexedDB", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ locale: "de-DE" });
    await context.addInitScript(({ project, source, dataUrl }) => {
      localStorage.setItem("threadline-studio-project-state", JSON.stringify(project));
      localStorage.setItem("threadline-studio-project-source", JSON.stringify({ ...source, dataUrl }));
    }, { project: seededProject(), source: { fileName: "alt.png", mimeType: "image/png" }, dataUrl: pngDataUrl });
    const page = await context.newPage();
    await page.goto(url + "/index.html", { waitUntil: "load" });
    await page.waitForFunction(() => !localStorage.getItem("threadline-studio-project-source"));
    await page.waitForFunction(() => document.querySelector("#projectMetaText")?.textContent.includes("alt.png"));
    const record = await page.evaluate(() => new Promise((resolve, reject) => {
      const request = indexedDB.open("threadline-studio-source");
      request.onsuccess = () => {
        const db = request.result, tx = db.transaction("images", "readonly");
        const get = tx.objectStore("images").get("current");
        get.onsuccess = () => { const value = get.result; db.close(); resolve(value && { name: value.fileName, type: value.mimeType, isBlob: value.blob instanceof Blob, size: value.blob.size }); };
        get.onerror = () => reject(get.error);
      };
      request.onerror = () => reject(request.error);
    }));
    assert.deepEqual(record, { name: "alt.png", type: "image/png", isBlob: true, size: 68 });
    assert.equal(await page.evaluate(() => localStorage.getItem("threadline-studio-project-state").includes("data:image")), false);
  } finally {
    if (browser) await browser.close();
    await closeServer(server);
  }
});

test("keeps legacy source data and displays the image when IndexedDB is unavailable", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ locale: "de-DE" });
    await context.addInitScript(({ project, source, dataUrl }) => {
      Object.defineProperty(window, "indexedDB", { configurable: true, value: undefined });
      localStorage.setItem("threadline-studio-project-state", JSON.stringify(project));
      localStorage.setItem("threadline-studio-project-source", JSON.stringify({ ...source, dataUrl }));
    }, { project: seededProject(), source: { fileName: "alt.png", mimeType: "image/png" }, dataUrl: pngDataUrl });
    const page = await context.newPage();
    page.on("dialog", dialog => dialog.accept());
    await page.goto(url + "/index.html", { waitUntil: "load" });
    await page.waitForFunction(() => document.querySelector("#projectMetaText")?.textContent.includes("alt.png"));
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("threadline-studio-project-source")).dataUrl), pngDataUrl);
    assert.equal(await page.locator("#emptyState").isVisible(), false);
  } finally {
    if (browser) await browser.close();
    await closeServer(server);
  }
});
