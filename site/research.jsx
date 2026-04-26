// Research section — three pillar cards plus optional press + projects rows.
// Pillars come from window.RESEARCH_PILLARS (data/research.js); press and
// projects from window.PRESS_COVERAGE / window.WHAT_WE_BUILD.

const { C, F, useIsMobile, MonoLabel, SectionHeader, mdInline } = window;

function ResearchPillars() {
  const pillars = window.RESEARCH_PILLARS;
  const press = window.PRESS_COVERAGE || [];
  const projects = window.WHAT_WE_BUILD || [];
  const isMobile = useIsMobile();

  return (
    <section id="research" style={{ background: C.paper, padding: isMobile ? '72px 0' : '120px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px' }}>
        <SectionHeader
          kicker="§ 01 · Research"
          title="Three currents, one coastline."
          lede="We aim to build trustworthy AI via exploring the cognitive dark matter (the human's internal cognitive processes that are not observable in data, e.g., the emotion, intention, etc.), which forges the fundation for applying AI in high-stakes domains, specifically cognitive health."
        />

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
          <MonoLabel>In the press</MonoLabel>
          <div style={{
            fontFamily: F.editorial, fontStyle: 'italic', fontSize: 'clamp(20px, 2.4vw, 26px)',
            color: C.ink, opacity: 0.78, marginTop: 10, textWrap: 'pretty', maxWidth: 620,
          }}>
            Our research on LLM Brain Rot, featured by major outlets.
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile
          ? '1fr'
          : `repeat(auto-fit, minmax(220px, 1fr))`,
        gap: isMobile ? 16 : 20,
      }}>
        {items.map((m, i) => <PressCard key={i} m={m} />)}
      </div>
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
          <MonoLabel>What we're building</MonoLabel>
          <div style={{
            fontFamily: F.editorial, fontStyle: 'italic', fontSize: 'clamp(20px, 2.4vw, 26px)',
            color: C.ink, opacity: 0.78, marginTop: 10, textWrap: 'pretty', maxWidth: 620,
          }}>
            Tools, workshops, and competitions — building the product and the community out of lab.
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile
          ? '1fr'
          : `repeat(auto-fit, minmax(220px, 1fr))`,
        gap: isMobile ? 16 : 20,
      }}>
        {cards.map((m, i) => <PressCard key={i} m={m} />)}
      </div>
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
        {p.refs.map(r => (
          <div key={r} style={{ fontFamily: F.mono, fontSize: 10.5, color: C.ink, opacity: 0.7, letterSpacing: '0.02em' }}>
            {r.startsWith('[') ? r : `→ ${r}`}
          </div>
        ))}
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
