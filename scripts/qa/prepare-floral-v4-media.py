"""Create original, disposable fixtures for the opt-in Floral V4 browser journey.

No third-party footage/audio is downloaded. Requires Pillow and FFmpeg (or
imageio-ffmpeg). Writes only to .cache/floral-v4, never to public assets.
"""
from pathlib import Path
import shutil
import subprocess

from PIL import Image, ImageDraw


def main():
    root = Path(__file__).resolve().parents[2]
    output = root / '.cache/floral-v4'
    output.mkdir(parents=True, exist_ok=True)
    ffmpeg = shutil.which('ffmpeg')
    if not ffmpeg:
        from imageio_ffmpeg import get_ffmpeg_exe
        ffmpeg = get_ffmpeg_exe()
    for extension, codecs in [('mp4', ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac']),
                              ('webm', ['-c:v', 'libvpx', '-c:a', 'libvorbis'])]:
        subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y',
                        '-f', 'lavfi', '-i', 'color=c=0x876326:s=320x480:r=24',
                        '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
                        '-t', '2', *codecs, str(output / f'sample.{extension}')], check=True)
    diagram = Image.new('RGB', (480, 320), '#fffdf8')
    pen = ImageDraw.Draw(diagram)
    pen.line([(20, 160), (440, 160), (440, 60)], fill='#876326', width=12)
    pen.rectangle((350, 35, 455, 105), outline='#876326', width=3)
    pen.text((25, 180), 'FICTIONAL QA VENUE - NOT REAL DIRECTIONS', fill='#463b31')
    diagram.save(output / 'venue.png')
    print('Prepared synthetic MP4, WebM and venue diagram in .cache/floral-v4')


if __name__ == '__main__':
    main()
