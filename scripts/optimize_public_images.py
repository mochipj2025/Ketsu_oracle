"""Create lightweight WebP copies of the public card artwork."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]

ASSETS = [
    *(f"public/decks/kikorot-sample/{name}.png" for name in [0, 1, 2, 3, 4, 5, "back"]),
    "public/decks/ketsu-placeholder/back-v1.png",
    "public/decks/ketsu-placeholder/crest.png",
    *(f"public/decks/ketsu-six-prototype/{name}.png" for name in [
        "01-tokowaka-momoki-hime",
        "02-furukawa",
        "03-furui-ketsu-o-nuge",
        "04-susaraizuchi-no-mikoto",
        "05-nomikonda-ikazuchi",
        "06-ketsu-ni-ikazuchi",
    ]),
    "public/rooms/ketsu/shiri-no-ma-background-v1.png",
]


def main() -> None:
    before = 0
    after = 0
    for relative in ASSETS:
        source = ROOT / relative
        target = source.with_suffix(".webp")
        with Image.open(source) as image:
            image.save(target, "WEBP", quality=88, method=6)
        before += source.stat().st_size
        after += target.stat().st_size
        print(f"{source.name}: {source.stat().st_size:,} -> {target.stat().st_size:,}")

    print(f"total: {before:,} -> {after:,} bytes")


if __name__ == "__main__":
    main()
