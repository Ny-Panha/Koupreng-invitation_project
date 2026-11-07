"""Extract the owner-supplied reference; never copy these frames into public assets."""
import argparse
from pathlib import Path
import shutil
import subprocess
from PIL import Image, ImageDraw

TIMES = [0, 6.5, 7, 8, 9, 12, 16, 20, 28, 32, 36, 40, 48, 92, 106, 108, 112, 116, 120, 124]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("video", type=Path)
    parser.add_argument("--out", type=Path, default=Path("docs/design/royal-garden-v4/evidence/reference"))
    args = parser.parse_args()
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        import imageio_ffmpeg
        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    args.out.mkdir(parents=True, exist_ok=True)
    for timestamp in TIMES:
        subprocess.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-ss", str(timestamp), "-i", str(args.video), "-frames:v", "1", "-update", "1", "-y", str(args.out / f"{timestamp:05.1f}.jpg")], check=True)
    sheet = Image.new("RGB", (1200, 1800), "#e9e5dc")
    draw = ImageDraw.Draw(sheet)
    for index, timestamp in enumerate(TIMES):
        with Image.open(args.out / f"{timestamp:05.1f}.jpg") as frame:
            sheet.paste(frame.resize((230, 408)), ((index % 5) * 240, (index // 5) * 450))
        draw.text(((index % 5) * 240 + 5, (index // 5) * 450 + 410), f"{timestamp} s", fill="black")
    sheet.save(args.out / "storyboard.jpg")
    print(f"Extracted {len(TIMES)} reference frames to {args.out}")


if __name__ == "__main__":
    main()
