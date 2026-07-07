#!/usr/bin/env python3
"""Apply the one-time public-facing ScienceMD to CKMark rebrand safely."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SELF = Path(__file__).resolve()
WORKFLOWS = ROOT / ".github/workflows"
TEXT_SUFFIXES = {
    ".gradle",
    ".html",
    ".java",
    ".json",
    ".md",
    ".properties",
    ".py",
    ".txt",
    ".xml",
    ".yaml",
    ".yml",
}
SKIP_PARTS = {".git", "build", ".gradle"}

changed: list[Path] = []


def should_skip(path: Path) -> bool:
    if path.resolve() == SELF:
        return True
    if any(part in SKIP_PARTS for part in path.parts):
        return True
    try:
        path.relative_to(WORKFLOWS)
        return True
    except ValueError:
        return False


for path in ROOT.rglob("*"):
    if not path.is_file() or should_skip(path):
        continue
    if path.suffix.lower() not in TEXT_SUFFIXES:
        continue

    try:
        original = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue

    updated = original.replace("ScienceMD", "CKMark")

    if path == ROOT / "tools/smoke_test.py":
        updated = updated.replace("<title>sciencemd</title>", "<title>ckmark</title>")
        updated = updated.replace("?: '10'", "?: '11'")
        updated = updated.replace("?: '1.3.4'", "?: '1.4.0'")
        updated = updated.replace(
            '"Android 1.3.4 version defaults are missing"',
            '"Android 1.4.0 version defaults are missing"',
        )

    if path == ROOT / "android/app/build.gradle":
        updated = updated.replace("?: '10'", "?: '11'")
        updated = updated.replace("?: '1.3.4'", "?: '1.4.0'")

    if path == ROOT / "android/RELEASING.md":
        updated = updated.replace("1.3.4", "1.4.0")
        updated = updated.replace("versionCode 10", "versionCode 11")
        updated = updated.replace("version code `10`", "version code `11`")

    if updated != original:
        path.write_text(updated, encoding="utf-8")
        changed.append(path.relative_to(ROOT))

old_icon = ROOT / "assets/ScienceMD-icon.png"
new_icon = ROOT / "assets/CKMark-icon.png"
if old_icon.exists() and not new_icon.exists():
    old_icon.rename(new_icon)
    changed.extend([old_icon.relative_to(ROOT), new_icon.relative_to(ROOT)])

remaining: list[Path] = []
for path in ROOT.rglob("*"):
    if not path.is_file() or should_skip(path):
        continue
    if path.suffix.lower() not in TEXT_SUFFIXES:
        continue
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    if "ScienceMD" in text:
        remaining.append(path.relative_to(ROOT))

if remaining:
    joined = "\n".join(f" - {path}" for path in remaining)
    raise SystemExit(f"Public-facing ScienceMD references remain:\n{joined}")

print("CKMark rebrand updated:")
for path in sorted(set(changed)):
    print(f" - {path}")
