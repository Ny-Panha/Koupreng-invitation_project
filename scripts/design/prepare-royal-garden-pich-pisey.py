"""Prepare the user-supplied Pich/Pisey photos as responsive, metadata-free web assets."""
import argparse
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile
from PIL import Image, ImageOps


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    args = parser.parse_args()
    destination = Path("apps/frontend-user/public/templates/royal-garden/v4/pich-pisey")
    destination.mkdir(parents=True, exist_ok=True)
    with ZipFile(args.archive) as archive:
        names = [name for name in archive.namelist() if name.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))]
        for index, name in enumerate(names, 1):
            # Read pixels only; archive paths never become filesystem output paths.
            with Image.open(BytesIO(archive.read(name))) as source:
                image = ImageOps.exif_transpose(source).convert("RGB")
                for width in [480, 1280] + ([640] if index == 3 else []):
                    resized = image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
                    resized.save(destination / f"photo-{index:02}-{width}.webp", quality=86, method=6)
                print(f"{index:02}: {name} -> responsive WebP")
    print(f"Prepared {len(names)} photos in {destination}")


if __name__ == "__main__":
    main()
