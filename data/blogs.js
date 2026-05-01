// Blog index — one entry per post. Lives here (rather than being inferred
// from the filesystem) because the browser can't list directory contents on
// GitHub Pages. The actual prose lives in `data/blogs/<slug>.md`.
//
// Entry shape: { slug, date, title, summary, author, tags }
//   slug    : URL fragment + filename stem. File path is `data/blogs/${slug}.md`.
//             Convention: `<YYYY-MM-DD>-<kebab-title>` so the directory sorts
//             chronologically when listed.
//   date    : ISO `YYYY-MM-DD`. Used for sorting and for the human-readable
//             label on the list page.
//   title   : display title (mirrored in the .md frontmatter; this copy is for
//             the list page so it can render without fetching every file).
//   summary : 1–2 sentence preview shown on the list page.
//   author  : free-form display string (e.g. "Jason Hong").
//   tags    : string[] for future filter chips.
window.BLOGS = [
  {
    slug: '2026-05-01-welcome-coastline',
    date: '2026-05-01',
    title: 'Welcome to the cognitive coastline.',
    summary: "A first dispatch from CoSTA@NUS — what we're building, who we're looking for, and why we think the next decade of AI runs through cognitive science.",
    author: 'Jason Hong',
    tags: ['Lab', 'Vision'],
  },
];
