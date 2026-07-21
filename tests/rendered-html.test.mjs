import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the oracle room shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  assert.match(html, /<title>尻ノ間｜3Dオラクル・プロトタイプ<\/title>/i);
  assert.match(html, /神域を整えています/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps engine, deck data, and themes independently replaceable", async () => {
  const [engine, css, manifest, sixCards, ketsu, kikorot] = await Promise.all([
    readFile(new URL("../app/oracle-room.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/decks/manifest.json", import.meta.url), "utf8"),
    readFile(new URL("../public/decks/ketsu-six-prototype/deck.json", import.meta.url), "utf8"),
    readFile(new URL("../public/decks/ketsu-placeholder/deck.json", import.meta.url), "utf8"),
    readFile(new URL("../public/decks/kikorot-sample/deck.json", import.meta.url), "utf8"),
  ]);

  assert.match(engine, /shuffleAndDraw/);
  assert.match(engine, /drawCount/);
  assert.match(engine, /selectOption|<select/);
  assert.match(css, /\.phase-shuffling/);
  assert.match(css, /prefers-reduced-motion/);
  assert.deepEqual(JSON.parse(manifest).decks.map((deck) => deck.id), ["ketsu-six-prototype", "ketsu-placeholder", "kikorot-sample"]);
  assert.equal(JSON.parse(manifest).defaultDeck, "ketsu-six-prototype");
  assert.equal(JSON.parse(sixCards).cards.length, 6);
  assert.equal(JSON.parse(ketsu).cards.length, 12);
  assert.equal(JSON.parse(kikorot).cards.length, 6);
});
