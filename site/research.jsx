// Research section — three pillar cards plus optional press + projects rows.
// Pillars come from window.RESEARCH_PILLARS (data/research.js); press and
// projects from window.PRESS_COVERAGE / window.WHAT_WE_BUILD.

const { C, F, useIsMobile, MonoLabel, SubSectionTitle, SectionHeader, mdInline } = window;

function ResearchPillars() {
  const pillars = window.RESEARCH_PILLARS;
  const press = window.PRESS_COVERAGE || [];
  const projects = window.WHAT_WE_BUILD || [];
  const isMobile = useIsMobile();

  return (
    <section id="research" style={{ background: C.paper, padding: isMobile ? '72px 0' : '120px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px' }}>
        <SectionHeader title="Research" />

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? 20 : 32,
        }}>
          {pillars.map((p, i) => <PillarCard key={p.id} p={p} i={i} />)}
        </div>

        {press.length > 0 && <PressCoverage items={press} />}
        {projects.length > 0 && <WhatWeBuild items={projects} />}
      </div>
    </section>
  );
}

// Reads window.PRESS_COVERAGE (data/press.js). Renders a row of cover cards
// with the article image on top; when an image is missing or fails to load,
// falls back to a typographic placeholder tinted with the accent color so
// cards stay visually consistent regardless of asset availability.
function PressCoverage({ items }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ marginTop: isMobile ? 56 : 88 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 16, marginBottom: isMobile ? 20 : 28, flexWrap: 'wrap',
      }}>
        <div>
          {/* <MonoLabel>In the press</MonoLabel> */}
          <SubSectionTitle style={{ marginTop: 10 }}>
            Our research in press
          </SubSectionTitle>
        </div>
      </div>

      <CardCarousel cards={items} />
    </div>
  );
}

// Shows at most PER_PAGE cards at once; the rest are hidden to the right and
// revealed by paging with the ">" / "<" controls. Built on native CSS
// scroll-snap (grid-auto-flow: column + overflow-x) so the browser handles
// clamping and snapping; the arrows simply scrollBy one viewport width. On
// mobile the original single-column stack is kept — horizontal hiding is a
// desktop affordance.
const PER_PAGE = 4;
function CardCarousel({ cards, perPage = PER_PAGE }) {
  const isMobile = useIsMobile();
  const scrollerRef = React.useRef(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);

  const updateArrows = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    if (isMobile) return;
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [isMobile, cards.length, updateArrows]);

  if (isMobile) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        {cards.map((m, i) => <PressCard key={i} m={m} />)}
      </div>
    );
  }

  const GAP = 20;
  const page = (dir) => {
    const el = scrollerRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  };

  const arrow = (dir, hidden) => (
    <button
      type="button"
      aria-label={dir > 0 ? 'Show next' : 'Show previous'}
      onClick={() => page(dir)}
      style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        // -22 = half the 44px width, so the button's center sits exactly on the
        // row's edge (right edge of the last card / left edge of the first).
        [dir > 0 ? 'right' : 'left']: -22,
        width: 44, height: 44, borderRadius: '50%',
        background: '#fff', border: `1px solid ${C.ink}22`,
        boxShadow: `0 6px 18px ${C.ink}22`, cursor: 'pointer', zIndex: 5,
        display: hidden ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
        color: C.ink, transition: 'border-color 0.18s ease-out, color 0.18s ease-out, box-shadow 0.18s ease-out',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.accent}88`; e.currentTarget.style.color = C.accent; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${C.ink}22`; e.currentTarget.style.color = C.ink; }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
        style={{ transform: dir > 0 ? 'none' : 'scaleX(-1)' }}>
        <path d="M 5 2 L 10 7 L 5 12" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  return (
    <div style={{ position: 'relative' }}>
      <style>{`.cc-scroller::-webkit-scrollbar{display:none}`}</style>
      <div
        ref={scrollerRef}
        className="cc-scroller"
        onScroll={updateArrows}
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: `calc((100% - ${GAP * (perPage - 1)}px) / ${perPage})`,
          gap: GAP,
          overflowX: 'auto',
          scrollSnapType: 'x proximity',
          scrollbarWidth: 'none',
        }}
      >
        {cards.map((m, i) => (
          <div key={i} style={{ scrollSnapAlign: 'start' }}>
            <PressCard m={m} />
          </div>
        ))}
      </div>
      {arrow(-1, atStart)}
      {arrow(1, atEnd)}
    </div>
  );
}

function PressCard({ m }) {
  const [imgOk, setImgOk] = React.useState(Boolean(m.image));
  return (
    <a
      href={m.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', flexDirection: 'column',
        background: '#fff', border: `1px solid ${C.ink}14`,
        textDecoration: 'none', color: 'inherit',
        transition: 'transform 0.2s ease-out, border-color 0.2s ease-out, box-shadow 0.2s ease-out',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = `${C.accent}55`;
        e.currentTarget.style.boxShadow = `0 8px 24px ${C.ink}12`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = `${C.ink}14`;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* cover */}
      <div style={{
        position: 'relative', aspectRatio: '3 / 2', overflow: 'hidden',
        background: C.paperWarm, borderBottom: `1px solid ${C.ink}10`,
      }}>
        {imgOk ? (
          <img
            src={m.image}
            alt={`${m.outlet} — ${m.headline}`}
            onError={() => setImgOk(false)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <PressPlaceholder outlet={m.outlet} />
        )}
      </div>

      {/* caption */}
      <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12,
        }}>
          <div style={{
            fontFamily: F.display, fontWeight: 700, fontSize: 13,
            letterSpacing: '-0.01em', color: C.ink,
          }}>{m.outlet}</div>
          <div style={{
            fontFamily: F.mono, fontSize: 9.5, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: C.ink, opacity: 0.5,
          }}>{m.date}</div>
        </div>
        <div style={{
          fontFamily: F.editorial, fontSize: 15.5, lineHeight: 1.35,
          color: C.ink, opacity: 0.88, textWrap: 'pretty', letterSpacing: '-0.005em',
        }}>{m.headline}</div>
      </div>
    </a>
  );
}

// Reads window.WHAT_WE_BUILD (data/building.js). Reuses PressCard by mapping
// project fields onto the card's { outlet, headline, date, href, image } shape,
// so the visual treatment (cover + caption row) stays identical to the press
// row above. Only the subheader lede differs.
function WhatWeBuild({ items }) {
  const isMobile = useIsMobile();
  const cards = items.map(p => ({
    outlet: p.name,
    headline: p.tagline,
    date: p.status,
    href: p.href,
    image: p.image,
  }));
  return (
    <div style={{ marginTop: isMobile ? 48 : 72 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 16, marginBottom: isMobile ? 20 : 28, flexWrap: 'wrap',
      }}>
        <div>
          {/* <MonoLabel>What we're building</MonoLabel> */}
          <SubSectionTitle style={{ marginTop: 10 }}>
            What we're building
            {/* Tools, workshops, and competitions — building the product and the community out of lab. */}
          </SubSectionTitle>
        </div>
      </div>

      <CardCarousel cards={cards} />
    </div>
  );
}

// Typographic fallback shown when an outlet cover image is unavailable.
// Mirrors the hero's paper-on-ink palette so the row still feels cohesive.
function PressPlaceholder({ outlet }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(135deg, ${C.paperWarm} 0%, ${C.sand} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* faint wave motif in the corner echoes the site's coastline theme */}
      <svg viewBox="0 0 200 120" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.25 }}>
        <path d="M 0 80 Q 50 70 100 80 T 200 80" fill="none" stroke={C.ink} strokeWidth="1.5" />
        <path d="M 0 96 Q 50 86 100 96 T 200 96" fill="none" stroke={C.accent} strokeWidth="1.5" />
      </svg>
      <div style={{
        fontFamily: F.editorial, fontStyle: 'italic', fontWeight: 500,
        fontSize: 'clamp(22px, 3vw, 32px)', color: C.ink, letterSpacing: '-0.02em',
        textAlign: 'center', padding: '0 16px', position: 'relative',
      }}>{outlet}</div>
    </div>
  );
}

function PillarCard({ p, i }) {
  const isMobile = useIsMobile();
  return (
    <div style={{
      background: '#fff', border: `1px solid ${C.ink}14`,
      padding: isMobile ? 24 : 32,
      display: 'flex', flexDirection: 'column',
      minHeight: isMobile ? 'auto' : 520,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <MonoLabel size={10}>Theme · {p.id}</MonoLabel>
        <PillarFigure kind={p.figure} />
      </div>

      <div style={{
        fontFamily: F.display, fontWeight: 700, fontSize: isMobile ? 24 : 28, letterSpacing: '-0.025em',
        color: C.ink, marginTop: 24, lineHeight: 1.1, textWrap: 'balance',
        minHeight: isMobile ? 'auto' : 66,
      }}>{p.title}</div>

      <div style={{
        fontFamily: F.editorial, fontStyle: 'italic', fontSize: 16, lineHeight: 1.45,
        color: C.ink, opacity: 0.7, marginTop: 18, textWrap: 'pretty',
      }}>{mdInline(p.lede)}</div>

      <ul style={{
        listStyle: 'none', padding: 0, margin: '28px 0 0',
        fontFamily: F.display, fontSize: 14, lineHeight: 1.55, color: C.ink,
      }}>
        {p.bullets.map((b, j) => (
          <li key={j} style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: j === 0 ? 'none' : `1px solid ${C.ink}10` }}>
            <span style={{ color: C.accent, fontFamily: F.mono, fontSize: 11, marginTop: 3, width: 22, flexShrink: 0 }}>
              0{j + 1}
            </span>
            <span style={{ opacity: 0.88 }}>{mdInline(b)}</span>
          </li>
        ))}
      </ul>

      <div style={{ flex: 1 }} />
      <div style={{
        marginTop: 28, paddingTop: 18, borderTop: `1px solid ${C.ink}18`,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <MonoLabel size={9}>Selected work</MonoLabel>
        {p.refs.map((r, k) => {
          // Refs are either a bare string (muted text) or { label, href }
          // (linked to the paper's PDF). Normalize to one shape.
          const label = typeof r === 'string' ? r : r.label;
          const href = typeof r === 'string' ? null : r.href;
          const text = label.startsWith('[') ? label : `→ ${label}`;
          const base = { fontFamily: F.mono, fontSize: 10.5, color: C.ink, opacity: 0.7, letterSpacing: '0.02em' };
          if (!href) return <div key={label} style={base}>{text}</div>;
          return (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...base, textDecoration: 'none', transition: 'color 0.18s ease-out, opacity 0.18s ease-out' }}
              onMouseEnter={e => { e.currentTarget.style.color = C.accent; e.currentTarget.style.opacity = 1; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.ink; e.currentTarget.style.opacity = 0.7; }}
            >{text}</a>
          );
        })}
      </div>
    </div>
  );
}

function PillarFigure({ kind }) {
  if (kind === 'neurons') {
    return (
      <svg width="68" height="50" viewBox="0 0 68 50">
        {[[8,12],[22,24],[38,14],[52,30],[12,38],[30,40],[48,42],[60,10]].map(([x,y],i) =>
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3 : 2} fill={i === 2 ? C.accent : C.ink} opacity={i === 2 ? 1 : 0.8} />
        )}
        {[[8,12,22,24],[22,24,38,14],[38,14,52,30],[22,24,30,40],[38,14,48,42],[52,30,60,10]].map(([x1,y1,x2,y2],i) =>
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.ink} strokeWidth="1" opacity="0.3" />
        )}
      </svg>
    );
  }
  if (kind === 'pulse') {
    return (
      <svg width="68" height="50" viewBox="0 0 68 50">
        <path d="M 2 28 L 14 28 L 18 18 L 22 38 L 26 10 L 30 42 L 34 28 L 66 28"
          fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="66" cy="28" r="2.5" fill={C.accent} />
      </svg>
    );
  }
  // shield
  return (
    <svg width="68" height="50" viewBox="0 0 68 50">
      <path d="M 34 4 L 58 14 L 58 28 C 58 38, 46 46, 34 48 C 22 46, 10 38, 10 28 L 10 14 Z"
        fill="none" stroke={C.ink} strokeWidth="1.5" />
      <path d="M 22 26 L 30 34 L 46 18" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

Object.assign(window, { ResearchPillars });
