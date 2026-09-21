#!/usr/bin/env python3
"""sw.js dagi FILES ro'yxatini saytdagi fayllardan qayta yig'adi.

Yangi o'yin qo'shilgandan keyin bir marta ishga tushiriladi:
    python3 bosh/sw-royxat.py
Bu — yig'ish (build) emas: sayt busiz ham ishlaydi, skript faqat offline ro'yxatini yangilaydi.
Tekshiruvi: node --test bosh/tests/offline.test.js
"""
import pathlib
import re
import sys

root = pathlib.Path(__file__).resolve().parent.parent
games = sorted(d.name for d in (root / "oyinlar").iterdir() if d.name[:2].isdigit())
pages = games + ["musobaqa"]  # musobaqa rejimi ham alohida sahifa

files = ["./", "index.html", "manifest.json", "bosh/style.css", "bosh/icon.svg", "bosh/icon-192.png", "bosh/icon-512.png"]
files += sorted(f"bosh/js/{p.name}" for p in (root / "bosh/js").glob("*.js"))
files += sorted(f"oyinlar/umumiy/css/{p.name}" for p in (root / "oyinlar/umumiy/css").glob("*.css"))
files += ["oyinlar/umumiy/fonts/Nunito.woff2"]
files += sorted(f"oyinlar/umumiy/js/{p.name}" for p in (root / "oyinlar/umumiy/js").glob("*.js"))
for page in pages:
    files += [f"oyinlar/{page}/", f"oyinlar/{page}/index.html", f"oyinlar/{page}/css/style.css"]
    files += sorted(str(p.relative_to(root).as_posix()) for p in (root / "oyinlar" / page / "js").rglob("*.js"))

sw = root / "sw.js"
text = sw.read_text()
block = ",\n".join(f'  "{f}"' for f in files)
text = re.sub(r"const FILES = \[[\s\S]*?\n\];", f"const FILES = [\n{block},\n];", text)

# Kesh nomi yangilansin — eski kesh o'chiriladi
version = int(re.search(r'const VERSION = "v(\d+)"', text).group(1))
if "--bump" in sys.argv:
    text = text.replace(f'const VERSION = "v{version}"', f'const VERSION = "v{version + 1}"')
    version += 1
sw.write_text(text)
print(f"sw.js: {len(files)} ta yozuv, kesh nomi v{version}")
