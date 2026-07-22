"""Build lightweight 7:12 WebP assets for the public oracle app."""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
CARD_SIZE = (840, 1440)

CARD_ASSETS = {
    "design/characters/tokowaka-momoki-hime/cards/01-divine-v2.png": "01-tokowaka-momoki-hime.webp",
    "design/characters/tokowaka-momoki-hime/cards/02-old-skin-v2.png": "02-furukawa.webp",
    "design/characters/tokowaka-momoki-hime/cards/03-shed-old-self-v2.png": "03-furui-ketsu-o-nuge.webp",
    "design/characters/susaraizuchi/cards/04-divine-v2.png": "04-susaraizuchi-no-mikoto.webp",
    "design/characters/susaraizuchi/cards/05-swallowed-thunder-v2.png": "05-nomikonda-ikazuchi.webp",
    "design/characters/susaraizuchi/cards/06-bring-down-thunder-v2.png": "06-ketsu-ni-ikazuchi.webp",
    "design/characters/tsukishiro-kotoyori-hime/cards/07-divine-v1.png": "07-tsukishiro-kotoyori-hime.webp",
    "design/characters/tsukishiro-kotoyori-hime/cards/08-hundred-voices-v1.png": "08-hyakuno-koe.webp",
    "design/characters/tsukishiro-kotoyori-hime/cards/09-trust-instinct-v1.png": "09-ketsu-no-kan-o-shinjiyo.webp",
    "design/characters/shiobarai-kiyose-hime/cards/10-divine-v1.png": "10-shiobarai-kiyose-hime.webp",
    "design/characters/shiobarai-kiyose-hime/cards/11-taken-murk-v1.png": "11-hikiuketa-nigori.webp",
    "design/characters/shiobarai-kiyose-hime/cards/12-return-the-burden-v1.png": "12-tanin-no-ketsu-made-fukuna.webp",
    "design/characters/musubihi-ori-hime/cards/13-divine-v1.png": "13-musubihi-ori-hime.webp",
    "design/characters/musubihi-ori-hime/cards/14-weaving-alone-v1.png": "14-hitori-ori.webp",
    "design/characters/musubihi-ori-hime/cards/15-team-up-v1.png": "15-ketsu-o-kume.webp",
    "design/characters/yata-michibiki/cards/16-divine-v1.png": "16-yata-michibiki.webp",
    "design/characters/yata-michibiki/cards/17-correct-answer-maze-v1.png": "17-seikai-meikyu.webp",
    "design/characters/yata-michibiki/cards/18-choose-direction-v1.png": "18-ketsu-no-muki-o-kimeyo.webp",
}

PASSTHROUGH_ASSETS = [
    *(f"public/decks/kikorot-sample/{name}.png" for name in [0, 1, 2, 3, 4, 5, "back"]),
    "public/decks/ketsu-placeholder/back-v1.png",
    "public/decks/ketsu-placeholder/crest.png",
    "public/rooms/ketsu/shiri-no-ma-background-v1.png",
]


def save_webp(source: Path, target: Path, *, size: tuple[int, int] | None = None) -> tuple[int, int]:
    with Image.open(source) as opened:
        image = opened.convert("RGB")
        if size:
            image = ImageOps.fit(image, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
        target.parent.mkdir(parents=True, exist_ok=True)
        image.save(target, "WEBP", quality=86, method=6)
    return source.stat().st_size, target.stat().st_size


def main() -> None:
    before = 0
    after = 0
    card_dir = ROOT / "public/decks/ketsu-first-shrine"

    for source_name, target_name in CARD_ASSETS.items():
        source = ROOT / source_name
        target = card_dir / target_name
        source_size, target_size = save_webp(source, target, size=CARD_SIZE)
        before += source_size
        after += target_size
        print(f"{target_name}: {source_size:,} -> {target_size:,} ({CARD_SIZE[0]}x{CARD_SIZE[1]})")

    for relative in PASSTHROUGH_ASSETS:
        source = ROOT / relative
        if not source.exists():
            continue
        target = source.with_suffix(".webp")
        source_size, target_size = save_webp(source, target)
        before += source_size
        after += target_size
        print(f"{target.name}: {source_size:,} -> {target_size:,}")

    print(f"total: {before:,} -> {after:,} bytes")


if __name__ == "__main__":
    main()
