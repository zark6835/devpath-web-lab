from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "src" / "assets" / "images"
FONT_BOLD = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
FONT_SEMI = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"

def gradient(w, h, c1, c2):
    img = Image.new("RGB", (w, h), c1)
    px = img.load()
    for y in range(h):
        for x in range(w):
            t = min(1.0, (x / w * 0.6 + y / h * 0.4) / 0.714)
            px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return img

def save(img, name, width):
    (OUT / Path(name).parent).mkdir(parents=True, exist_ok=True)
    img.save(OUT / f"{name}-{width}.webp", "WEBP", quality=82)
    img.save(OUT / f"{name}-{width}.jpg", "JPEG", quality=85, optimize=True)

def centered_text(img, text, size, font=FONT_BOLD):
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(font, size)
    box = d.textbbox((0, 0), text, font=f)
    w, h = box[2] - box[0], box[3] - box[1]
    d.text(((img.width - w) / 2 - box[0], (img.height - h) / 2 - box[1]), text, font=f, fill="white")

COURSES = {
    "modern-javascript": ("JS", (79, 70, 229), (139, 92, 246)),
    "react-nextjs": ("React", (14, 165, 233), (99, 102, 241)),
    "python-pandas": ("Py", (245, 158, 11), (239, 68, 68)),
    "docker-kubernetes": ("K8s", (16, 185, 129), (14, 165, 233)),
    "uiux-figma": ("UX", (236, 72, 153), (139, 92, 246)),
    "sql-postgresql": ("SQL", (71, 85, 105), (79, 70, 229)),
}
for slug, (label, c1, c2) in COURSES.items():
    for w in (400, 800):
        h = round(w * 170 / 368)
        img = gradient(w, h, c1, c2)
        centered_text(img, label, round(32 * w / 368))
        save(img, f"courses/{slug}", w)
def hero(w, h, scale):
    img = gradient(w, h, (79, 70, 229), (139, 92, 246)).convert("RGBA")
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    f = ImageFont.truetype(FONT_SEMI, int(40 * scale))
    for i, sym in enumerate(["</>", "{ }", ">_", "[ ]", "( )"]):
        x = (i * 0.21 + 0.05) * w
        y = (0.12 if i % 2 else 0.78) * h
        d.text((x, y), sym, font=f, fill=(255, 255, 255, 70))
    for r, (cx, cy) in zip((90, 60, 40), ((0.9, 0.15), (0.1, 0.45), (0.85, 0.85))):
        r *= scale
        d.ellipse((cx * w - r, cy * h - r, cx * w + r, cy * h + r), fill=(255, 255, 255, 28))
    return Image.alpha_composite(img, layer).convert("RGB")

for w in (564, 1128):
    save(hero(w, round(w * 440 / 564), w / 564), "hero/hero-desktop", w)
for w in (328, 656):
    save(hero(w, round(w * 240 / 328), w / 564), "hero/hero-mobile", w)
for w in (80, 160):
    img = gradient(w, w, (245, 158, 11), (236, 72, 153))
    centered_text(img, "AK", round(w * 0.33), FONT_SEMI)
    save(img, "avatars/anna-kovalenko", w)

print("done")
