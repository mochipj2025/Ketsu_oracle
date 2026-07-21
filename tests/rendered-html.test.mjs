import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("builds a standalone static oracle app", async () => {
  const html = await readFile(new URL("../dist-pages/index.html", import.meta.url), "utf8");
  assert.match(html, /<title>尻ノ間｜3Dオラクル・プロトタイプ<\/title>/i);
  assert.match(html, /<div id="root"><\/div>/i);
  await access(new URL("../dist-pages/decks/manifest.json", import.meta.url));
  await access(new URL("../dist-pages/decks/ketsu-six-prototype/01-tokowaka-momoki-hime.webp", import.meta.url));
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
  assert.match(engine, /publicAsset/);
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
