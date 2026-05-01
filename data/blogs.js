// Blog index — one entry per post. Lives here (rather than being inferred
// from the filesystem) because the browser can't list directory contents on
// GitHub Pages.
//
// Two kinds of entries:
//   - Internal post: prose lives in `data/blogs/<slug>.md` and is rendered
//     in-page via the /blogs/#<slug> hash route.
//   - External post: `external` is a full URL; the list-page card links out
//     to it (new tab) and no .md file is needed.
//
// Entry shape: { slug, date, title, summary, author, tags, thumbnail?, external? }
//   slug      : URL fragment + filename stem. File path is `data/blogs/${slug}.md`.
//               Convention: `<YYYY-MM-DD>-<kebab-title>` so the directory sorts
//               chronologically when listed.
//   date      : ISO `YYYY-MM-DD`. Used for sorting and for the human-readable
//               label on the list page.
//   title     : display title (mirrored in the .md frontmatter for internal
//               posts; this copy is for the list page so it can render without
//               fetching every file).
//   summary   : 1–2 sentence preview shown on the list page.
//   author    : free-form display string (e.g. "Jason Hong").
//   tags      : string[] for future filter chips.
//   thumbnail : optional image URL (relative or absolute) shown on the list
//               card. When omitted, a brand-styled placeholder block (wave
//               glyph on paperWarm) is rendered instead.
//   external  : optional full URL. Presence flips the entry to "external"
//               rendering: the card links out and no .md is loaded.
window.BLOGS = [
  {
    slug: '2026-05-01-ai-on-cs-edu',
    date: '2026-05-01',
    title: 'How did the ChatGPT moment change U.S. computer science education?',
    summary: "An analysis of CRA Taulbee Survey data through AY 2023–24 — bachelor's enrollment up 22%, new PhD students up 13.1% year-over-year, and where the data still has gaps.",
    author: 'CoSTA@NUS',
    tags: ['Analysis', 'Education'],
    thumbnail: '/blogs/thumbs/2026-05-01-ai-on-cs-edu.svg',
    external: 'https://costa-nus.github.io/ai-on-cs-edu/',
  },
  {
    slug: '2026-05-01-welcome-coastline',
    date: '2026-05-01',
    title: 'Welcome to the cognitive coastline.',
    summary: "A first dispatch from CoSTA@NUS — what we're building, who we're looking for, and why we think the next decade of AI runs through cognitive science.",
    author: 'Jason Hong',
    tags: ['Lab', 'Vision'],
  },
];
