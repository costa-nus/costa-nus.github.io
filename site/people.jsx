// People section — current members grid + previous mentees row.
// Reads window.PEOPLE / window.ALUMNI (data/people.js).

const { C, F, useIsMobile, MonoLabel, SubSectionTitle, SectionHeader } = window;

const PEOPLE = window.PEOPLE;
const ALUMNI = window.ALUMNI;

function People() {
  const isMobile = useIsMobile();
  return (
    <section id="people" style={{ background: C.paper, padding: isMobile ? '72px 0' : '120px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px' }}>
        <SectionHeader title="People" />

        <SubSectionTitle>Current members</SubSectionTitle>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '180px' : '240px'}, 1fr))`,
          gap: 1,
          marginTop: 16, background: `${C.ink}18`, border: `1px solid ${C.ink}18`,
        }}>
          {PEOPLE.map((p, i) => <PersonCard key={i} p={p} />)}
        </div>

        <div style={{ height: isMobile ? 48 : 80 }} />
        <SubSectionTitle>Previous mentees with PI (before NUS)</SubSectionTitle>
        <div style={{ marginTop: 16, borderTop: `1px solid ${C.ink}22` }}>
          {ALUMNI.map((a, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr 1.4fr',
              gap: isMobile ? 4 : 24,
              padding: isMobile ? '14px 0' : '16px 0',
              borderBottom: `1px solid ${C.ink}15`,
              alignItems: 'baseline',
            }}>
              <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 17, color: C.ink, letterSpacing: '-0.015em' }}>
                {a.url ? (
                  <a href={a.url} target="_blank" rel="noopener noreferrer"
                     style={{ color: 'inherit', textDecoration: 'none', borderBottom: `1px solid ${C.ink}33` }}>
                    {a.name}
                  </a>
                ) : a.name}
              </div>
              <div style={{ fontFamily: F.display, fontSize: 13, color: C.ink, opacity: 0.6 }}>
                {a.prior}
              </div>
              <div style={{ fontFamily: F.editorial, fontStyle: 'italic', fontSize: 16, color: C.ink, opacity: 0.9 }}>
                → {a.now}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Visual priority, strongest → softest: PI (ink) > RA/PhD (fog) > Intern (white) > Open (paperWarm + dashed).
// Keys must match the `kind` enum in data/people.js; unknown/missing values fall back to 'ra'.
const PERSON_PALETTE = {
  pi:     { bg: C.ink,       fg: C.paper, dot: C.accent,      dotBorder: 'none' },
  ra:     { bg: C.fog,       fg: C.ink,   dot: C.ink,         dotBorder: 'none' },
  intern: { bg: '#fff',      fg: C.ink,   dot: `${C.ink}25`,  dotBorder: 'none' },
  open:   { bg: C.paperWarm, fg: C.ink,   dot: 'transparent', dotBorder: `1.5px dashed ${C.ink}55` },
};

function PersonCard({ p }) {
  const kind = PERSON_PALETTE[p.kind] ? p.kind : 'ra';
  const palette = PERSON_PALETTE[kind];
  const { bg, fg } = palette;
  return (
    <div style={{
      background: bg, color: fg, padding: 24, minHeight: 180, display: 'flex', flexDirection: 'column',
      justifyContent: 'flex-start', gap: 18, position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 32,
          height: kind === 'open' ? 0 : 3,
          borderRadius: 2,
          background: palette.dot,
          borderTop: kind === 'open' ? palette.dotBorder : 'none',
        }} />
        {kind === 'open' && (
          <div style={{
            fontFamily: F.mono, fontSize: 9, letterSpacing: '0.16em', color: C.accent,
            textTransform: 'uppercase', fontWeight: 600,
          }}>• Hiring</div>
        )}
      </div>
      <div>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 17, letterSpacing: '-0.015em', lineHeight: 1.15 }}>
          {p.url ? (
            <a href={p.url} target="_blank" rel="noopener noreferrer"
               style={{ color: 'inherit', textDecoration: 'none', borderBottom: `1px solid ${fg}33` }}>
              {p.name}
            </a>
          ) : kind === 'open' ? (
            <a href="/openings/"
               style={{ color: 'inherit', textDecoration: 'none', borderBottom: `1px solid ${fg}33` }}>
              {p.name}
            </a>
          ) : p.name}
        </div>
        <div style={{ fontFamily: F.display, fontSize: 12.5, opacity: 0.75, marginTop: 4 }}>
          {p.role}
        </div>
        {p.highlight && (
          <div style={{
            display: 'flex', gap: 6, alignItems: 'baseline', marginTop: 8,
            fontFamily: F.editorial, fontStyle: 'italic', fontSize: 13, lineHeight: 1.3,
          }}>
            <span style={{ color: C.accent, flexShrink: 0 }}>▸</span>
            <span style={{ opacity: 0.92 }}>{p.highlight}</span>
          </div>
        )}
        <div style={{ fontFamily: F.mono, fontSize: 9.5, letterSpacing: '0.08em', opacity: 0.55, marginTop: 10 }}>
          {p.term}
        </div>
        <PersonLinks p={p} fg={fg} />
      </div>
    </div>
  );
}

// Conditional social-icon row. Declared once as a table so adding a network
// is a one-line change; each icon renders only when its field is present on
// the person (see data/people.js). Icons inherit the card's foreground color.
const PERSON_LINKS = [
  { field: 'url',     type: 'homepage', title: 'Homepage' },
  { field: 'scholar', type: 'scholar',  title: 'Google Scholar' },
  { field: 'x',       type: 'x',        title: 'X (Twitter)' },
];

function PersonLinks({ p, fg }) {
  const items = PERSON_LINKS.filter(l => p[l.field]);
  if (!items.length) return null;
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 14 }}>
      {items.map(l => (
        <a
          key={l.type}
          href={p[l.field]}
          target="_blank"
          rel="noopener noreferrer"
          title={l.title}
          aria-label={l.title}
          style={{ color: fg, opacity: 0.55, display: 'block', transition: 'opacity 0.18s ease-out' }}
          onMouseEnter={e => { e.currentTarget.style.opacity = 1; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0.55; }}
        >
          <ProfileIcon type={l.type} />
        </a>
      ))}
    </div>
  );
}

// Inline monochrome icons (fill/stroke = currentColor). Scholar + X use the
// canonical brand glyph paths; homepage is a generic globe. Named ProfileIcon
// (not SocialIcon) to avoid clobbering footer.jsx's SocialIcon in the shared
// global scope — top-level function declarations across section files collide.
function ProfileIcon({ type, size = 15 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', style: { display: 'block' } };
  if (type === 'homepage') {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.5" />
        <path d="M2.5 12h19" />
        <path d="M12 2.5c3.2 3.2 3.2 15.8 0 19c-3.2-3.2-3.2-15.8 0-19z" />
      </svg>
    );
  }
  if (type === 'scholar') {
    return (
      <svg {...common} fill="currentColor">
        <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
      </svg>
    );
  }
  if (type === 'x') {
    return (
      <svg {...common} fill="currentColor">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
      </svg>
    );
  }
  return null;
}

Object.assign(window, { People });
