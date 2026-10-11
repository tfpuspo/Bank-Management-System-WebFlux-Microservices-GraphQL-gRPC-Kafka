"""
Make a thumbnail with a play button from a video, at any width and height.

Usage:
    python make_thumb.py VIDEO OUTPUT [SECOND] [WIDTH] [HEIGHT]

Examples:
    python make_thumb.py customer.mp4 customer.png 3 800 800     (square)
    python make_thumb.py customer.mp4 customer.png 3 1280 720    (widescreen)
    python make_thumb.py customer.mp4 customer.png 3 800         (square, 800x800)

Defaults: SECOND=2, WIDTH=800, HEIGHT=same as WIDTH.
Requires: ffmpeg on PATH, and Pillow (pip install pillow)
"""
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    video = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else "thumbnail.png"
    second = sys.argv[3] if len(sys.argv) > 3 else "2"
    width = int(sys.argv[4]) if len(sys.argv) > 4 else 800
    height = int(sys.argv[5]) if len(sys.argv) > 5 else width
    k = min(width, height) / 600  # scale factor for the play button

    tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False).name
    subprocess.run(
        ["ffmpeg", "-y", "-ss", second, "-i", video, "-frames:v", "1", tmp],
        check=True,
    )

    # Center-crop the frame to the target shape, then resize
    img = Image.open(tmp).convert("RGB")
    w, h = img.size
    target = width / height
    if w / h > target:            # frame is wider than target: trim the sides
        new_w, new_h = int(h * target), h
    else:                         # frame is taller than target: trim top/bottom
        new_w, new_h = w, int(w / target)
    left, top = (w - new_w) // 2, (h - new_h) // 2
    img = img.crop((left, top, left + new_w, top + new_h)).resize((width, height), Image.LANCZOS)

    # Dim the frame slightly and draw the play button
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle((0, 0, width, height), fill=(0, 0, 0, 70))
    cx, cy = width // 2, height // 2
    r = int(80 * k)
    d.ellipse((cx - r, cy - r, cx + r, cy + r),
              fill=(0, 0, 0, 170), outline=(255, 255, 255, 255), width=max(2, int(6 * k)))
    d.polygon([(cx - 22 * k, cy - 38 * k), (cx - 22 * k, cy + 38 * k), (cx + 42 * k, cy)],
              fill=(255, 255, 255, 255))

    result = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    result.save(out)
    os.remove(tmp)
    print(f"Saved {out} ({width}x{height})")


if __name__ == "__main__":
    main()