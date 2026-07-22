"use client";

import { CSSProperties, PointerEvent, useCallback, useEffect, useRef, useState } from "react";

type DeckSummary = { id: string; label: string; description: string };
type Manifest = { defaultDeck: string; decks: DeckSummary[] };
type OracleCard = {
  id: string;
  number: string;
  name: string;
  deity: string;
  category?: "divine" | "shadow" | "action";
  categoryLabel?: string;
  yamato?: string;
  rune?: string;
  reading?: string;
  action?: string;
  symbol?: string;
  image?: string;
  keywords: string[];
  message: string;
  palette?: string;
};
type Deck = {
  id: string;
  name: string;
  roomName: string;
  eyebrow: string;
  tagline: string;
  intro: string;
  theme: "ketsu" | "kikorot";
  backImage: string;
  emblemImage?: string;
  roomImage?: string;
  jumpChance: number;
  allowReversed: boolean;
  cards: OracleCard[];
};
type DrawnCard = OracleCard & { reversed: boolean; position: string; jumped?: boolean };
type Phase = "idle" | "shuffling" | "dealing" | "revealed";

const positions: Record<1 | 3, string[]> = {
  1: ["いま必要な神託"],
  3: ["過去からの荷物", "いま座る場所", "次に上げる腰"],
};

const stack = Array.from({ length: 14 }, (_, index) => index);
const scatterHeights = [-132, -36, 78, -102, 118, -58, 24, -124, 88, -18, 126, -76, 46, -112];
const crossingHeights = [42, -106, 94, -46, 116, -132, 62, -82, 128, -20, 76, -118, 22, -64];
const burstHeights = [-35, -18, 8, -30, 27, -6, 20, -33, 11, 31, -22, 15, -28, 25];
const SHUFFLE_TO_DEAL_MS = 3800;
const DEAL_TO_REVEAL_MS = 4650;

function publicAsset(path: string) {
  return new URL(path.replace(/^\//, ""), document.baseURI).toString();
}

function shuffleCards<T>(cards: readonly T[]) {
  const shuffled = [...cards];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!];
  }
  return shuffled;
}

function cardMotion(index: number): CSSProperties {
  const distance = index - (stack.length - 1) / 2;
  const scatterX = distance * 42;
  const crossX = distance * -34;
  const direction = index % 2 === 0 ? -1 : 1;
  const orbitAngle = (index / stack.length) * Math.PI * 2;
  const orbitX = Math.sin(orbitAngle) * 41;
  const orbitY = Math.cos(orbitAngle) * 30;
  const cutX = direction * (27 + (index % 3) * 3.5);
  const cutY = (Math.floor(index / 2) - 3) * 4.4;
  const feedX = direction * (10 + (index % 3) * 1.5);

  return {
    "--card-index": index,
    "--scatter-x": `${scatterX}px`,
    "--scatter-y": `${scatterHeights[index]}px`,
    "--scatter-z": `${80 + (index % 5) * 34}px`,
    "--scatter-spin": `${direction * (12 + (index % 4) * 7)}deg`,
    "--scatter-yaw": `${distance * 5}deg`,
    "--scatter-tilt": `${direction * (10 + (index % 3) * 6)}deg`,
    "--cross-x": `${crossX}px`,
    "--cross-y": `${crossingHeights[index]}px`,
    "--mobile-scatter-x": `${scatterX * 0.48}px`,
    "--mobile-scatter-y": `${scatterHeights[index] * 0.62}px`,
    "--mobile-cross-x": `${crossX * 0.5}px`,
    "--mobile-cross-y": `${crossingHeights[index] * 0.62}px`,
    "--burst-x": `${distance * 6.45}vw`,
    "--burst-y": `${burstHeights[index]}vh`,
    "--orbit-x": `${orbitX}vw`,
    "--orbit-y": `${orbitY}vh`,
    "--cut-x": `${cutX}vw`,
    "--cut-y": `${cutY}vh`,
    "--feed-x": `${feedX}vw`,
    "--feed-y": `${distance * 1.55}vh`,
    "--interleave-x": `${direction * 16}px`,
    "--interleave-y": `${distance * -3.2}px`,
    "--settle-z": `${index * 2.4}px`,
    "--whirl-one": `${direction * (170 + index * 14)}deg`,
    "--whirl-two": `${direction * (520 + index * 18)}deg`,
    "--whirl-three": `${direction * (760 + index * 16)}deg`,
    "--whirl-four": `${direction * (990 + index * 13)}deg`,
    "--whirl-finish": `${direction * 1440}deg`,
    "--shuffle-yaw": `${distance * 7}deg`,
    "--shuffle-tilt": `${direction * (15 + (index % 3) * 7)}deg`,
    "--mobile-burst-x": `${distance * 5.1}vw`,
    "--mobile-burst-y": `${burstHeights[index] * 0.82}vh`,
    "--mobile-orbit-x": `${orbitX * 0.82}vw`,
    "--mobile-orbit-y": `${orbitY * 0.82}vh`,
    "--mobile-cut-x": `${cutX * 0.72}vw`,
    "--mobile-cut-y": `${cutY * 0.72}vh`,
  } as CSSProperties;
}

export default function OracleRoom() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [entered, setEntered] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [drawCount, setDrawCount] = useState<1 | 3>(1);
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [isChangingDeck, setIsChangingDeck] = useState(false);
  const timers = useRef<number[]>([]);

  const loadDeck = useCallback(async (id: string) => {
    setIsChangingDeck(true);
    setDrawn([]);
    setPhase("idle");
    const response = await fetch(publicAsset(`decks/${id}/deck.json`));
    if (!response.ok) throw new Error(`Deck load failed: ${id}`);
    const nextDeck = (await response.json()) as Deck;
    setDeck(nextDeck);
    nextDeck.cards.forEach((card) => {
      if (!card.image) return;
      const image = new Image();
      image.src = publicAsset(card.image);
    });
    setIsChangingDeck(false);
  }, []);

  useEffect(() => {
    let active = true;
    const scheduledTimers = timers.current;
    fetch(publicAsset("decks/manifest.json"))
      .then((response) => response.json())
      .then(async (nextManifest: Manifest) => {
        if (!active) return;
        setManifest(nextManifest);
        await loadDeck(nextManifest.defaultDeck);
      });
    return () => {
      active = false;
      scheduledTimers.forEach(window.clearTimeout);
    };
  }, [loadDeck]);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;
    event.currentTarget.style.setProperty("--look-x", `${x * 1.6}deg`);
    event.currentTarget.style.setProperty("--look-y", `${y * -1.1}deg`);
    event.currentTarget.style.setProperty("--glow-x", `${50 + x * 12}%`);
  };

  const shuffleAndDraw = () => {
    if (!deck || phase === "shuffling" || phase === "dealing") return;
    timers.current.forEach(window.clearTimeout);
    setDrawn([]);
    setPhase("shuffling");

    const shuffled = shuffleCards(deck.cards);
    const jump = Math.random() < deck.jumpChance;
    const selected: DrawnCard[] = shuffled.slice(0, drawCount).map((card, index) => ({
      ...card,
      reversed: deck.allowReversed && Math.random() < 0.34,
      position: positions[drawCount][index],
      jumped: jump && index === 0,
    }));

    timers.current.push(
      window.setTimeout(() => setPhase("dealing"), SHUFFLE_TO_DEAL_MS),
      window.setTimeout(() => {
        setDrawn(selected);
        setPhase("revealed");
      }, DEAL_TO_REVEAL_MS),
    );
  };

  if (!deck || !manifest) {
    return (
      <main className="loading-screen" aria-live="polite">
        <span className="loading-mark">尻</span>
        <p>神域を整えています</p>
      </main>
    );
  }

  return (
    <main
      className={`oracle-app theme-${deck.theme} phase-${phase}`}
      onPointerMove={handlePointerMove}
      data-entered={entered}
    >
      <div
        className="room"
        aria-hidden="true"
        style={deck.roomImage ? { "--room-image": `url(${publicAsset(deck.roomImage)})` } as CSSProperties : undefined}
      >
        <div className="room-sky" />
        {deck.emblemImage && <img className="room-emblem" src={publicAsset(deck.emblemImage)} alt="" width={112} height={112} />}
        <div className="moon-disc" />
        <div className="far-mountains mountain-left" />
        <div className="far-mountains mountain-right" />
        <div className="shoji shoji-left"><i /><i /><i /><i /></div>
        <div className="shoji shoji-right"><i /><i /><i /><i /></div>
        <div className="sacred-rope"><i /><i /><i /><i /><i /></div>
        <div className="floor-grid" />
        <div className="mist mist-one" />
        <div className="mist mist-two" />
        <div className="embers">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ "--i": i, left: `${(i * 37) % 100}%` } as CSSProperties} />)}</div>
      </div>

      <header className="topbar">
        <div className="brand-lockup">
          <span className="mini-mon">尻</span>
          <div>
            <p>{deck.eyebrow}</p>
            <h1>{deck.roomName}</h1>
          </div>
        </div>
        <label className="deck-switcher">
          <span>デッキ</span>
          <select
            value={deck.id}
            disabled={phase === "shuffling" || phase === "dealing" || isChangingDeck}
            onChange={(event) => loadDeck(event.target.value)}
            aria-label="使用するデッキ"
          >
            {manifest.decks.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
      </header>

      <section className="ritual-stage" aria-label="カードを引く場所">
        <div className="stage-copy">
          <p className="stage-kicker">{phase === "revealed" ? "THE ORACLE HAS SPOKEN" : "MAKE SPACE FOR THE ANSWER"}</p>
          <h2>{phase === "revealed" ? "神託、降りる。" : deck.tagline}</h2>
          <p>{phase === "revealed" ? "軽くなる言葉だけ、持って帰ってください。" : deck.intro}</p>
        </div>

        <div className="altar-scene">
          <div className="halo-rings"><i /><i /><i /></div>
          <div className="card-space">
            <div className="deck-stack" aria-hidden="true">
              {stack.map((index) => (
                <div className="stack-card" key={index} style={cardMotion(index)}>
                  <CardBack deck={deck} />
                </div>
              ))}
            </div>

            {phase === "dealing" && (
              <div className={`dealing-cards count-${drawCount}`} aria-hidden="true">
                {Array.from({ length: drawCount }, (_, index) => (
                  <div className="dealing-card" key={index} style={{ "--deal-index": index } as CSSProperties}>
                    <CardBack deck={deck} />
                  </div>
                ))}
              </div>
            )}

            {drawn.length > 0 && (
              <div className={`reading-grid count-${drawCount}`} aria-live="polite">
                {drawn.map((card, index) => <ReadingCard key={card.id} card={card} index={index} />)}
              </div>
            )}
          </div>
          <div className="altar-table"><span /></div>
        </div>

        <div className="ritual-controls">
          <div className="draw-toggle" role="group" aria-label="引く枚数">
            <button className={drawCount === 1 ? "active" : ""} onClick={() => setDrawCount(1)} disabled={phase !== "idle" && phase !== "revealed"}>一枚引き</button>
            <button className={drawCount === 3 ? "active" : ""} onClick={() => setDrawCount(3)} disabled={phase !== "idle" && phase !== "revealed"}>三枚引き</button>
          </div>
          <button className="shuffle-button" onClick={shuffleAndDraw} disabled={phase === "shuffling" || phase === "dealing"}>
            <span className="button-sigil">✦</span>
            <span>{phase === "shuffling" ? "全域でカードを切っています" : phase === "dealing" ? "一枚、こちらへ" : phase === "revealed" ? "もう一度、混ぜる" : "カードを混ぜる"}</span>
          </button>
          <p className="control-note">カードに触れる代わりに、問いをひとつ心に置く。</p>
        </div>
      </section>

      {!entered && (
        <section className="threshold" aria-label="尻ノ間への入口">
          <div className="threshold-door left" />
          <div className="threshold-door right" />
          <div className="threshold-content">
            <img src={publicAsset(deck.emblemImage ?? deck.backImage)} alt="ケツ印の家紋" width={190} height={190} />
            <p>此処より先、{deck.roomName}</p>
            <h2>重いものを<br />ひとつ置いてゆけ。</h2>
            <button onClick={() => setEntered(true)}>{deck.roomName}へ入る <span>→</span></button>
            <small>音は出ません・いつでも戻れます</small>
          </div>
        </section>
      )}

      <footer>
        <p>FIRST SHRINE — CSS 3D / DATA-DRIVEN DECK</p>
        <button onClick={() => setEntered(false)}>入口へ戻る</button>
      </footer>
    </main>
  );
}

function CardBack({ deck }: { deck: Deck }) {
  return (
    <div className="card-back">
      <div className="back-frame">
        <img className="back-art" src={publicAsset(deck.backImage)} alt="" width={180} height={180} />
        {deck.emblemImage && <img className="back-emblem" src={publicAsset(deck.emblemImage)} alt="" width={140} height={140} />}
        <span>{deck.name}</span>
      </div>
    </div>
  );
}

function ReadingCard({ card, index }: { card: DrawnCard; index: number }) {
  const categoryClass = card.category ? `category-${card.category}` : "category-legacy";

  return (
    <article className="reading-item" style={{ "--result-index": index } as CSSProperties}>
      <p className="card-position">{card.position}</p>
      {card.jumped && <span className="jump-badge">跳び出し</span>}
      <div className="flip-card">
        <div className="flip-inner">
          <div className="result-back"><span>✦</span></div>
          <div className={`result-front palette-${card.palette ?? "image"} ${categoryClass}`}>
            {card.image ? (
              <>
                <img className={`card-art ${card.reversed ? "reversed" : ""}`} src={publicAsset(card.image)} alt={`${card.name}のカード`} />
                {card.category && (
                  <div className="oracle-face" aria-hidden="true">
                    <div className="face-topline">
                      <span>{card.number}</span>
                      <b>{card.categoryLabel}</b>
                      <span className="face-rune">{card.rune}</span>
                    </div>
                    <div className="face-title">
                      <small>{card.yamato} · {card.deity}</small>
                      <strong>{card.name}</strong>
                      <p>{card.reading}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="card-number">{card.number}</span>
                <div className="painted-field"><i /><strong>{card.symbol}</strong><i /></div>
                <div className="card-title"><small>{card.deity}</small><b>{card.name}</b></div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="reading-copy">
        <div className="reading-heading">
          <div><small>{card.categoryLabel ? `${card.categoryLabel} · ` : ""}{card.deity}</small><h3>{card.name}{card.reversed ? "・逆位置" : ""}</h3></div>
          <span>{card.number}</span>
        </div>
        <div className="keywords">{card.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
        {card.reading && <strong className="oracle-reading">{card.reading}</strong>}
        <p>{card.message}</p>
        {card.action && <p className="today-step"><span>今日の一歩</span>{card.action}</p>}
      </div>
    </article>
  );
}
