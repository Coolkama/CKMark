#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = (root / 'index.html').read_text(encoding='utf-8').splitlines()

needles = (
    'const starterText =',
    'id="helpDrawer"',
    'id="help-drawer"',
    'Help and About',
    'help-content',
    'help-section',
)

matched = set()
for i, line in enumerate(source):
    if any(needle in line for needle in needles):
        radius = 120 if 'const starterText =' in line else 80
        for j in range(max(0, i - radius), min(len(source), i + radius + 1)):
            matched.add(j)

out = []
last = -2
for i in sorted(matched):
    if i > last + 1:
        out.append('\n---\n')
    out.append(f'{i+1:05d}: {source[i]}')
    last = i

(root / 'tools' / 'onboarding_context.txt').write_text('\n'.join(out) + '\n', encoding='utf-8')
