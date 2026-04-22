// CoSTA@NUS Lab website — page sections.
// Pulls design tokens from window.TOKENS (loaded via ds/tokens.jsx).

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

// ————————————————————————————————————————————————————————————
// Responsive helpers
// ————————————————————————————————————————————————————————————

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

// ————————————————————————————————————————————————————————————
// Shared atoms
// ————————————————————————————————————————————————————————————

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

function SectionHeader({ kicker, title, lede, align = 'left' }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ maxWidth: 900, marginBottom: isMobile ? 32 : 56, textAlign: align }}>
      <MonoLabel>{kicker}</MonoLabel>
      <div style={{
        fontFamily: F.display, fontWeight: 700, fontSize: 'clamp(34px, 6.2vw, 56px)',
        letterSpacing: '-0.035em',
        lineHeight: 1.04, color: C.ink, marginTop: 14, textWrap: 'balance',
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

// ————————————————————————————————————————————————————————————
// 01 — Nav
// ————————————————————————————————————————————————————————————

function Nav({ basePath = '' }) {
  // basePath: '' on the home page (hash jumps stay on-page); '/' (or similar)
  // on standalone sub-pages so hash links navigate back to the corresponding home section.
  const items = ['Research', 'Publications', 'People', 'News', 'Join'];
  const logoHref = basePath || '#top';
  const isHome = basePath === '';
  const isMobile = useIsMobile();
  const [revealed, setRevealed] = React.useState(!isHome);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isHome) return;
    const hero = document.getElementById('top');
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setRevealed(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, [isHome]);

  // Close the drawer when resizing back to desktop so it doesn't linger.
  React.useEffect(() => { if (!isMobile) setMenuOpen(false); }, [isMobile]);

  const wrapStyle = isHome
    ? {
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30,
        background: `${C.paper}99`, backdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${C.ink}16`,
        transform: revealed ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 320ms cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform',
      }
    : {
        position: 'sticky', top: 0, zIndex: 30, background: `${C.paper}99`,
        backdropFilter: 'blur(14px)', borderBottom: `1px solid ${C.ink}16`,
      };

  const linkStyle = (i, size = 13.5) => ({
    fontFamily: F.display, fontSize: size, fontWeight: 500, color: C.ink,
    opacity: i === 'Join' ? 1 : 0.75, textDecoration: 'none', letterSpacing: '-0.005em',
    ...(i === 'Join' ? { color: C.accent } : {}),
  });

  return (
    <div style={wrapStyle}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: isMobile ? '14px 20px' : '18px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href={logoHref} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <WaveMark size={isMobile ? 32 : 36} rx={isMobile ? 16 : 18} />
          <div>
            <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: isMobile ? 15 : 17, letterSpacing: '-0.02em', color: C.ink, lineHeight: 1 }}>
              Co<span style={{ color: C.accent }}>STA</span>
              <span style={{ opacity: 0.5, fontWeight: 500 }}>@NUS</span>
            </div>
            <div style={{ fontFamily: F.mono, fontSize: isMobile ? 7.5 : 8.5, letterSpacing: '0.18em', color: C.ink, opacity: 0.55, marginTop: 3 }}>
              COGNITIVE SCIENCE · TRUSTWORTHY AI
            </div>
          </div>
        </a>
        {isMobile ? (
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            style={{
              background: 'transparent', border: 'none', padding: 8,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              gap: 5, cursor: 'pointer', width: 40, height: 40,
            }}
          >
            <span style={{
              width: 22, height: 2, background: C.ink, borderRadius: 1,
              transformOrigin: 'center', transition: 'transform 200ms, opacity 200ms',
              transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
            }} />
            <span style={{
              width: 22, height: 2, background: C.ink, borderRadius: 1,
              opacity: menuOpen ? 0 : 1, transition: 'opacity 150ms',
            }} />
            <span style={{
              width: 22, height: 2, background: C.ink, borderRadius: 1,
              transformOrigin: 'center', transition: 'transform 200ms, opacity 200ms',
              transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
            }} />
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {items.map(i => (
              <a key={i} href={`${basePath}#${i.toLowerCase()}`} style={linkStyle(i)}>
                {i}{i === 'Join' && ' →'}
              </a>
            ))}
          </div>
        )}
      </div>
      {isMobile && menuOpen && (
        <div style={{
          borderTop: `1px solid ${C.ink}16`,
          padding: '18px 24px 24px',
          background: C.paper,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {items.map(i => (
            <a
              key={i}
              href={`${basePath}#${i.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={linkStyle(i, 17)}
            >
              {i}{i === 'Join' && ' →'}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// 02 — Hero
// ————————————————————————————————————————————————————————————

function useOceanPath({ baseY, amp, speed, phase = 0, segments = 14, width = 1400 }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf; const start = performance.now();
    const tick = (now) => { setT((now - start) / 1000); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const y = baseY
      + Math.sin(t * speed + phase + i * 0.7) * amp
      + Math.sin(t * speed * 0.6 + phase * 1.3 + i * 1.4) * amp * 0.35;
    pts.push([x, y]);
  }
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` Q ${x0} ${y0} ${cx} ${(y0 + y1) / 2}`;
  }
  d += ` T ${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`;
  return d;
}

function OceanWave({ baseY, amp, speed, phase, stroke, strokeOpacity, strokeWidth }) {
  const d = useOceanPath({ baseY, amp, speed, phase });
  return <path d={d} fill="none" stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth={strokeWidth} strokeLinecap="round" />;
}

function Hero() {
  const isMobile = useIsMobile();
  return (
    <section id="top" style={{ background: C.paper, paddingTop: isMobile ? 80 : 64, paddingBottom: isMobile ? 72 : 96, position: 'relative', overflow: 'hidden', minHeight: '100vh', boxSizing: 'border-box' }}>
      {/* Coastline SVG backdrop — animated, full viewport width */}
      <svg
        viewBox="0 0 1400 400" preserveAspectRatio="none"
        style={{ position: 'absolute', left: '50%', right: 'auto', bottom: 0, width: '100vw', height: 320, opacity: 0.6, transform: 'translateX(-50%)', pointerEvents: 'none' }}
      >
        <OceanWave baseY={180} amp={8}  speed={0.55} phase={0.0} stroke={C.ink}    strokeOpacity={0.18} strokeWidth={1.5} />
        <OceanWave baseY={220} amp={10} speed={0.70} phase={1.1} stroke={C.accent} strokeOpacity={0.45} strokeWidth={2} />
        <OceanWave baseY={260} amp={9}  speed={0.50} phase={2.2} stroke={C.ink}    strokeOpacity={0.14} strokeWidth={1.5} />
        <OceanWave baseY={300} amp={12} speed={0.40} phase={3.3} stroke={C.ink}    strokeOpacity={0.10} strokeWidth={1.5} />
      </svg>
      {/* sun — breathing */}
      <style>{`
        @keyframes costaBreathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.12); }
        }
        @keyframes costaBreatheInner {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.75; }
        }
        @keyframes costaSunRing1 {
          0%, 100% { width: 26px;  height: 26px;  background: ${C.accent}22; }
          50%      { width: 34px;  height: 34px;  background: ${C.accent}2e; }
        }
        @keyframes costaSunRing2 {
          0%, 100% { width: 50px;  height: 50px;  background: ${C.accent}10; }
          50%      { width: 66px;  height: 66px;  background: ${C.accent}16; }
        }
        @keyframes costaSunRing3 {
          0%, 100% { width: 82px;  height: 82px;  background: ${C.accent}04; }
          50%      { width: 106px; height: 106px; background: ${C.accent}06; }
        }
        .costa-sun {
          position: absolute; right: 12%; top: 120px; width: 14px; height: 14px; border-radius: 50%;
          background: ${C.accent};
          isolation: isolate;
          animation: costaBreathe 4.2s ease-in-out infinite;
          will-change: transform;
        }
        @media (max-width: 767px) {
          .costa-sun { right: 14%; top: 96px; width: 11px; height: 11px; }
        }
        .costa-sun::after {
          content:''; position:absolute; inset: -3px; border-radius: 50%;
          background: ${C.accent}; opacity: 0.35; filter: blur(6px);
          animation: costaBreatheInner 4.2s ease-in-out infinite;
        }
        .costa-sun-ring {
          position: absolute; top: 50%; left: 50%;
          border-radius: 50%; pointer-events: none;
          transform: translate(-50%, -50%); z-index: -1;
          display: block;
        }
        .costa-sun-ring-1 { animation: costaSunRing1 4.2s ease-in-out infinite; }
        .costa-sun-ring-2 { animation: costaSunRing2 4.2s ease-in-out infinite; }
        .costa-sun-ring-3 { animation: costaSunRing3 4.2s ease-in-out infinite; }
        @keyframes costaDotBreathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.15); }
        }
        @keyframes costaDotHaloInner {
          0%, 100% { width: 0.6em;  height: 0.6em;  background: ${C.accent}22; }
          50%      { width: 0.8em;  height: 0.8em;  background: ${C.accent}2a; }
        }
        @keyframes costaDotHaloOuter {
          0%, 100% { width: 1.08em; height: 1.08em; background: ${C.accent}0c; }
          50%      { width: 1.44em; height: 1.44em; background: ${C.accent}12; }
        }
        .costa-dot-accent {
          position: relative; isolation: isolate;
          display: inline-block; width: 0.24em; height: 0.24em; margin-left: 0.12em;
          vertical-align: baseline; border-radius: 50%; background: ${C.accent};
          animation: costaDotBreathe 4.2s ease-in-out infinite;
          will-change: transform;
        }
        .costa-dot-accent::before,
        .costa-dot-accent::after {
          content: ''; position: absolute; top: 50%; left: 50%;
          border-radius: 50%; pointer-events: none;
          transform: translate(-50%, -50%); z-index: -1;
        }
        .costa-dot-accent::before {
          width: 1.08em; height: 1.08em; background: ${C.accent}0c;
          animation: costaDotHaloOuter 4.2s ease-in-out infinite;
        }
        .costa-dot-accent::after {
          width: 0.6em; height: 0.6em; background: ${C.accent}22;
          animation: costaDotHaloInner 4.2s ease-in-out infinite;
        }
        .costa-wave-wrap { position: absolute; left: 0; right: 0; bottom: 0; width: 100vw; height: 320px; overflow: hidden; pointer-events: none; }
      `}</style>
      <div className="costa-sun">
        <span className="costa-sun-ring costa-sun-ring-3" />
        <span className="costa-sun-ring costa-sun-ring-2" />
        <span className="costa-sun-ring costa-sun-ring-1" />
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px', position: 'relative' }}>
        <MonoLabel></MonoLabel>
        <h1 style={{
          fontFamily: F.display, fontWeight: 500, fontSize: 'clamp(38px, 7.8vw, 96px)',
          letterSpacing: '-0.04em', lineHeight: 1.0, color: `${C.ink}80`, margin: '28px 0 0',
          textWrap: 'balance',
        }}>
          <span style={{ fontWeight: 800, color: C.ink }}>Co</span>gnitive{' '}
          <span style={{ fontWeight: 800, color: C.ink }}>S</span>cience <span style={{ opacity: 0.75 }}>&amp;</span>{' '}
          <span style={{ fontWeight: 800, color: C.ink }}>T</span>rustworthy{' '}
          <span style={{ fontWeight: 800, color: C.ink }}>A</span>I
          <br />
          Lab
          <span className="costa-dot-accent" />
        </h1>
{/* 
        <div style={{
          fontFamily: F.editorial, fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(18px, 2.4vw, 26px)', lineHeight: 1.4,
          color: C.ink, opacity: 0.78, maxWidth: 780,
          marginTop: isMobile ? 28 : 40, textWrap: 'pretty',
        }}>
          A frontier where human minds meet machine intelligence — navigating the uncharted
          waters of trustworthy AI, guided by cognitive science and a commitment to safe,
          ethical innovation.
        </div> */}

        {/* Meta row */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: isMobile ? 24 : 48,
          marginTop: isMobile ? 40 : 56,
          borderTop: `1px solid ${C.ink}1f`, paddingTop: 24,
        }}>
          {[
            ['LOCATION', (
              <>
                <div>Dept. of Electrical & Computer Engineering</div>
                <div>National University of Singapore</div>
              </>
            )],
          ].map(([k, v]) => (
            <div key={k}>
              <MonoLabel size={9.5}>{k}</MonoLabel>
              <div style={{ fontFamily: F.display, fontSize: 14, color: C.ink, marginTop: 6, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ————————————————————————————————————————————————————————————
// 03 — PI intro
// ————————————————————————————————————————————————————————————

function PIIntro() {
  const isMobile = useIsMobile();
  return (
    <section style={{ background: C.paperWarm, padding: isMobile ? '64px 0' : '96px 0' }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
        gap: isMobile ? 40 : 80, alignItems: 'start',
      }}>
        {/* portrait */}
        <div style={{ maxWidth: isMobile ? 320 : 'none', margin: isMobile ? '0 auto' : undefined, width: '100%' }}>
          <div style={{
            aspectRatio: '3 / 4', border: `1px solid ${C.ink}22`,
            position: 'relative', overflow: 'hidden', background: C.paper,
          }}>
            <img
              src="site/jason-hong.png"
              alt="Junyuan ‘Jason’ Hong"
              style={{
                width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top',
                display: 'block', filter: 'saturate(0.92) contrast(1.02)',
              }}
            />
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: '38%',
              background: `linear-gradient(to bottom, transparent, ${C.ink}20)`,
              pointerEvents: 'none',
            }} />
          </div>
          <div style={{ marginTop: 20 }}>
            <MonoLabel size={9}>Principal Investigator</MonoLabel>
            <a
              href="https://jyhong.gitlab.io/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block', fontFamily: F.display, fontWeight: 700, fontSize: 26,
                letterSpacing: '-0.02em', color: C.ink, marginTop: 8,
                textDecoration: 'none', transition: 'color 0.15s ease-out',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.accent; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.ink; }}
            >
              Junyuan "Jason" Hong
            </a>
            <div style={{ fontFamily: F.display, fontSize: 14, color: C.ink, opacity: 0.7, marginTop: 4 }}>
              Assistant Professor, NUS ECE
            </div>
          </div>
        </div>

        <div>
          <MonoLabel>A word from the PI</MonoLabel>
          <div style={{
            fontFamily: F.editorial, fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(22px, 3vw, 30px)',
            lineHeight: 1.35, color: C.ink, marginTop: 16, textWrap: 'pretty', letterSpacing: '-0.01em',
          }}>
            “My research interest is to explore the frontier where <u style={{ textDecorationColor: C.accent, textDecorationThickness: 2, textUnderlineOffset: 4 }}>human minds meet machine intelligence</u>
            {' '}— navigating the uncharted waters of trustworthy AI, guided by cognitive
            science and a commitment to safe, ethical innovation.”
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? 20 : 40, marginTop: isMobile ? 32 : 48,
            fontFamily: F.display, fontSize: 15, lineHeight: 1.6, color: C.ink, opacity: 0.85,
          }}>
            <p style={{ margin: 0 }}>
              Previously a research fellow at Massachusetts General Hospital &amp; Harvard Medical
              School, after two years at Institute for Foundations of Machine Learning (IFML) and
              the University of Texas at Austin.
            </p>
            <p style={{ margin: 0 }}>
              Named an <b style={{ color: C.ink }}>MLSys Rising Star</b> (2024), <b>Top Area Chair</b> at
              NeurIPS 2025, and a <b>Best Paper Finalist</b> at VLDB 2024. Supported by OpenAI's
              Researcher Access Program.
            </p>
          </div>

          {/* coverage strip */}
          <div style={{ marginTop: 48 }}>
            <MonoLabel size={9}>Covered in</MonoLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 14, alignItems: 'center' }}>
              {[
                ['Nature News',    'https://www.nature.com/articles/d41586-025-03542-2'],
                ['WIRED',          'https://www.wired.com/story/ai-models-social-media-cognitive-decline-study/'],
                ['Forbes',         'https://www.forbes.com/sites/lesliekatz/2025/10/23/junky-online-content-gives-ai-models-brain-rot-too/'],
                ['FORTUNE',        'https://fortune.com/2025/10/22/ai-brain-rot-junk-social-media-viral-addicting-content-tech/'],
                ['The White House','https://www.whitehouse.gov/ostp/news-updates/2023/03/31/us-uk-annouce-winners-innovation-pets-democratic-values/'],
              ].map(([n, href]) => (
                <a
                  key={n}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: F.editorial, fontStyle: 'italic', fontSize: 22, color: C.ink, opacity: 0.5,
                    letterSpacing: '-0.01em', textDecoration: 'none',
                    transition: 'opacity 0.15s ease-out, color 0.15s ease-out',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = C.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = C.ink; }}
                >{n}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ————————————————————————————————————————————————————————————
// 04 — Research pillars
// ————————————————————————————————————————————————————————————

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
          lede="We work at the intersection of cognitive science, healthcare, and trustworthy AI — each theme feeding the next."
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

// ————————————————————————————————————————————————————————————
// 04b — In the Press (visual covers)
// ————————————————————————————————————————————————————————————
//
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

// ————————————————————————————————————————————————————————————
// 04c — What we're building (active projects)
// ————————————————————————————————————————————————————————————
//
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
      }}>{p.lede}</div>

      <ul style={{
        listStyle: 'none', padding: 0, margin: '28px 0 0',
        fontFamily: F.display, fontSize: 14, lineHeight: 1.55, color: C.ink,
      }}>
        {p.bullets.map((b, j) => (
          <li key={j} style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: j === 0 ? 'none' : `1px solid ${C.ink}10` }}>
            <span style={{ color: C.accent, fontFamily: F.mono, fontSize: 11, marginTop: 3, width: 22, flexShrink: 0 }}>
              0{j + 1}
            </span>
            <span style={{ opacity: 0.88 }}>{b}</span>
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

// ————————————————————————————————————————————————————————————
// 05 — Publications
// ————————————————————————————————————————————————————————————

// The landing page's Publications section derives its list from PUBS_FULL
// (entries flagged `selected: true`), so editing one flag in the archive
// propagates to both places. No separate curated PUBS array.

// Complete archive, mirrored from https://jyhong.gitlab.io/. Each entry carries:
//   year, venue (may include modifier like "(Spotlight)"), title,
//   authors [{ name, highlighted?, note? }], links [{ label, href }], tags[],
//   selected? (PI flagged), detail? (PI's detail page).
// `highlighted: true` marks the PI / CoSTA member — rendered bold.
// `note` on an author surfaces as a tooltip (e.g. "Equal contribution").
// Link labels preserve the PI site's capsule text verbatim ("PDF", "🌍 Website",
// "🤗 Dataset", etc.).
const PUBS_FULL = window.PUBS_FULL;

function Publications() {
  const [filter, setFilter] = React.useState('All');
  const isMobile = useIsMobile();
  // Selected = PI-flagged entries from the archive. Derived so the landing
  // page and /publications/ stay in sync from a single source of truth.
  const selected = React.useMemo(() => PUBS_FULL.filter(p => p.selected), []);
  const tags = React.useMemo(() => {
    const set = new Set();
    selected.forEach(p => (p.tags || []).forEach(t => set.add(t)));
    return ['All', ...[...set].sort()];
  }, [selected]);
  const filtered = filter === 'All' ? selected : selected.filter(p => (p.tags || []).includes(filter));

  return (
    <section id="publications" style={{ background: C.secondary, padding: isMobile ? '72px 0' : '120px 0', color: C.paper }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px' }}>
        <div style={{ maxWidth: 900, marginBottom: isMobile ? 32 : 56 }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.16em', color: C.paper, opacity: 0.6, textTransform: 'uppercase', fontWeight: 500 }}>
            § 02 · Publications
          </div>
          <div style={{
            fontFamily: F.display, fontWeight: 700, fontSize: 'clamp(34px, 6.2vw, 56px)',
            letterSpacing: '-0.035em',
            lineHeight: 1.04, color: C.paper, marginTop: 14, textWrap: 'balance',
          }}>
            A selected record of what we've charted.
          </div>
        </div>

        {/* filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
          {tags.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                fontFamily: F.mono, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '8px 14px', border: `1px solid ${C.paper}33`,
                background: filter === t ? C.accent : 'transparent',
                color: filter === t ? C.paper : C.paper,
                opacity: filter === t ? 1 : 0.85,
                cursor: 'pointer', fontWeight: 500,
              }}
            >{t}</button>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${C.paper}22` }}>
          {filtered.map((p, i) => (
            <PubRow key={i} p={p} showYear={i === 0 || filtered[i - 1].year !== p.year} />
          ))}
        </div>

        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
          <a href="/publications/" style={{
            fontFamily: F.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: C.accent, textDecoration: 'none', fontWeight: 500,
            padding: '10px 16px', border: `1px solid ${C.accent}`,
          }}>
            View all publications →
          </a>
        </div>
      </div>
    </section>
  );
}

// Pick the best external link for a publication title: prefer a project
// website, then the PDF/preprint, then fall back to the first link.
function pickPubHref(p) {
  const links = p.links || [];
  if (!links.length) return null;
  const score = (l) => {
    const lab = (l.label || '').toLowerCase();
    if (lab.includes('website')) return 0;
    if (lab === 'pdf' || lab === 'preprint') return 1;
    return 2;
  };
  return [...links].sort((a, b) => score(a) - score(b))[0].href;
}

function PubRow({ p, showYear = true }) {
  const isMobile = useIsMobile();
  // venue may be bare ("ICLR") or carry a parenthetical modifier ("ICLR (Spotlight)",
  // "VLDB (Best Paper Finalist)"). Split so the two-line column still shows a
  // distinct type sub-label when there is one.
  const venueMatch = (p.venue || '').match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  const venueBase = venueMatch ? venueMatch[1] : p.venue;
  const typeLabel = venueMatch ? venueMatch[2] : (p.type || '');
  const highlight = /(Spotlight|Best Paper|Finalist|Oral)/i.test(typeLabel);
  const href = pickPubHref(p);
  const titleNode = href
    ? <a href={href} target="_blank" rel="noopener"
         style={{ color: 'inherit', textDecoration: 'none', borderBottom: `1px solid ${C.paper}33` }}>
        {p.title}
      </a>
    : p.title;

  const tagChips = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
      {p.tags.map(t => (
        <span key={t} style={{
          fontFamily: F.mono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '4px 8px', border: `1px solid ${C.paper}33`, color: C.paper, opacity: 0.7,
          whiteSpace: 'nowrap',
        }}>{t}</span>
      ))}
    </div>
  );

  // When a paper has press coverage, surface outlet names (echoing the
  // PIIntro "Covered in" strip) in the slot that would otherwise hold
  // tag chips. Italic editorial serif, hover brightens to accent.
  const mediaStrip = p.media && p.media.length > 0 ? (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '4px 12px',
      justifyContent: isMobile ? 'flex-start' : 'flex-end',
      alignItems: 'baseline',
    }}>
      <span style={{
        fontFamily: F.mono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: C.paper, opacity: 0.5, fontWeight: 500, marginRight: 2,
      }}>Covered in</span>
      {p.media.map(m => (
        <a key={m.name} href={m.href} target="_blank" rel="noopener noreferrer"
           style={{
             fontFamily: F.editorial, fontStyle: 'italic', fontSize: 13,
             color: C.paper, opacity: 0.7, textDecoration: 'none',
             letterSpacing: '-0.005em', whiteSpace: 'nowrap',
             transition: 'opacity 0.15s ease-out, color 0.15s ease-out',
           }}
           onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = C.accent; }}
           onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.color = C.paper; }}
        >{m.name}</a>
      ))}
    </div>
  ) : null;
  const hasTags = p.tags && p.tags.length > 0;
  const sideSlot = mediaStrip ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: isMobile ? 'flex-start' : 'flex-end' }}>
      {mediaStrip}
      {hasTags && tagChips}
    </div>
  ) : (hasTags ? tagChips : null);

  if (isMobile) {
    return (
      <div style={{ padding: '18px 0', borderBottom: `1px solid ${C.paper}18` }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap',
          fontFamily: F.mono, fontSize: 11, letterSpacing: '0.08em', color: C.paper, opacity: 0.75,
        }}>
          <span>{p.year}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ fontFamily: F.display, fontWeight: 600, fontSize: 13, opacity: 1, letterSpacing: 0 }}>
            {venueBase}
          </span>
          {typeLabel && (
            <span style={{
              color: highlight ? C.accent : C.paper, opacity: highlight ? 1 : 0.55,
              textTransform: 'uppercase', fontWeight: 500,
            }}>
              {typeLabel}
            </span>
          )}
        </div>
        <div style={{
          fontFamily: F.editorial, fontSize: 17, lineHeight: 1.32, color: C.paper,
          letterSpacing: '-0.005em', marginTop: 8, textWrap: 'pretty',
        }}>
          {p.selected && (
            <span title="PI's selected pick" style={{
              color: C.accent, marginRight: 6, fontFamily: F.display, fontSize: 15,
            }}>★</span>
          )}
          {titleNode}
        </div>
        {sideSlot && <div style={{ marginTop: 10 }}>{sideSlot}</div>}
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '100px 160px 1fr 200px',
      gap: 24,
      padding: '22px 0', borderBottom: `1px solid ${C.paper}18`, alignItems: 'baseline',
    }}>
      <div style={{ fontFamily: F.mono, fontSize: 13, color: C.paper, opacity: 0.85, letterSpacing: '0.05em' }}>
        {showYear ? p.year : ''}
      </div>
      <div>
        <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 15, color: C.paper }}>{venueBase}</div>
        {typeLabel && (
          <div style={{
            fontFamily: F.mono, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: highlight ? C.accent : C.paper, opacity: highlight ? 1 : 0.5, marginTop: 4, fontWeight: 500,
          }}>
            {typeLabel}
          </div>
        )}
      </div>
      <div style={{
        fontFamily: F.editorial, fontSize: 19, lineHeight: 1.35, color: C.paper,
        letterSpacing: '-0.005em', textWrap: 'pretty',
      }}>
        {p.selected && (
          <span title="PI's selected pick" style={{
            color: C.accent, marginRight: 8, fontFamily: F.display, fontSize: 16,
            verticalAlign: '1px',
          }}>★</span>
        )}
        {titleNode}
      </div>
      {sideSlot}
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// 06 — People
// ————————————————————————————————————————————————————————————
const PEOPLE = window.PEOPLE;
const ALUMNI = window.ALUMNI;

function People() {
  const isMobile = useIsMobile();
  return (
    <section id="people" style={{ background: C.paper, padding: isMobile ? '72px 0' : '120px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px' }}>
        <SectionHeader
          kicker="§ 03 · People"
          title="Navigators, in and out of the lab."
          // lede="Current members, open positions, and alumni charting their own courses after CoSTA."
        />

        <MonoLabel size={10}>Current members</MonoLabel>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '180px' : '240px'}, 1fr))`,
          gap: 1,
          marginTop: 16, background: `${C.ink}18`, border: `1px solid ${C.ink}18`,
        }}>
          {PEOPLE.map((p, i) => <PersonCard key={i} p={p} />)}
        </div>

        <div style={{ height: isMobile ? 48 : 80 }} />
        <MonoLabel size={10}>Previous mentees with PI (before NUS)</MonoLabel>
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
      justifyContent: 'space-between', position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 22,
          background: palette.dot,
          border: palette.dotBorder,
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
          ) : p.name}
        </div>
        <div style={{ fontFamily: F.display, fontSize: 12.5, opacity: 0.75, marginTop: 4 }}>
          {p.role}
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 9.5, letterSpacing: '0.08em', opacity: 0.55, marginTop: 10 }}>
          {p.term}
        </div>
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// 07 — News / timeline
// ————————————————————————————————————————————————————————————
const NEWS = window.NEWS;

function News() {
  const isMobile = useIsMobile();
  return (
    <section id="news" style={{ background: C.paperWarm, padding: isMobile ? '56px 0' : '80px 0' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px' }}>
        <SectionHeader
          kicker="§ 04 · News"
          title="What is happening on the coastline."
          // lede="Papers, press, travel, and milestones — a running log of the lab's recent movements."
        />

        <div style={{
          paddingTop: 16, borderTop: `1px solid ${C.ink}20`,
        }}>
          <div>
            {NEWS.map((n, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '96px 1fr',
                gap: isMobile ? 4 : 20,
                padding: isMobile ? '12px 0' : '12px 0',
                borderBottom: `1px solid ${C.ink}15`, alignItems: 'baseline',
              }}>
                <div style={{
                  fontFamily: F.mono, fontSize: 12, letterSpacing: '0.08em', color: C.ink, opacity: 0.7,
                  whiteSpace: 'nowrap',
                }}>
                  {n.date}
                </div>
                <div>
                  <div style={{
                    fontFamily: F.display, fontSize: 15, lineHeight: 1.45, color: C.ink,
                    textWrap: 'pretty', fontWeight: n.starred ? 500 : 400,
                  }}>
                    {n.body}
                    {n.tags && n.tags.length > 0 && n.tags.map(t => (
                      <span key={t} style={{
                        fontFamily: F.mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
                        padding: '2px 7px', border: `1px solid ${C.ink}30`, color: C.ink, opacity: 0.7,
                        fontWeight: 500, whiteSpace: 'nowrap',
                        marginLeft: 8, verticalAlign: '2px', display: 'inline-block',
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ————————————————————————————————————————————————————————————
// 08 — Join
// ————————————————————————————————————————————————————————————

function Join() {
  const isMobile = useIsMobile();
  return (
    <section id="join" style={{ background: C.ink, color: C.paper, padding: isMobile ? '72px 0' : '120px 0', position: 'relative', overflow: 'hidden' }}>
      {/* token field backdrop */}
      <svg
        viewBox="0 0 1400 500" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }}
      >
        {Array.from({ length: 10 }).map((_, r) =>
          Array.from({ length: 40 }).map((_, c) => {
            const x = 20 + c * 35;
            const baseY = 80 + r * 40;
            const depth = Math.pow(1 - r / 10, 1.4);
            const wave = Math.sin((c / 40) * Math.PI * 3) * 16 * depth;
            const under = Math.abs(x - 1150) < 90 && r < 4;
            return (
              <circle key={`${r}-${c}`} cx={x} cy={baseY + wave} r={r < 2 ? 2.5 : 1.6}
                fill={under ? C.accent : C.paper}
                opacity={r < 2 ? 0.9 : 0.4 - r * 0.02} />
            );
          })
        )}
        <circle cx="1150" cy="110" r="10" fill={C.accent} />
      </svg>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px', position: 'relative' }}>
        <MonoLabel color={C.paper} opacity={0.7}>§ 05 · Join</MonoLabel>
        <div style={{
          fontFamily: F.display, fontWeight: 700, fontSize: 'clamp(40px, 7vw, 84px)',
          letterSpacing: '-0.04em', lineHeight: 1.02, marginTop: 16, maxWidth: 900, textWrap: 'balance',
        }}>
          Sail with us to the<br />
          <span style={{ fontFamily: F.editorial, fontStyle: 'italic', fontWeight: 400 }}>cognitive coastline</span>.
        </div>
        <div style={{
          fontFamily: F.editorial, fontStyle: 'italic',
          fontSize: 'clamp(18px, 2.3vw, 24px)', lineHeight: 1.45,
          opacity: 0.82, marginTop: 28, maxWidth: 720, textWrap: 'pretty',
        }}>
          We're seeking self-motivated PhD students and remote interns. If you're drawn to the
          intersection of cognitive science, healthcare, and trustworthy AI — we'd love to hear from you.
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? 16 : 32, marginTop: isMobile ? 40 : 64,
        }}>
          {[
            {
              tag: '01 · PhD student',
              title: 'Fully-funded PhD',
              body: 'NUS ECE. Strong background in ML, NLP, HCI, or cognitive science.',
            },
            {
              tag: '02 · Intern',
              title: 'Research intern',
              body: 'Co-authored publications on AI/ML or cognitive science.',
            },
            {
              tag: '03 · Collaborator',
              title: 'Collaborations',
              body: 'Cross-disciplinary — cognitive science, medicine, AI safety. ',
            },
          ].map(c => (
            <div key={c.tag} style={{
              border: `1px solid ${C.paper}2a`, background: `${C.paper}06`, padding: 28,
              backdropFilter: 'blur(4px)',
            }}>
              <MonoLabel color={C.accent} opacity={1} size={10}>{c.tag}</MonoLabel>
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', marginTop: 14, lineHeight: 1.15, whiteSpace: 'pre-line' }}>
                {c.title}
              </div>
              <div style={{ fontFamily: F.display, fontSize: 14, lineHeight: 1.55, opacity: 0.82, marginTop: 12 }}>
                {c.body}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: isMobile ? 32 : 48, alignItems: 'center' }}>
          <a
            href="https://forms.gle/4LufZpRmkTfyj5uq9"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: F.display, fontWeight: 600, fontSize: 15, color: C.ink,
              background: C.accent, padding: '16px 24px', textDecoration: 'none',
              letterSpacing: '-0.01em', display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            Fill the interest form <span>→</span>
          </a>
          <a
            href="/openings/"
            style={{
              fontFamily: F.display, fontWeight: 500, fontSize: 15, color: C.paper,
              padding: '16px 24px', textDecoration: 'none', border: `1px solid ${C.paper}3a`,
              letterSpacing: '-0.01em',
            }}
          >Latest opening info</a>
          <div style={{
            fontFamily: F.mono, fontSize: 11, opacity: 0.55, letterSpacing: '0.1em',
            marginLeft: isMobile ? 0 : 12, marginTop: isMobile ? 4 : 0, width: isMobile ? '100%' : 'auto',
          }}>
            PI response subject to high inbound volume.
          </div>
        </div>
      </div>
    </section>
  );
}

// ————————————————————————————————————————————————————————————
// 09 — Footer
// ————————————————————————————————————————————————————————————

function Footer({ basePath = '' }) {
  // basePath mirrors Nav's — sub-pages pass '/' so in-site hash links resolve to home.
  const h = (frag) => `${basePath}${frag}`;
  const isMobile = useIsMobile();
  return (
    <footer style={{ background: C.paper, padding: isMobile ? '56px 0 40px' : '72px 0 48px', borderTop: `1px solid ${C.ink}1a` }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr',
        gap: isMobile ? 32 : 40,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <WaveMark size={44} rx={22} />
            <div>
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', color: C.ink, lineHeight: 1 }}>
                Co<span style={{ color: C.accent }}>STA</span><span style={{ opacity: 0.55, fontWeight: 500 }}>@NUS</span>
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '0.18em', color: C.ink, opacity: 0.6, marginTop: 4 }}>
                COGNITIVE SCIENCE · TRUSTWORTHY AI
              </div>
            </div>
          </div>
          {/* <div style={{ fontFamily: F.editorial, fontStyle: 'italic', fontSize: 18, color: C.ink, opacity: 0.72, marginTop: 20, maxWidth: 360, lineHeight: 1.4 }}>
            A research lab at NUS ECE.
          </div> */}
        </div>

        {[
          ['Lab', [['Research', h('#research')], ['Publications', h('#publications')], ['People', h('#people')], ['News', h('#news')]]],
          ['Connect', [
            ['Join →', h('#join')],
            ['Openings doc', 'https://docs.google.com/document/d/1L06GRLxORd_O5Jr2-e2KKZxAw2BA2qB9GfVFV_nVDHo/edit?usp=sharing'],
            ['Interest form', 'https://forms.gle/4LufZpRmkTfyj5uq9'],
          ]],
          ['External', [
            ['NUS ECE', 'https://cde.nus.edu.sg/ece/'],
            ['PI\'s site', 'https://jyhong.gitlab.io/'],
            ['Media: Nature News', 'https://www.nature.com/articles/d41586-025-03542-2'],
            ['Media: WIRED', 'https://www.wired.com/story/ai-models-social-media-cognitive-decline-study/'],
          ]],
        ].map(([h, links]) => (
          <div key={h}>
            <MonoLabel size={9.5}>{h}</MonoLabel>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {links.map(([t, href]) => (
                <a key={t} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener' : undefined} style={{
                  fontFamily: F.display, fontSize: 14, color: C.ink, textDecoration: 'none', opacity: 0.78,
                }}>{t}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        maxWidth: 1280, margin: '56px auto 0',
        padding: isMobile ? '24px 20px 0' : '24px 40px 0',
        borderTop: `1px solid ${C.ink}18`,
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', gap: isMobile ? 8 : 0,
        fontFamily: F.mono, fontSize: 10.5, letterSpacing: '0.12em', color: C.ink, opacity: 0.55, textTransform: 'uppercase',
      }}>
        <span>© 2026 CoSTA Lab · NUS ECE</span>
        <span>Designed on the coastline · v1.0</span>
      </div>
    </footer>
  );
}

Object.assign(window, {
  Nav, Hero, PIIntro, ResearchPillars, Publications, People, News, Join, Footer,
  PUBS_FULL, PubRow, WaveMark, MonoLabel, SectionHeader, C, F, useIsMobile,
});
