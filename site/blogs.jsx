// Blogs page. Two views in one component:
//   1. List view (no hash)               → renders `BlogList` from window.BLOGS
//   2. Post view (#<slug>)               → fetches data/blogs/<slug>.md, parses
//                                          YAML frontmatter, renders the body
//                                          through `marked` (loaded from CDN
//                                          via <script> in blogs/index.html).
//
// Hash routing keeps the URL clean (`/blogs/#welcome-coastline`) without
// requiring a separate HTML file per post. The home/list view is just the
// no-hash state of the same page.

const { C, F, useIsMobile, MonoLabel, SectionHeader } = window;

const BLOGS = window.BLOGS || [];

// Resolve `data/blogs/...` relative to the current page. The `/blogs/` page
// is one level deep, so `../data/blogs/<slug>.md` is correct.
const BLOG_DATA_PATH = '../data/blogs';

// Tiny YAML-frontmatter parser. Handles the shapes the .md files actually
// use: `key: value`, quoted strings, and bracketed string arrays
// (e.g. `tags: [Lab, Vision]`). Not a general YAML parser — by design.
function parseFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    let [, key, val] = kv;
    val = val.trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      meta[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      meta[key] = val.replace(/^["']|["']$/g, '');
    }
  }
  return { meta, body: m[2] };
}

function useHashSlug() {
  const read = () => (typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '');
  const [slug, setSlug] = React.useState(read());
  React.useEffect(() => {
    const onHash = () => setSlug(read());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return slug;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ──────────────────────────────────────────────────────────────────────────
// BlogCard — list-view item.
//
// TODO (you): design how a single blog post looks in the list. The lab's
// visual language is set in site/_shared.jsx (tokens C/F) and the News
// section (site/news.jsx) shows a minimal date-on-left, body-on-right row.
// You can mirror that for consistency, OR go richer (a card with summary
// preview + tag chips). What you pick shapes the feel of the whole page.
//
// Trade-offs to consider:
//   - Minimal row (like News): visually consistent with the rest of the site,
//     but a long list of titles can feel sparse if there's only a handful.
//   - Card with summary: more inviting for browsing, but heavier — and risks
//     diverging from the editorial restraint elsewhere on the site.
//   - Hybrid: title + date + tags as a row, summary revealed on hover or
//     always shown but de-emphasized.
//
// Available styling tokens (already destructured at top of file):
//   C.ink, C.accent, C.paper, C.paperWarm   (palette)
//   F.display, F.editorial, F.mono           (font families)
//   isMobile                                 (boolean — single-column layout)
//
// Props passed in:
//   post: { slug, date, title, summary, author, tags }
//
// The wrapper <a> is provided — its `href={'#' + post.slug}` is what makes
// hash routing work, so keep it. Implement the *contents* of the anchor.
function BlogCard({ post, isMobile }) {
  return (
    <a
      href={`#${post.slug}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        padding: isMobile ? '20px 0' : '24px 0',
        borderBottom: `1px solid ${C.ink}15`,
      }}
    >
      {/* TODO: render the post preview here. ~5–10 lines. */}
      <div style={{ fontFamily: F.mono, fontSize: 12, color: C.ink, opacity: 0.5 }}>
        {/* placeholder so you can see the page renders before you fill this in */}
        {post.slug}
      </div>
    </a>
  );
}

// ──────────────────────────────────────────────────────────────────────────

function BlogList() {
  const isMobile = useIsMobile();
  const sorted = [...BLOGS].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <section style={{ background: C.paper, padding: isMobile ? '56px 0 80px' : '88px 0 120px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px' }}>
        <a href="/" style={{
          fontFamily: F.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: C.ink, opacity: 0.6, textDecoration: 'none',
          display: 'inline-block', marginBottom: isMobile ? 24 : 32,
        }}>← Back to home</a>

        <SectionHeader
          // kicker="§ Blogs"
          title="Blogs"
          // lede="Short, irregular pieces from CoSTA@NUS — research notes, reading lists, and the occasional unfinished thought."
        />

        {sorted.length === 0 ? (
          <div style={{ fontFamily: F.editorial, fontStyle: 'italic', fontSize: 18, color: C.ink, opacity: 0.6 }}>
            No posts yet — first dispatch coming soon.
          </div>
        ) : (
          <div style={{ borderTop: `1px solid ${C.ink}20` }}>
            {sorted.map(p => (
              <BlogCard key={p.slug} post={p} isMobile={isMobile} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Renders a single post. Fetches the .md file by slug, parses frontmatter,
// hands the body to `window.marked.parse`. Falls back gracefully if the file
// is missing or marked hasn't loaded.
function BlogPost({ slug }) {
  const isMobile = useIsMobile();
  const [state, setState] = React.useState({ status: 'loading', meta: null, html: '' });

  React.useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', meta: null, html: '' });
    fetch(`${BLOG_DATA_PATH}/${slug}.md`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(src => {
        if (cancelled) return;
        const { meta, body } = parseFrontmatter(src);
        const parser = window.marked;
        if (!parser || typeof parser.parse !== 'function') {
          throw new Error('marked not loaded');
        }
        // Scope rendered content to a class we can style without leaking
        // global element styles into the rest of the site.
        const html = parser.parse(body);
        setState({ status: 'ok', meta, html });
        // Reset scroll so a deep-link to a post lands at the top.
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
      })
      .catch(err => {
        if (cancelled) return;
        setState({ status: 'error', meta: null, html: '', error: err.message });
      });
    return () => { cancelled = true; };
  }, [slug]);

  // Fallback metadata from window.BLOGS while .md is loading or if it lacks frontmatter.
  const indexEntry = BLOGS.find(b => b.slug === slug);
  const meta = state.meta || indexEntry || {};
  const title = meta.title || indexEntry?.title || slug;
  const date = meta.date || indexEntry?.date;
  const author = meta.author || indexEntry?.author;

  return (
    <section style={{ background: C.paper, padding: isMobile ? '40px 0 80px' : '64px 0 120px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }} style={{
          fontFamily: F.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: C.ink, opacity: 0.6, textDecoration: 'none',
          display: 'inline-block', marginBottom: isMobile ? 24 : 32, cursor: 'pointer',
        }}>← All posts</a>

        <MonoLabel>§ {formatDate(date)}{author ? ` · ${author}` : ''}</MonoLabel>
        <h1 style={{
          fontFamily: F.display, fontWeight: 700, fontSize: 'clamp(32px, 5.5vw, 52px)',
          letterSpacing: '-0.035em', lineHeight: 1.06, color: C.ink,
          margin: '14px 0 32px', textWrap: 'balance',
        }}>{title}</h1>

        {state.status === 'loading' && (
          <div style={{ fontFamily: F.editorial, fontStyle: 'italic', color: C.ink, opacity: 0.5 }}>Loading…</div>
        )}
        {state.status === 'error' && (
          <div style={{ fontFamily: F.display, color: C.ink, opacity: 0.7 }}>
            Couldn't load this post ({state.error}). It may have been moved or renamed.
          </div>
        )}
        {state.status === 'ok' && (
          <div className="prose" dangerouslySetInnerHTML={{ __html: state.html }} />
        )}
      </div>
    </section>
  );
}

function Blogs() {
  const slug = useHashSlug();
  if (slug && BLOGS.some(b => b.slug === slug)) return <BlogPost slug={slug} />;
  return <BlogList />;
}

Object.assign(window, { Blogs, BlogList, BlogPost, BlogCard });
