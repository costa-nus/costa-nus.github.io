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

// Default image used when an entry has no `thumbnail` of its own.
const PLACEHOLDER_THUMB = '/blogs/thumbs/_placeholder.png';

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
// BlogCard — list-view item. Thumbnail + text card. If `post.external` is
// set the card links out to that URL in a new tab (with a small ↗ indicator);
// otherwise it uses the in-page hash route to open the post inline.
//
// Thumbnail rules: render `post.thumbnail` if set, otherwise the default
// placeholder PNG. Either way it's an <img> with cover-fit, so cards never
// look empty.
function BlogCardThumb({ post, isMobile }) {
  return (
    <div style={{
      flex: '0 0 auto',
      width: isMobile ? '100%' : 200,
      aspectRatio: isMobile ? '16 / 9' : '4 / 3',
      background: C.paperWarm,
      border: `1px solid ${C.ink}18`,
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <img
        src={post.thumbnail || PLACEHOLDER_THUMB}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}

function BlogCard({ post, isMobile }) {
  const isExternal = !!post.external;
  const href = isExternal ? post.external : `#${post.slug}`;
  const targetProps = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a
      href={href}
      {...targetProps}
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 16 : 28,
        textDecoration: 'none',
        color: 'inherit',
        padding: isMobile ? '20px 0' : '28px 0',
        borderBottom: `1px solid ${C.ink}15`,
        alignItems: isMobile ? 'stretch' : 'flex-start',
      }}
    >
      <BlogCardThumb post={post} isMobile={isMobile} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: F.mono, fontSize: 11, letterSpacing: '0.12em',
          color: C.ink, opacity: 0.55, textTransform: 'uppercase',
        }}>
          {formatDate(post.date)}{post.author ? ` · ${post.author}` : ''}
        </div>
        <div style={{
          fontFamily: F.display, fontWeight: 600, fontSize: isMobile ? 20 : 24,
          letterSpacing: '-0.02em', lineHeight: 1.2, color: C.ink,
          marginTop: 8, textWrap: 'balance',
        }}>
          {post.title}{isExternal && <span style={{ color: C.accent, marginLeft: 8 }}>↗</span>}
        </div>
        {post.summary && (
          <div style={{
            fontFamily: F.editorial, fontStyle: 'italic', fontSize: isMobile ? 15 : 16.5,
            lineHeight: 1.5, color: C.ink, opacity: 0.72,
            marginTop: 8, textWrap: 'pretty',
          }}>
            {post.summary}
          </div>
        )}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            {post.tags.map(t => (
              <span key={t} style={{
                fontFamily: F.mono, fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: '2px 8px', border: `1px solid ${C.ink}30`, color: C.ink, opacity: 0.7,
                fontWeight: 500,
              }}>{t}</span>
            ))}
          </div>
        )}
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
