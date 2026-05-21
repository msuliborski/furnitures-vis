# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server (hot reload, port 5173)
npm run build        # Vite production build → dist/
npm run preview      # Preview Vite build locally
npm run build:html   # esbuild → static/app.js (self-contained IIFE for static/index.html)
```

There are no tests or linting configured.

## Architecture

**Two deployment modes:**

1. **Vite app** (`index.html` + `src/main.jsx`): standard React SPA, `src/App.jsx` just re-exports from `projekt-mebli.jsx`.
2. **Static HTML** (`static/index.html` + `static/app.js`): standalone file with no server needed. Built by `build-html.mjs` via esbuild from `build-entry.jsx` → `projekt-mebli.jsx`.

**Everything lives in `projekt-mebli.jsx`** (~900 lines). Do not look elsewhere for logic.

The file is structured in this order:
1. `localStorage` persistence helpers (`readState` / `writePatch`) — saves tab, view, doorsOpen, scrollY under key `projekt-mebli.v1`
2. Cabinet data objects: `REGAL`, `SZAFA`, `LAZIENKA`, `BUTY` — plain JS objects with dimensions and specs
3. Shared SVG components: `Dim` (dimension line with arrows), `MatRow` (spec table row)
4. Per-cabinet SVG view components: `RegalFront`, `RegalSide`, `SzafaFront`, `SzafaSide`, `SzafaTop`, `LazienkaFront`, `LazienkaSide`, `LazienkaTop`, `ButyFront`, `ButySide`, `ButyTop`
5. `App` — tab/view/doors state, renders the correct view components

**SVG drawing conventions:**
- All dimensions in mm, scaled by a local `S` factor inside each component (e.g. `S=0.12` means 1mm → 0.12px)
- `T = 25` (board thickness in mm) is a global constant
- `ox`/`oy` = SVG origin offset; `bodyTop`/`bodyBot`/`innerL`/`innerR` = key coordinates derived from outer dimensions and T
- The `Dim` component renders a measurement line: vertical when `x1≈x2`, horizontal otherwise; `side` controls which side the label appears

**Cabinet geometry notes:**
- REGAL: stepped depth (350mm top, 600mm bottom), rows array drives shelf/divider layout
- SZAFA: 5 segments computed from `SEG = round((IW2 - 3*T) / 5)`, floor→SVG Y via `fy()` helper inside `SzafaFront`
- LAZIENKA: two-sided access (front 790mm + right side 440mm), Geberit niche at left
- BUTY: trapezoidal plan (front 680mm, back 530mm, offset 150mm on left side)

**Backup files:** `projekt-mebli-kopia.jsx` and `projekt-mebli-kopia 2.jsx` are manual snapshots — do not edit them.
