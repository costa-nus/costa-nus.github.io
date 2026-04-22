# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

Single-page website for the CoSTA@NUS Lab, deployed as GitHub Pages from `main` at https://costa-nus.github.io. No build system, no package manager, no tests — everything is served as static files.

## Local development

There is no build step. JSX is compiled in the browser by Babel Standalone, which fetches `site/sections.jsx` over HTTP — so `file://` will not work (CORS on the fetch). Serve the repo root over HTTP:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Architecture

- `index.html` is the landing page. It pulls React 18, ReactDOM 18, and `@babel/standalone` from unpkg (pinned versions with SRI hashes), then loads `site/sections.jsx` via `<script type="text/babel" src="site/sections.jsx">`. Babel transpiles the JSX on load.
- `site/sections.jsx` defines every section component (`Nav`, `Hero`, `PIIntro`, `ResearchPillars`, `Publications`, `People`, `News`, `Join`, `Footer`) plus local helpers, and exposes them on `window` via the `Object.assign(window, {...})` block at the end of the file. The `App` shell that composes them lives inline inside each page's HTML. Page content (publications, people list, news items) is hard-coded as arrays near the top of each section — edit those to update the site. **Anything a sub-page needs to reuse (e.g. `PUBS`, `PubRow`) must be added to that window assignment.**
- Sub-pages live in their own directory as `<slug>/index.html` so GitHub Pages serves a clean URL like `/publications/`. Each sub-page loads `../site/sections.jsx` and composes its own `<App>` inline, typically reusing `Nav`/`Footer` plus section-specific components from `window`.
- `Nav` and `Footer` accept an optional `basePath` prop. On the home page pass nothing (hash links stay on-page); on sub-pages pass `"/"` so hash links in the nav/footer navigate back to the matching home-page section (e.g. `/#people`).
- Two publication datasets coexist: `PUBS` (short, curated — used by the landing page's compact `PubRow`) and `PUBS_FULL` (complete 41-entry archive mirrored from the PI's site). `PUBS_FULL` entries carry `authors` (objects with `name`, optional `highlighted` for the PI, optional `note` surfaced as a tooltip), `links` (objects with PI-site label verbatim, e.g. `"🌍 Website"`, `"🤗 Dataset"`), `tags`, optional `selected`, and optional `detail` (relative path on jyhong.gitlab.io). The `/publications/` page's inline components (`Badge`, `AuthorList`, `AuthorInfo`, `LinkCapsule`, `PubEntry`) consume the full shape; `PubRow` in `sections.jsx` consumes only the compact subset.
- Design tokens are duplicated in two places that are **not** wired together: `ds/tokens.jsx` (canonical tokens + `WaveGlyph`/`DSPage`/`DSSection`, intended for design-system demo pages but not loaded by `index.html`) and the local `C`/`F` constants at the top of `site/sections.jsx` (what the live site actually uses). Keep them in sync when changing palette or typography.
- `site/jason-hong.png` is referenced by root-relative path (`src="site/jason-hong.png"`) inside `sections.jsx`, which is why the repo must be served from its root rather than a subpath.
- `uploads/` contains exported drawings from the original design tool; they are not referenced by the live site and can be treated as archival.

## Edit-mode (Tweaks panel)

The page supports an in-browser edit mode designed for an external host (parent window) to drive:

- The host posts `{type: '__activate_edit_mode'}` into the iframe to reveal the Tweaks panel; `'__deactivate_edit_mode'` hides it.
- On load, the page posts `{type: '__edit_mode_available'}` to its parent.
- When a user clicks a Tweaks pill, the page posts `{type: '__edit_mode_set_keys', edits: {...}}` back to the parent.
- Defaults persist by rewriting the literal object between the `/*EDITMODE-BEGIN*/ ... /*EDITMODE-END*/` markers in `index.html`. Do not remove those comment markers — they are the write target.

Current tweakable keys: `accent` (`orange` | `coast` | `teal`, mapped to `--accent` CSS var) and `headlineStyle` (`serif-coastline` | `sans-punchy`, read by `Hero` via `window.__tweaks`). Adding a new tweak means updating `TWEAK_DEFAULTS`, the panel render in `index.html`, and whichever component reads `window.__tweaks.<key>` — plus calling `window.__rerender()` on change so React picks it up.

## Deployment

Pushing to `main` publishes via GitHub Pages. There is no staging or CI; test locally by serving over HTTP before pushing.
