// Shared design tokens + tiny primitives used by every section file.
// Loaded first (see <script> order in HTML) so subsequent files can pull
// these off `window` via destructure.
//
// NOTE — token sync. The values in `C` and `F` are mirrored as CSS custom
// properties in /css/site.css (loaded by every HTML page). React inline
// styles read from these JS constants; static HTML pages read from the CSS
// variables. When changing the palette/fonts, update both.

const C = {
  ink: '#003D7C',
  secondary: '#002D5C',
  accent: '#EF7C00',
  paper: '#f5f1ea',
  paperWarm: '#ece4d3',
  sand: '#f6d7b0',
  fog: '#d7dde6',
};

const F = {
  display: "'Inter Tight', Inter, sans-serif",
  editorial: "'Fraunces', 'Times New Roman', serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

// Single mobile breakpoint. 768px is the phone/tablet boundary — below this
// the site collapses multi-column grids, stacks rows, and swaps the Nav for
// a hamburger. Components opt in by calling useIsMobile() and branching on
// the boolean it returns.
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

function WaveMark({ size = 40, rx = 20, bg = C.ink, fg = C.paper, acc = C.accent, stroke = 3 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" style={{ display: 'block' }}>
      <rect width="96" height="96" rx={rx} fill={bg} />
      <path d="M 14 34 Q 28 28 42 34 T 66 34 T 86 34" fill="none" stroke={fg} strokeWidth={stroke} strokeLinecap="round" />
      <path d="M 14 52 Q 28 46 42 52 T 66 52 T 86 52" fill="none" stroke={acc} strokeWidth={stroke + 1} strokeLinecap="round" />
      <path d="M 14 70 Q 28 64 42 70 T 66 70 T 86 70" fill="none" stroke={fg} strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  );
}

function MonoLabel({ children, color = C.ink, opacity = 0.55, size = 11 }) {
  return (
    <div style={{
      fontFamily: F.mono, fontSize: size, letterSpacing: '0.16em',
      color, opacity, textTransform: 'uppercase', fontWeight: 500,
    }}>{children}</div>
  );
}

// Shared sub-section title — the heading that introduces a sub-group inside a
// section (e.g. "Our research in press", "Selected", "Most recent", "Current
// members"). Uppercase mono with a leading accent bar: it sits in the same
// label family as the site's kickers/tags, so it never blends into the body
// text. Single source of truth, so every section stays in sync. The bar is
// always accent-orange (the brand pop); the text defaults to ink for the light
// sections. On the dark Publications background pass `color={C.accent}` so the
// text stays legible (ink would vanish on navy).
function SubSectionTitle({ children, color = C.ink, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      <span aria-hidden="true" style={{
        display: 'inline-block', width: 3, height: 13, borderRadius: 1,
        background: C.accent, flexShrink: 0,
      }} />
      <span style={{
        fontFamily: F.mono, fontSize: 12, fontWeight: 600, letterSpacing: '0.18em',
        textTransform: 'uppercase', color, lineHeight: 1,
      }}>{children}</span>
    </div>
  );
}

// Renders the NUS black-horizontal wordmark tinted to `color`. The source JPG
// is black-on-white; an SVG feColorMatrix filter inverts it, then maps
// luminance into alpha while forcing RGB to the target color — so the white
// background disappears and the logo itself takes on the brand color.
function NusLogo({ height = 32, color = C.ink, title = 'National University of Singapore' }) {
  const src = 'site/nus-logo-black-horizontal.jpg';
  const id = React.useId();
  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;
  const width = Math.round(height * 2.8);
  return (
    <svg
      width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      role="img" aria-label={title}
      style={{ display: 'block' }}
    >
      <defs>
        <filter id={id} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0" />
          <feColorMatrix type="matrix" values={`0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0.3333 0.3333 0.3333 0 0`} />
        </filter>
      </defs>
      <image
        href={src} x="0" y="0" width={width} height={height}
        preserveAspectRatio="xMinYMid meet" filter={`url(#${id})`}
      />
    </svg>
  );
}

// Single-level section header: one plain title line. `kicker` and `lede` are
// optional and retained for sub-pages that still pass them; the live home-page
// sections pass only `title`.
function SectionHeader({ kicker, title, lede, align = 'left' }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ maxWidth: 900, marginBottom: isMobile ? 32 : 56, textAlign: align }}>
      {kicker && <MonoLabel>{kicker}</MonoLabel>}
      <div style={{
        fontFamily: F.display, fontWeight: 700, fontSize: 'clamp(34px, 6.2vw, 56px)',
        letterSpacing: '-0.035em',
        lineHeight: 1.04, color: C.ink, marginTop: kicker ? 14 : 0, textWrap: 'balance',
      }}>{title}</div>
      {lede && (
        <div style={{
          fontFamily: F.editorial, fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(17px, 2.1vw, 22px)',
          lineHeight: 1.45, color: C.ink, opacity: 0.72, marginTop: 20, maxWidth: 720,
          textWrap: 'pretty',
        }}>{lede}</div>
      )}
    </div>
  );
}

// Lightweight inline Markdown — supports **bold**, *italic*, and [text](href)
// links. Used to keep small bits of copy in data/*.js editable without dragging
// in a parser. Returns either the original string (no markup found) or an array
// of React nodes. Patterns can't nest and don't support escapes; that's by
// design — this is for short, hand-written labels, not arbitrary input. Links
// open in a new tab and inherit the surrounding text color (see people.jsx for
// the matching inline-link look).
function mdInline(s) {
  if (typeof s !== 'string') return s;
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  const out = [];
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) out.push(s.slice(last, m.index));
    if (m[1] !== undefined) out.push(
      <a key={i++} href={m[2]} target="_blank" rel="noopener noreferrer"
         style={{ color: 'inherit', textDecoration: 'none', borderBottom: `1px solid ${C.ink}55` }}>{m[1]}</a>
    );
    else if (m[3] !== undefined) out.push(<b key={i++}>{m[3]}</b>);
    else out.push(<i key={i++}>{m[4]}</i>);
    last = re.lastIndex;
  }
  if (!out.length) return s;
  if (last < s.length) out.push(s.slice(last));
  return out;
}

Object.assign(window, { C, F, useIsMobile, WaveMark, MonoLabel, SubSectionTitle, NusLogo, SectionHeader, mdInline });
