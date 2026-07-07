# CKMark

CKMark is a portable, self-contained Markdown editor designed for scientific and technical writing. It combines Markdown editing, rendered preview, WYSIWYG-style editing, LaTeX mathematics, image embedding, document styles, undo/redo, and print/PDF support in a single HTML file.

## Current application

The complete web application is stored in [`index.html`](./index.html). Download that one file and open it in a modern browser; no installation or web server is required.

- [CKMark product homepage](https://coolkama.github.io/CKMark/home/)
- [Launch CKMark online](https://coolkama.github.io/CKMark/)
- [Latest Android release](https://github.com/Coolkama/CKMark/releases/latest)

The product homepage explains the online, standalone HTML and Android versions and provides current download links.

## Highlights

- Single-file, offline HTML application
- Markdown and visual editing
- Undo and redo
- Inline and display LaTeX mathematics
- Live rendered preview
- Embedded images
- Science-paper document styling
- Print and PDF output
- Desktop and mobile layouts
- Local `.md` file open/save support where the platform permits it
- Native Android wrapper and APK build workflows
- Embedded CKMark icon

## Running CKMark in a browser

1. Download `index.html` or use the **Download CKMark.html** button on the product homepage.
2. Optionally rename it to `CKMark.html`.
3. Open it in Chrome, Edge, Firefox, Safari, or another modern browser.

All required application code and libraries are embedded in the HTML file.

## Android app

The Android project is stored in [`android`](./android). It packages the same self-contained `index.html` application in a native WebView wrapper with Android `.md` file association, native file selection, direct saving for writable documents and printing support.

Every push affecting the application or Android wrapper runs smoke checks, Android lint and a debug APK build. Proper signed releases are produced manually through the **Release Android APK** GitHub Actions workflow after the repository signing secrets have been configured.

See [`android/RELEASING.md`](./android/RELEASING.md) for the one-time signing setup and release procedure.

## Licence

CKMark is Copyright 2026 Trevor Neil Kelleher and is licensed under the [Apache License 2.0](./LICENSE).

CKMark embeds third-party software. Their licences, copyright notices and the licence option selected for DOMPurify are documented in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md). The full Wicked Good XPath MIT licence is provided in [WICKED_GOOD_XPATH_LICENSE.txt](./WICKED_GOOD_XPATH_LICENSE.txt), and attribution notices are collected in [NOTICE](./NOTICE).

## Repository structure

```text
index.html                              Complete standalone application
home/index.html                         Product homepage and download options
assets/CKMark-icon.png               Browser/project icon
android/                                Native Android wrapper
android/RELEASING.md                    Signing and release instructions
LICENSE                                 Apache License 2.0 for CKMark
NOTICE                                  CKMark and third-party attributions
THIRD_PARTY_NOTICES.md                  Bundled software and licence details
WICKED_GOOD_XPATH_LICENSE.txt           Full MIT licence for bundled XPath code
tools/smoke_test.py                     Lightweight regression checks
.github/workflows/build-android-apk.yml Debug build and validation workflow
.github/workflows/release-android-apk.yml Signed GitHub Release workflow
README.md                               Project information
```

## Development

CKMark deliberately keeps the distributed application self-contained. Changes should be tested on both desktop and mobile-sized browser windows, including Markdown editing, visual editing, undo/redo, mathematics rendering, file loading, saving, printing and preview synchronisation.

Run the repository smoke checks with:

```bash
python3 tools/smoke_test.py
```

## Status

CKMark is under active development. The repository contains the latest working single-file web build, product homepage and Android wrapper used to produce installable APKs.

## Author

Trevor Neil Kelleher
