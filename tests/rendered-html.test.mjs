import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("builds a standalone static oracle app", async () => {
  const html = await readFile(new URL("../dist-pages/index.html", import.meta.url), "utf8");
  assert.match(html, /<title>尻ノ間｜ケツオラクル 第一神殿<\/title>/i);
  assert.match(html, /<div id="root"><\/div>/i);
  await access(new URL("../dist-pages/decks/manifest.json", import.meta.url));
  await access(new URL("../dist-pages/decks/ketsu-first-shrine/01-tokowaka-momoki-hime.webp", import.meta.url));
  await access(new URL("../dist-pages/decks/ketsu-first-shrine/18-ketsu-no-muki-o-kimeyo.webp", import.meta.url));
});

test("keeps GitHub Pages source separate from the generated root page", async () => {
  const source = await readFile(new URL("../web/index.html", import.meta.url), "utf8");
  assert.match(source, /src="\/src\/main\.tsx"/);
});

test("keeps engine, deck data, and themes independently replaceable", async () => {
  const [engine, css, manifest, firstShrine, ketsu, kikorot] = await Promise.all([
    readFile(new URL("../app/oracle-room.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/decks/manifest.json", import.meta.url), "utf8"),
    readFile(new URL("../public/decks/ketsu-first-shrine/deck.json", import.meta.url), "utf8"),
    readFile(new URL("../public/decks/ketsu-placeholder/deck.json", import.meta.url), "utf8"),
    readFile(new URL("../public/decks/kikorot-sample/deck.json", import.meta.url), "utf8"),
  ]);

  assert.match(engine, /shuffleAndDraw/);
  assert.match(engine, /shuffleCards/);
  assert.match(engine, /publicAsset/);
  assert.match(engine, /drawCount/);
  assert.match(engine, /selectOption|<select/);
  assert.match(css, /\.phase-shuffling/);
  assert.match(css, /prefers-reduced-motion/);
  assert.deepEqual(JSON.parse(manifest).decks.map((deck) => deck.id), ["ketsu-first-shrine", "ketsu-placeholder", "kikorot-sample"]);
  assert.equal(JSON.parse(manifest).defaultDeck, "ketsu-first-shrine");
  assert.equal(JSON.parse(firstShrine).cards.length, 18);
  assert.equal(new Set(JSON.parse(firstShrine).cards.map((card) => card.id)).size, 18);
  assert.deepEqual(
    Object.fromEntries(["divine", "shadow", "action"].map((category) => [category, JSON.parse(firstShrine).cards.filter((card) => card.category === category).length])),
    { divine: 6, shadow: 6, action: 6 },
  );
  assert.equal(JSON.parse(ketsu).cards.length, 12);
  assert.equal(JSON.parse(kikorot).cards.length, 6);
});
