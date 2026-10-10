"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("@playwright/test");
const test = require("node:test");
const repositoryRoot = path.resolve(__dirname, "..");

/** Serves repository files for a browser consumer test and returns its local URL.
 * @returns {Promise<{server: import('node:http').Server, url: string}>} Started static server and root URL.
 */
function startConsumerServer() {
  return new Promise(function startServerPromise(resolve, reject) {
    const server = http.createServer(function serveRepositoryFile(request, response) {
      const requestUrl = new URL(request.url, "http://127.0.0.1");
      const filePath = path.resolve(repositoryRoot, "." + decodeURIComponent(requestUrl.pathname));
      if (!filePath.startsWith(repositoryRoot + path.sep) && filePath !== repositoryRoot) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      fs.readFile(filePath, function onFileRead(error, contents) {
        if (error) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        response.writeHead(200, { "content-type": filePath.endsWith(".js") ? "text/javascript" : "text/html" });
        response.end(contents);
      });
    });
    server.once("error", reject);
    server.listen(0, "127.0.0.1", function onServerListening() {
      const address = server.address();
      resolve({ server, url: "http://127.0.0.1:" + address.port });
    });
  });
}

test("standalone browser consumer loads library from checkout without page errors", async function () {
  const { server, url } = await startConsumerServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", function collectPageError(error) {
      pageErrors.push(error.message);
    });
    await page.goto(url + "/tests/fixtures/repository-consumer/browser.html?libraryBase=/packages/threadline-filters/", {
      waitUntil: "load",
    });
    await page.getByText("Pixel-Filter und Pride-Overlay aus externem Git-Checkout geladen.").waitFor();
    const status = await page.locator("#status").textContent();
    const canvasHasImage = await page.locator("#preview").evaluate(function checkCanvas(canvas) {
      const context = canvas.getContext("2d");
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      return pixels.some(function isNonZero(value) { return value !== 0; });
    });
    assert.match(status, /pixel, campaigns/);
    assert.equal(canvasHasImage, true);
    assert.deepEqual(pageErrors, []);
  } finally {
    if (browser) {
      await browser.close();
    }
    await new Promise(function closeServer(resolve, reject) {
      server.close(function onServerClosed(error) {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
});

test("Threadline Studio initializes through the unified filter factory", async function () {
  const { server, url } = await startConsumerServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", function collectPageError(error) {
      pageErrors.push(error.message);
    });
    await page.goto(url + "/index.html", { waitUntil: "load" });
    await page.waitForFunction(function appHasInitialized() {
      return document.querySelector("#versionText") && document.querySelector("#versionText").textContent.includes("App 0.2.73");
    });
    const factoryState = await page.evaluate(function readFactoryState() {
      return {
        initialized: Boolean(window.ThreadlineFilterFactory),
        projectHeading: document.querySelector('[data-i18n="projectTitle"]')?.textContent.trim(),
        uploadAvailable: Boolean(document.querySelector("#imageInput")),
        version: document.querySelector("#versionText")?.textContent || "",
      };
    });
    assert.equal(factoryState.initialized, true);
    assert.equal(factoryState.projectHeading, "Projekt");
    assert.equal(factoryState.uploadAvailable, true);
    assert.match(factoryState.version, /App 0\.2\.73/);
    assert.deepEqual(pageErrors, []);
  } finally {
    if (browser) {
      await browser.close();
    }
    await new Promise(function closeServer(resolve, reject) {
      server.close(function onServerClosed(error) {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
});
