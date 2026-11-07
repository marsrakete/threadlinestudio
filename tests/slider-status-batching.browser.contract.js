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

test("rapid slider input updates project status once with the latest revision", async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url + "/index.html", { waitUntil: "load" });
    await page.waitForFunction(() => document.querySelector("#versionText")?.textContent.includes("Revision r0"));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.evaluate(() => {
      const status = document.querySelector("#versionText");
      window.__statusMutations = 0;
      new MutationObserver(records => { window.__statusMutations += records.length; })
        .observe(status, { childList: true, characterData: true, subtree: true });
    });

    const slider = 'input[type="range"][data-group="corrections"]';
    await page.locator(slider).first().evaluate(input => {
      for (let value = 1; value <= 12; value += 1) {
        input.value = String(value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

    assert.equal(await page.evaluate(() => window.__statusMutations), 1);
    assert.match(await page.locator("#versionText").textContent(), /Revision r12$/);
  } finally {
    if (browser) await browser.close();
    await closeServer(server);
  }
});
