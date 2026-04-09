# -*- coding: utf-8 -*-
with open(r'e:\cardtou\src\app\page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'export default function' in l or 'function Home' in l:
        print(f"Line {i+1}: {l.strip()}")
        break
