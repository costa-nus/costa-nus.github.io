# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

Single-page website for the CoSTA@NUS Lab, deployed as GitHub Pages from `main` at https://costa-nus.github.io. No build system, no package manager, no tests — everything is served as static files.

## Local development

There is no build step. JSX is compiled in the browser by Babel Standalone, which fetches the `site/*.jsx` files over HTTP — so `file://` will not work (CORS on the fetch). Serve the repo root over HTTP:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Architecture

- `index.html` is the landing page. It pulls React 18, ReactDOM 18, and `@babel/standalone` from unpkg (pinned versions with SRI hashes), then loads each section file via `<script type="text/babel" src="site/<file>.jsx">`. Babel transpiles the JSX on load.
- **Section components are split per page section** under `site/`, one file each: `_shared.jsx` (design tokens `C`/`F` + atoms `useIsMobile`, `WaveMark`, `MonoLabel`, `NusLogo`, `SectionHeader`), `nav.jsx`, `hero.jsx`, `pi-intro.jsx`, `research.jsx`, `publications.jsx`, `people.jsx`, `news.jsx`, `join.jsx`, `footer.jsx`. Each file destructures its dependencies off `window` at the top (e.g. `const { C, F, useIsMobile, MonoLabel } = window;`) and re-publishes its component(s) via an `Object.assign(window, {...})` line at the bottom — that pair is the in-browser equivalent of `import` / `export`. **`_shared.jsx` must load first** because every other file destructures from it; otherwise script-tag order is by section. The `App` shell that composes the sections lives inline inside each page's HTML.
- **Anything a sub-page needs to reuse (e.g. `PUBS_FULL`, `PubRow`) must appear in the corresponding file's window assignment.** `publications.jsx` exposes `Publications`, `PubRow`, `PUBS_FULL`; `_shared.jsx` exposes the tokens and atoms.
- **Content data lives in `data/*.js` (plain JS, not JSX)**, each file assigning one array onto `window`: `publications.js` → `window.PUBS_FULL`, `people.js` → `window.PEOPLE` + `window.ALUMNI`, `news.js` → `window.NEWS`, `research.js` → `window.RESEARCH_PILLARS`, `press.js` → `window.PRESS_COVERAGE`, `building.js` → `window.WHAT_WE_BUILD`. These load synchronously before any `site/*.jsx` script so Babel-transpiled code can read them. **Edit the text of a paper, person, news item, or research pillar in the matching `data/*.js` file — do not touch the section files for content changes.** The data files include a header comment documenting each entry's shape; keep those in sync when adding fields.
- Sub-pages live in their own directory as `<slug>/index.html` so GitHub Pages serves a clean URL like `/publications/`. Each sub-page loads the relevant `../data/*.js` files and only the `../site/*.jsx` section files it actually composes (always `_shared.jsx` first), then composes its own `<App>` inline. `/publications/` loads `_shared`, `nav`, `publications` (for `PUBS_FULL`), `footer`; `/openings/` loads `_shared`, `nav`, `footer`.
- `Nav` and `Footer` accept an optional `basePath` prop. On the home page pass nothing (hash links stay on-page); on sub-pages pass `"/"` so hash links in the nav/footer navigate back to the matching home-page section (e.g. `/#people`).
- The landing page's `Publications` section is a derived view with **two subsections**: *Most recent* (entries whose `date` falls within the last `RECENT_MONTHS_WINDOW` months — default 6 — rendered without the ★ star) and *Selected* (entries with `selected: true`, stars shown, filter chips attached). The `/publications/` page shows the full archive. Both subsections are derived from the same `PUBS_FULL` array; a paper can appear in both if it is recent *and* selected. The `isRecent()` helper in `site/publications.jsx` reads `p.date` and falls back to `${year}-12-31` when `date` is missing, so un-annotated entries still surface if their year overlaps the window. `PUBS_FULL` entries carry `authors` (objects with `name`, optional `highlighted` for the PI, optional `note` surfaced as a tooltip), `links` (objects with PI-site label verbatim, e.g. `"🌍 Website"`, `"🤗 Dataset"`), `tags`, optional `selected`, optional `date` (ISO `"YYYY-MM-DD"`), and optional `detail` (relative path on jyhong.gitlab.io). The `/publications/` page's inline components (`Badge`, `AuthorList`, `AuthorInfo`, `LinkCapsule`, `PubEntry`) consume the full shape; `PubRow` in `site/publications.jsx` parses the parenthetical modifier out of `venue` (e.g. `"ICLR (Spotlight)"`) for the compact home-page list and accepts a `showStar` prop to suppress the ★ in the Most-recent list.
- **Publication metadata source of truth**: the canonical per-paper metadata (title, authors, date, links) lives in the PI's Hugo site at `/Users/jyhong/Code/Websites/jyhong.gitlab.io/content/publication/<slug>/index.md` (or `<slug>.md` for older entries). The `detail` field on each `PUBS_FULL` entry is the URL slug, which maps 1:1 to that directory/file name. The Hugo files use both YAML (`---` fence) and TOML (`+++` fence) frontmatter. Prefer the `publishDate` field (public-facing date, e.g. conference date) over `date` (often the file's creation timestamp), and handle both `:` and `=` separators when parsing. The `sync-publications` skill in `.claude/skills/` refreshes `date`, `year`, and `venue` on each `data/publications.js` entry from `publishDate` (fallback `date`) and `publication_short` in the matching Hugo file.
- Design tokens are duplicated in two places that are **not** wired together: `ds/tokens.jsx` (canonical tokens + `WaveGlyph`/`DSPage`/`DSSection`, intended for design-system demo pages but not loaded by `index.html`) and the local `C`/`F` constants at the top of `site/_shared.jsx` (what the live site actually uses). Keep them in sync when changing palette or typography.
- `site/jason-hong.png` is referenced by root-relative path (`src="site/jason-hong.png"`) inside `site/pi-intro.jsx`, which is why the repo must be served from its root rather than a subpath.
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
