#!/usr/bin/env python3
"""Make the Sciwrix homepage lead visually with the product name."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "home" / "index.html"

text = PAGE.read_text(encoding="utf-8")
original = text

old_hero = '''<div class="eyebrow">Portable scientific writing</div>
<h1>Markdown and LaTeX for Scientific Writing</h1>
<p class="lead">A focused, offline-capable editor for scientists, students and researchers. Write in Markdown, work visually, typeset mathematics and produce print-ready documents.</p>'''
new_hero = '''<div class="eyebrow">Portable scientific writing</div>
<h1 class="product-title">Sciwrix</h1>
<p class="hero-subtitle">Markdown and LaTeX for Scientific Writing</p>
<p class="lead">A focused, offline-capable editor for scientists, students and researchers. Write in Markdown, work visually, typeset mathematics and produce print-ready documents.</p>'''

if old_hero in text:
    text = text.replace(old_hero, new_hero, 1)

# Strengthen the top-left logo without changing the SEO title/meta text.
text = text.replace(
    ".brand{display:inline-flex;align-items:center;gap:11px;color:#fff;text-decoration:none;font-size:1.42rem;font-weight:780;letter-spacing:-.025em}",
    ".brand{display:inline-flex;align-items:center;gap:12px;color:#fff;text-decoration:none;font-size:1.68rem;font-weight:860;letter-spacing:-.035em;text-shadow:0 1px 16px rgba(105,185,255,.18)}",
    1,
)
text = text.replace(
    ".brand svg{width:34px;height:34px}",
    ".brand svg{width:39px;height:39px;flex:0 0 auto}",
    1,
)

# Add product-specific hero typography. Keep the existing h1 rule for other headings.
insert_after = "h1{margin:0;max-width:650px;font-size:clamp(2.75rem,5vw,4.7rem);line-height:1.04;letter-spacing:-.048em}"
addition = (
    ".product-title{font-size:clamp(4.4rem,8.2vw,7.4rem);line-height:.9;letter-spacing:-.075em;text-shadow:0 18px 48px rgba(0,0,0,.22)}"
    ".hero-subtitle{max-width:650px;margin:20px 0 0;color:#9bd0ff;font-size:clamp(1.32rem,2.45vw,2rem);line-height:1.18;font-weight:800;letter-spacing:-.03em}"
)
if ".product-title{" not in text and insert_after in text:
    text = text.replace(insert_after, insert_after + addition, 1)

# Keep mobile spacing comfortable now the product title is larger.
text = text.replace(
    "h1{font-size:clamp(2.35rem,12vw,3.45rem)}.button{width:100%}",
    "h1{font-size:clamp(2.35rem,12vw,3.45rem)}.product-title{font-size:clamp(4rem,18vw,5.7rem)}.hero-subtitle{font-size:clamp(1.18rem,6vw,1.55rem);margin-top:14px}.button{width:100%}",
    1,
)

# Current release fallback should match the public Sciwrix release.
text = text.replace("<strong data-release-version>v1.3.3</strong>", "<strong data-release-version>v1.5.1</strong>")
text = text.replace("<span data-release-version>v1.3.3</span>", "<span data-release-version>v1.5.1</span>")
text = text.replace("const tag=rel.tag_name||'v1.3.3'", "const tag=rel.tag_name||'v1.5.1'")
text = text.replace("const tag=rel.tag_name||'v1.5.0'", "const tag=rel.tag_name||'v1.5.1'")

if text == original:
    raise SystemExit("No homepage brand-focus changes were applied.")

PAGE.write_text(text, encoding="utf-8")
print("Updated homepage brand focus: Sciwrix is now the hero heading.")
