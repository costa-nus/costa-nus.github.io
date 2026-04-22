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
  return (
    <div style={{ maxWidth: 900, marginBottom: 56, textAlign: align }}>
      <MonoLabel>{kicker}</MonoLabel>
      <div style={{
        fontFamily: F.display, fontWeight: 700, fontSize: 56, letterSpacing: '-0.035em',
        lineHeight: 1.02, color: C.ink, marginTop: 14, textWrap: 'balance',
      }}>{title}</div>
      {lede && (
        <div style={{
          fontFamily: F.editorial, fontStyle: 'italic', fontWeight: 400, fontSize: 22,
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
  const [revealed, setRevealed] = React.useState(!isHome);

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

  return (
    <div style={wrapStyle}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '18px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href={logoHref} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <WaveMark size={36} rx={18} />
          <div>
            <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', color: C.ink, lineHeight: 1 }}>
              Co<span style={{ color: C.accent }}>STA</span>
              <span style={{ opacity: 0.5, fontWeight: 500 }}>@NUS</span>
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 8.5, letterSpacing: '0.18em', color: C.ink, opacity: 0.55, marginTop: 3 }}>
              COGNITIVE SCIENCE · TRUSTWORTHY AI
            </div>
          </div>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {items.map(i => (
            <a key={i} href={`${basePath}#${i.toLowerCase()}`} style={{
              fontFamily: F.display, fontSize: 13.5, fontWeight: 500, color: C.ink,
              opacity: i === 'Join' ? 1 : 0.75, textDecoration: 'none', letterSpacing: '-0.005em',
              ...(i === 'Join' ? { color: C.accent } : {}),
            }}>
              {i}{i === 'Join' && ' →'}
            </a>
          ))}
        </div>
      </div>
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
  return (
    <section id="top" style={{ background: C.paper, paddingTop: 64, paddingBottom: 96, position: 'relative', overflow: 'hidden', minHeight: '100vh', boxSizing: 'border-box' }}>
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

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', position: 'relative' }}>
        <MonoLabel></MonoLabel>
        <h1 style={{
          fontFamily: F.display, fontWeight: 500, fontSize: 'clamp(44px, 6.2vw, 96px)',
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

        <div style={{
          fontFamily: F.editorial, fontStyle: 'italic', fontWeight: 400, fontSize: 26, lineHeight: 1.4,
          color: C.ink, opacity: 0.78, maxWidth: 780, marginTop: 40, textWrap: 'pretty',
        }}>
          A frontier where human minds meet machine intelligence — navigating the uncharted
          waters of trustworthy AI, guided by cognitive science and a commitment to safe,
          ethical innovation.
        </div>

        {/* Meta row */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 48, marginTop: 56,
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
  return (
    <section style={{ background: C.paperWarm, padding: '96px 0' }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 40px',
        display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, alignItems: 'start',
      }}>
        {/* portrait */}
        <div>
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
            <MonoLabel size={9}>PI · Principal Investigator</MonoLabel>
            <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', color: C.ink, marginTop: 8 }}>
              Junyuan "Jason" Hong
            </div>
            <div style={{ fontFamily: F.display, fontSize: 14, color: C.ink, opacity: 0.7, marginTop: 4 }}>
              Incoming Assistant Professor, NUS ECE
            </div>
          </div>
        </div>

        <div>
          <MonoLabel>A word from the PI</MonoLabel>
          <div style={{
            fontFamily: F.editorial, fontStyle: 'italic', fontWeight: 400, fontSize: 30,
            lineHeight: 1.35, color: C.ink, marginTop: 16, textWrap: 'pretty', letterSpacing: '-0.01em',
          }}>
            “My research vision is to <u style={{ textDecorationColor: C.accent, textDecorationThickness: 2, textUnderlineOffset: 4 }}>harmonize, understand, and deploy</u>
            {' '}Responsible AI — optimizing systems that balance real-world constraints in
            efficiency, privacy, and ethical norms, with meaningful impact in healthcare.”
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 40, marginTop: 48,
            fontFamily: F.display, fontSize: 15, lineHeight: 1.6, color: C.ink, opacity: 0.85,
          }}>
            <p style={{ margin: 0 }}>
              Previously a postdoctoral fellow with Dr. Atlas Wang at the Institute for Foundations
              of Machine Learning (IFML), UT Austin, affiliated with the UT AI Health Lab and the
              Good Systems Challenge.
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
              {['Nature News', 'WIRED', 'Forbes', 'FORTUNE', 'The White House'].map(n => (
                <div key={n} style={{
                  fontFamily: F.editorial, fontStyle: 'italic', fontSize: 22, color: C.ink, opacity: 0.5,
                  letterSpacing: '-0.01em',
                }}>{n}</div>
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
  const pillars = [
    {
      id: 'T1',
      title: 'Cognitive Science of AI',
      lede: 'We aim to understand the inner workings and vulnerabilities of AI systems through the lens of cognitive psychology and neuroscience.',
      bullets: [
        'Developing general automatic frameworks of reasoning and learning, e.g., LLM-driven Auto Differentiation [1].',
        'Understanding the learning process and cognitive behaviors of AI via psychological or neuron intervention [2] [3].',
      ],
      refs: ['[1] DP-OPT · ICLR 24 Spotlight', '[2] SEAL · COLM 25', '[3] LLM Brain Rot · arXiv 25'],
      figure: 'neurons',
    },
    {
      id: 'T2',
      title: 'AI for Cognitive Health',
      lede: 'We leverage AI to advance our understanding and treatment of cognitive disorders and to simulate cognitive symptoms.',
      bullets: [
        'AI-driven dementia diagnosis and intervention for older adults [4].',
        'Digital twin of dementia patients – AI-driven simulation of cognitive behaviors [4].',
      ],
      refs: ['[4] A-CONECT · ICLRW 24'],
      figure: 'pulse',
    },
    {
      id: 'T3',
      title: 'AI Safety',
      lede: 'We are dedicated to developing fundamental computational methodologies for accountable and interpretable AI safety, including risk quantification, and mitigation.',
      bullets: [
        'Privacy attack and defense in machine learning and multi-agent networks [5].',
        'Constitutional AI agents in security-sensitive environments [6].',
      ],
      refs: ['[5] LLM-PBE · VLDB 24 Best Paper Finalist', '[6] GuardAgent · ICML 25'],
      figure: 'shield',
    },
  ];

  return (
    <section id="research" style={{ background: C.paper, padding: '120px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
        <SectionHeader
          kicker="§ 01 · Research"
          title="Three currents, one coastline."
          lede="We work at the intersection of cognitive science, healthcare, and trustworthy AI — each theme feeding the next."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {pillars.map((p, i) => <PillarCard key={p.id} p={p} i={i} />)}
        </div>
      </div>
    </section>
  );
}

function PillarCard({ p, i }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${C.ink}14`, padding: 32,
      display: 'flex', flexDirection: 'column', minHeight: 520,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <MonoLabel size={10}>Theme · {p.id}</MonoLabel>
        <PillarFigure kind={p.figure} />
      </div>

      <div style={{
        fontFamily: F.display, fontWeight: 700, fontSize: 28, letterSpacing: '-0.025em',
        color: C.ink, marginTop: 24, lineHeight: 1.1, textWrap: 'balance', minHeight: 66,
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
const PUBS_FULL = [
  { year: "2025", venue: "ArXiv", title: "LLMs Can Get \"Brain Rot\"!", authors: [{ name: "Shuo Xing", note: "Equal contribution" }, { name: "Junyuan \"Jason\" Hong", highlighted: true, note: "Equal contribution" }, { name: "Yifan Wang" }, { name: "Runjin Chen" }, { name: "Zhenyu Zhang" }, { name: "Ananth Grama" }, { name: "Zhengzhong Tu" }, { name: "Zhangyang Wang" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2510.13928" }, { label: "🌍 Website", href: "https://llm-brain-rot.github.io/" }], tags: ["Trust","LLM"], selected: true, detail: "/publication/2025brain-rot/" },
  { year: "2026", venue: "ICRA", title: "AD-VF: LLM-Automatic Differentiation Enables Fine-Tuning-Free Robot Planning from Formal Methods Feedback", authors: [{ name: "Yunhao Yang" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Gabriel Jacob Perin" }, { name: "Zhiwen Fan" }, { name: "Li Yin" }, { name: "Zhangyang Wang" }, { name: "Ufuk Topcu" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2509.18384" }], tags: ["LLM","Robotics","Reasoning"], detail: "/publication/2025ad_vf/" },
  { year: "2025", venue: "COLM", title: "LoX: Low-Rank Extrapolation Robustifies LLM Safety Against Fine-tuning", authors: [{ name: "Gabriel J. Perin" }, { name: "Runjin Chen" }, { name: "Xuxi Chen" }, { name: "Nina S. T. Hirata" }, { name: "Zhangyang Wang" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2506.15606" }, { label: "Code", href: "https://github.com/VITA-Group/LoX" }], tags: ["LLM","Safety"], detail: "/publication/2025lox/" },
  { year: "2025", venue: "COLM", title: "More is Less: The Pitfalls of Multi-Model Synthetic Preference Data in DPO Safety Alignment", authors: [{ name: "Yifan Wang" }, { name: "Runjin Chen" }, { name: "Bolian Li" }, { name: "David Cho" }, { name: "Yihe Deng" }, { name: "Ruqi Zhang" }, { name: "Tianlong Chen" }, { name: "Zhangyang Wang" }, { name: "Ananth Grama" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2504.02193" }], tags: ["LLM","Trust"], detail: "/publication/2025moreisless/" },
  { year: "2025", venue: "ArXiv", title: "Scaling Textual Gradients via Sampling-Based Momentum", authors: [{ name: "Zixin Ding", note: "Equal contribution" }, { name: "Junyuan \"Jason\" Hong", highlighted: true, note: "Equal contribution" }, { name: "Zhan Shi" }, { name: "Jiachen T. Wang" }, { name: "Zinan Lin" }, { name: "Li Yin" }, { name: "Meng Liu" }, { name: "Zhangyang Wang" }, { name: "Yuxin Chen" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2506.00400" }], tags: ["LLM"], detail: "/publication/2025tg_momentum/" },
  { year: "2025", venue: "ICML", title: "GuardAgent: Safeguard LLM Agents by a Guard Agent via Knowledge-Enabled Reasoning", authors: [{ name: "Zhen Xiang" }, { name: "Linzhi Zheng" }, { name: "Yanjie Li" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Qinbin Li" }, { name: "Han Xie" }, { name: "Jiawei Zhang" }, { name: "Zidi Xiong" }, { name: "Chulin Xie" }, { name: "Carl Yang" }, { name: "Dawn Song" }, { name: "Bo Li" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2406.09187" }, { label: "🏁 Competition", href: "https://www.llmagentsafetycomp24.com/" }], tags: ["LLM","Trust"], selected: true, detail: "/publication/2024guardagent/" },
  { year: "2025", venue: "COLM", title: "SEAL: Steerable Reasoning Calibration of Large Language Models for Free", authors: [{ name: "Runjin Chen" }, { name: "Zhenyu Zhang" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Souvik Kundu" }, { name: "Zhangyang Wang" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2504.07986" }, { label: "Code", href: "https://github.com/VITA-Group/SEAL" }], tags: ["LLM","Reasoning"], detail: "/publication/2025seal/" },
  { year: "2025", venue: "EMNLP (Main)", title: "MedHallu: A Comprehensive Benchmark for Detecting Medical Hallucinations in Large Language Models", authors: [{ name: "Shrey Pandit" }, { name: "Jiawei Xu" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Zhangyang Wang" }, { name: "Tianlong Chen" }, { name: "Kaidi Xu" }, { name: "Ying Ding" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2502.14302" }, { label: "Code", href: "https://github.com/MedHallu/MedHalu" }, { label: "🤗 Dataset", href: "https://huggingface.co/datasets/UTAustin-AIHealth/MedHallu" }, { label: "🌍 Website", href: "https://medhallu.github.io" }], tags: ["Trust","LLM","Healthcare","Safety"], selected: true, detail: "/publication/2025medhallu/" },
  { year: "2025", venue: "NAACL (Main)", title: "Extracting and Understanding the Superficial Knowledge in Alignment", authors: [{ name: "Runjin Chen" }, { name: "Gabriel Jacob Perin" }, { name: "Xuxi Chen" }, { name: "Xilun Chen" }, { name: "Yan Han" }, { name: "Nina S. T. Hirata" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Bhavya Kailkhura" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2502.04602" }, { label: "Code", href: "https://github.com/VITA-Group/Superficial_Alignment" }], tags: ["LLM","Safety"], selected: true, detail: "/publication/2025_superficial/" },
  { year: "2025", venue: "NAACL", title: "GuideLLM: Exploring LLM-Guided Conversation with Applications in Autobiography Interviewing", authors: [{ name: "Jinhao Duan", note: "Equal contribution" }, { name: "Xinyu Zhao", note: "Equal contribution" }, { name: "Zhuoxuan Zhang", note: "Equal contribution" }, { name: "Eunhye Grace Ko" }, { name: "Lily Boddy" }, { name: "Chenan Wang" }, { name: "Tianhao Li" }, { name: "Alexander Rasgon" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Min Kyung Lee" }, { name: "Chenxi Yuan" }, { name: "Qi Long" }, { name: "Ying Ding" }, { name: "Tianlong Chen" }, { name: "Kaidi Xu" }], links: [{ label: "PDF", href: "https://openreview.net/pdf?id=G6h0ya2d2c" }], tags: ["Healthcare","LLM"], detail: "/publication/2024_remi/" },
  { year: "2024", venue: "VLDB (Best Paper Finalist)", title: "LLM-PBE: Assessing Data Privacy in Large Language Models", authors: [{ name: "Qinbin Li", note: "Equal contribution" }, { name: "Junyuan \"Jason\" Hong", highlighted: true, note: "Equal contribution" }, { name: "Chulin Xie", note: "Equal contribution" }, { name: "Jeffrey Tan" }, { name: "Rachel Xin" }, { name: "Junyi Hou" }, { name: "Xavier Yin" }, { name: "Zhun Wang" }, { name: "Dan Hendrycks" }, { name: "Zhangyang Wang" }, { name: "Bo Li" }, { name: "Bingsheng He" }, { name: "Dawn Song" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2408.12787" }, { label: "Code", href: "https://github.com/QinbinLi/LLM-PBE" }, { label: "🌍 Website", href: "https://llm-pbe.github.io/" }, { label: "🏁 Competition", href: "https://llm-pc.github.io/" }, { label: "🏆 Best Paper Nomination", href: "https://llm-pbe.github.io/vldb2024_nomination_Qinbin.pdf" }, { label: "Finetune Code", href: "https://github.com/jyhong836/llm-dp-finetune" }], tags: ["Trust","LLM","Privacy"], selected: true, detail: "/publication/2024llm_pbe/" },
  { year: "2024", venue: "ICML", title: "Decoding Compressed Trust: Scrutinizing the Trustworthiness of Efficient LLMs Under Compression", authors: [{ name: "Junyuan \"Jason\" Hong", highlighted: true, note: "Equal contribution" }, { name: "Jinhao Duan", note: "Equal contribution" }, { name: "Chenhui Zhang", note: "Equal contribution" }, { name: "Zhangheng Li", note: "Equal contribution" }, { name: "Chulin Xie" }, { name: "Kelsey Lieberman" }, { name: "James Diffenderfer" }, { name: "Brian Bartoldson" }, { name: "Ajay Jaiswal" }, { name: "Kaidi Xu" }, { name: "Bhavya Kailkhura" }, { name: "Dan Hendrycks" }, { name: "Dawn Song" }, { name: "Zhangyang Wang" }, { name: "Bo Li" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2403.15447" }, { label: "🤗 Models", href: "https://huggingface.co/compressed-llm" }, { label: "🌍 Website", href: "https://decoding-comp-trust.github.io" }], tags: ["Trust","LLM"], selected: true, detail: "/publication/2024decoding-comp-trust/" },
  { year: "2024", venue: "ICML", title: "Revisiting Zeroth-Order Optimization for Memory-Efficient LLM Fine-Tuning: A Benchmark", authors: [{ name: "Yihua Zhang", note: "Equal contribution" }, { name: "Pingzhi Li", note: "Equal contribution" }, { name: "Junyuan \"Jason\" Hong", highlighted: true, note: "Equal contribution" }, { name: "Jiaxiang Li", note: "Equal contribution" }, { name: "Yimeng Zhang" }, { name: "Wenqing Zheng" }, { name: "Pin-Yu Chen" }, { name: "Jason D. Lee" }, { name: "Wotao Yin" }, { name: "Mingyi Hong" }, { name: "Zhangyang Wang" }, { name: "Sijia Liu" }, { name: "Tianlong Chen" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2402.11592" }, { label: "Code", href: "https://github.com/ZO-Bench/ZO-LLM" }, { label: "👨‍🏫Tutorial", href: "https://sites.google.com/view/zo-tutorial-aaai-2024/" }], tags: ["LLM"], detail: "/publication/2024_zo_llm/" },
  { year: "2024", venue: "ICLRW", title: "A-CONECT: Designing AI-based Conversational Chatbot for Early Dementia Intervention", authors: [{ name: "Junyuan \"Jason\" Hong", highlighted: true, note: "Equal contribution" }, { name: "Wenqing Zheng", note: "Equal contribution" }, { name: "Han Meng" }, { name: "Siqi Liang" }, { name: "Anqing Chen" }, { name: "Hiroko H. Dodge" }, { name: "Jiayu Zhou" }, { name: "Zhangyang Wang" }], links: [{ label: "PDF", href: "https://openreview.net/pdf?id=rACfuoNKBU" }, { label: "Website", href: "https://a-conect.github.io/project/" }, { label: "🤖Demo", href: "https://a-conect.github.io" }], tags: ["Healthcare","LLM"], selected: true, detail: "/publication/2024_a_conect/" },
  { year: "2024", venue: "AISTATS", title: "On the Generalization Ability of Unsupervised Pretraining", authors: [{ name: "Yuyang Deng" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Jiayu Zhou" }, { name: "Mehrdad Mahdavi" }], links: [{ label: "PDF", href: "http://arxiv.org/abs/2403.06871" }], tags: [], detail: "/publication/2024unsupervised_pretrain/" },
  { year: "2024", venue: "ICLR", title: "Safe and Robust Watermark Injection with a Single OoD Image", authors: [{ name: "Shuyang Yu" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Haobo Zhang" }, { name: "Haotao Wang" }, { name: "Zhangyang Wang" }, { name: "Jiayu Zhou" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2309.01786" }, { label: "Code", href: "https://github.com/illidanlab/single_oodwatermark" }], tags: ["Trust"], selected: true, detail: "/publication/2023one_image_watermark/" },
  { year: "2024", venue: "SaTML", title: "Shake to Leak: Fine-tuning Diffusion Models Can Amplify the Generative Privacy Risk", authors: [{ name: "Zhangheng Li" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Bo Li" }, { name: "Zhangyang Wang" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2403.09450" }, { label: "Code", href: "https://github.com/VITA-Group/Shake-to-Leak" }], tags: ["Privacy","LLM"], selected: true, detail: "/publication/2023finetune_privacy/" },
  { year: "2024", venue: "ICLR (Spotlight)", title: "DP-OPT: Make Large Language Model Your Privacy-Preserving Prompt Engineer", authors: [{ name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Jiachen T. Wang" }, { name: "Chenhui Zhang" }, { name: "Zhangheng Li" }, { name: "Bo Li" }, { name: "Zhangyang Wang" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2312.03724" }, { label: "Code", href: "https://github.com/VITA-Group/DP-OPT" }], tags: ["Privacy","LLM"], selected: true, detail: "/publication/2023dp_opt/" },
  { year: "2023", venue: "NeurIPS-RegML", title: "Who Leaked the Model? Tracking IP Infringers in Accountable Federated Learning", authors: [{ name: "Shuyang Yu" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Yi Zeng" }, { name: "Fei Wang" }, { name: "Ruoxi Jia" }, { name: "Jiayu Zhou" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2312.03205" }], tags: ["FL","Trust"], detail: "/publication/2023_fl_ip_track/" },
  { year: "2023", venue: "NeurIPS", title: "Understanding Deep Gradient Leakage via Inversion Influence Functions", authors: [{ name: "Haobo Zhang", note: "Equal contribution" }, { name: "Junyuan \"Jason\" Hong", highlighted: true, note: "Equal contribution" }, { name: "Yuyang Deng" }, { name: "Mehrdad Mahdavi" }, { name: "Jiayu Zhou" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2309.13016" }, { label: "Code", href: "https://github.com/illidanlab/inversion-influence-function" }], tags: ["Privacy"], selected: true, detail: "/publication/2023neurips_i2f/" },
  { year: "2023", venue: "KDDW", title: "A Privacy-Preserving Hybrid Federated Learning Framework for Financial Crime Detection", authors: [{ name: "Haobo Zhang" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Fan Dong" }, { name: "Steve Drew" }, { name: "Liangjie Xue" }, { name: "Jiayu Zhou" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2302.03654" }, { label: "Code", href: "https://github.com/illidanlab/HyFL" }, { label: "🏆 PETs", href: "https://drivendata.co/blog/federated-learning-pets-prize-winners-phases-2-3" }, { label: "🏛️ White House", href: "https://www.whitehouse.gov/ostp/news-updates/2023/03/31/us-uk-annouce-winners-innovation-pets-democratic-values/" }], tags: ["FL","Privacy"], selected: true, detail: "/publication/2023_hybrid_fl_fin/" },
  { year: "2023", venue: "KDDW", title: "FedNoisy: A Federated Noisy Label Learning Benchmark", authors: [{ name: "Siqi Liang" }, { name: "Jintao Huang" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Fan Dong" }, { name: "Dun Zeng" }, { name: "Jiayu Zhou" }, { name: "Zenglin Xu" }], links: [{ label: "PDF", href: "https://openreview.net/pdf?id=cXMenagKy-7" }, { label: "Code", href: "https://github.com/smilelab-fl/fednoisy" }], tags: ["FL"], detail: "/publication/fednoisy2023/" },
  { year: "2023", venue: "ICML", title: "Revisiting Data-Free Knowledge Distillation with Poisoned Teachers", authors: [{ name: "Junyuan \"Jason\" Hong", highlighted: true, note: "Equal contribution" }, { name: "Yi Zeng", note: "Equal contribution" }, { name: "Shuyang Yu", note: "Equal contribution" }, { name: "Lingjuan Lyu" }, { name: "Ruoxi Jia" }, { name: "Jiayu Zhou" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2306.02368" }, { label: "Code", href: "https://github.com/illidanlab/ABD" }, { label: "Poster", href: "/publication/datafree_backdoor2023icml/poster.pdf" }], tags: ["FL","Trust"], selected: true, detail: "/publication/datafree_backdoor2023icml/" },
  { year: "2023", venue: "TMLR", title: "How Robust is Your Fairness? Evaluating and Sustaining Fairness under Unseen Distribution Shifts", authors: [{ name: "Haotao Wang" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Jiayu Zhou" }, { name: "Zhangyang Wang" }], links: [{ label: "PDF", href: "https://openreview.net/pdf?id=11pGlecTz2" }], tags: ["Fairness","Trust"], detail: "/publication/fair-robust2023tmlr/" },
  { year: "2023", venue: "ICLR", title: "MECTA: Memory-Economic Continual Test-Time Model Adaptation", authors: [{ name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Lingjuan Lyu" }, { name: "Jiayu Zhou" }, { name: "Michael Spranger" }], links: [{ label: "PDF", href: "https://openreview.net/pdf?id=N92hjSf5NNh" }, { label: "Code", href: "https://github.com/SonyAI/MECTA" }, { label: "Slides", href: "/files/mecta_CVT.pdf" }], tags: ["Trust"], detail: "/publication/mecta2023/" },
  { year: "2023", venue: "ICLR (Spotlight)", title: "Turning the Curse of Heterogeneity in Federated Learning into a Blessing for Out-of-Distribution Detection", authors: [{ name: "Shuyang Yu" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Haotao Wang" }, { name: "Zhangyang Wang" }, { name: "Jiayu Zhou" }], links: [{ label: "PDF", href: "https://openreview.net/pdf?id=mMNimwRb7Gr" }, { label: "Code", href: "https://github.com/illidanlab/FOSTER" }], tags: ["FL","Trust"], detail: "/publication/foster2023/" },
  { year: "2023", venue: "AAAI (Oral)", title: "Federated Robustness Propagation: Sharing Adversarial Robustness in Federated Learning", authors: [{ name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Haotao Wang" }, { name: "Zhangyang Wang" }, { name: "Jiayu Zhou" }], links: [{ label: "Preprint", href: "https://arxiv.org/abs/2106.10196" }, { label: "Code", href: "https://github.com/illidanlab/FedRBN" }, { label: "Poster", href: "/publication/frp2023/poster.pdf" }], tags: ["FL","Trust"], detail: "/publication/frp2023/" },
  { year: "2022", venue: "Preprint", title: "Precautionary Unfairness in Self-Supervised Contrastive Pre-training", authors: [{ name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Haotao Wang" }, { name: "Haobo Zhang" }, { name: "Zhangyang Wang" }, { name: "Jiayu Zhou" }], links: [{ label: "Preprint", href: "https://openreview.net/pdf?id=l2FXO1RJ5Hs" }], tags: ["Trust"], detail: "/publication/faircl2022/" },
  { year: "2022", venue: "NeurIPS", title: "Outsourcing Training without Uploading Data via Efficient Collaborative Open-Source Sampling", authors: [{ name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Lingjuan Lyu" }, { name: "Jiayu Zhou" }, { name: "Michael Spranger" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/2210.12575" }, { label: "Poster", href: "/publication/ecos/priv_smp_poster.pdf" }, { label: "Slides", href: "/publication/ecos/priv_smp_5min.pdf" }], tags: ["Privacy"], selected: true, detail: "/publication/ecos/" },
  { year: "2022", venue: "NeurIPS", title: "Trap and Replace: Defending Backdoor Attacks by Trapping Them into an Easy-to-Replace Subnetwork", authors: [{ name: "Haotao Wang" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Aston Zhang" }, { name: "Jiayu Zhou" }, { name: "Zhangyang Wang" }], links: [{ label: "PDF", href: "https://arxiv.org/pdf/2210.06428.pdf" }, { label: "Code", href: "https://github.com/VITA-Group/Trap-and-Replace-Backdoor-Defense" }], tags: ["Trust"], detail: "/publication/trap_backdoor/" },
  { year: "2022", venue: "ICML", title: "Resilient and Communication Efficient Learning for Heterogeneous Federated Systems", authors: [{ name: "Zhuangdi Zhu" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Steve Drew" }, { name: "Jiayu Zhou" }], links: [{ label: "PDF", href: "https://proceedings.mlr.press/v162/zhu22e/zhu22e.pdf" }], tags: ["FL"], detail: "/publication/resilient_fl/" },
  { year: "2022", venue: "FAccT", title: "Dynamic Privacy Budget Allocation Improves Data Efficiency of Differentially Private Gradient Descent", authors: [{ name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Zhangyang Wang" }, { name: "Jiayu Zhou" }], links: [{ label: "Preprint", href: "https://arxiv.org/abs/2101.07413" }, { label: "Slides", href: "/publication/ondynamic/dyn_dp.pdf" }], tags: ["Privacy"], selected: true, detail: "/publication/ondynamic/" },
  { year: "2022", venue: "ICLR", title: "Efficient Split-Mix Federated Learning for On-Demand and In-Situ Customization", authors: [{ name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Haotao Wang" }, { name: "Zhangyang Wang" }, { name: "Jiayu Zhou" }], links: [{ label: "PDF", href: "https://openreview.net/pdf?id=_QLmakITKg" }, { label: "Code", href: "https://github.com/illidanlab/SplitMix" }, { label: "Slides", href: "/publication/split_mix/slides.pdf" }, { label: "Video", href: "https://www.youtube.com/watch?v=VA2XsCA6k9s" }], tags: ["FL"], detail: "/publication/split_mix/" },
  { year: "2021", venue: "KDD", title: "Federated Adversarial Debiasing for Fair and Transferable Representations", authors: [{ name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Zhuangdi Zhu" }, { name: "Shuyang Yu" }, { name: "Hiroko Dodge" }, { name: "Zhangyang Wang" }, { name: "Jiayu Zhou" }], links: [{ label: "PDF", href: "https://dl.acm.org/doi/pdf/10.1145/3447548.3467281" }, { label: "Code", href: "https://github.com/illidanlab/FADE" }, { label: "Slides", href: "/publication/fade2021kdd/slides.pdf" }], tags: ["FL","Healthcare","Fairness","Trust"], selected: true, detail: "/publication/fade2021kdd/" },
  { year: "2021", venue: "ICML", title: "Data-Free Knowledge Distillation for Heterogeneous Federated Learning", authors: [{ name: "Zhuangdi Zhu" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Jiayu Zhou" }], links: [{ label: "Preprint", href: "https://arxiv.org/abs/2105.10056" }, { label: "Code", href: "https://github.com/zhuangdizhu/FedGen" }], tags: ["FL"], detail: "/publication/data_free_fl/" },
  { year: "2021", venue: "AAAI", title: "Learning Model-Based Privacy Protection under Budget Constraints", authors: [{ name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Haotao Wang" }, { name: "Zhangyang Wang" }, { name: "Jiayu Zhou" }], links: [{ label: "PDF", href: "https://ojs.aaai.org/index.php/AAAI/article/view/16941" }, { label: "Slides", href: "https://slideslive.com/38948883/learning-modelbased-privacy-protection-under-budget-constraints?ref=account-folder-75497-folders" }, { label: "Video", href: "https://slideslive.com/38948883/learning-modelbased-privacy-protection-under-budget-constraints?ref=account-folder-75497-folders" }, { label: "Supplementary", href: "/publication/learn2protect/l2p_aaai21_supl.pdf" }], tags: ["Privacy"], detail: "/publication/learn2protect/" },
  { year: "2020", venue: "Alzheimer's & Dementia", title: "Detecting MCI using real-time, ecologically valid data capture methodology: How to improve scientific rigor in digital biomarker analyses", authors: [{ name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Jeffrey Kaye" }, { name: "Hiroko H Dodge" }, { name: "Jiayu Zhou" }], links: [{ label: "PDF", href: "https://alz-journals.onlinelibrary.wiley.com/doi/full/10.1002/alz.044371" }], tags: ["Healthcare"], selected: true, detail: "/publication/ad2020/" },
  { year: "2019", venue: "TKDD", title: "Variant Grassmann Manifolds: A Representation Augmentation Method for Action Recognition", authors: [{ name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Yang Li" }, { name: "Huanhuan Chen" }], links: [{ label: "PDF", href: "https://dl.acm.org/citation.cfm?id=3314203" }, { label: "DOI", href: "https://doi.org/10.1145/3314203" }], tags: [], detail: "/publication/vgm/" },
  { year: "2019", venue: "TNNLS", title: "Short Sequence Classification Through Discriminable Linear Dynamical System", authors: [{ name: "Yang Li" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Huanhuan Chen" }], links: [{ label: "DOI", href: "https://doi.org/10.1109/TNNLS.2019.2891743" }], tags: [], detail: "/publication/dscri_lds/" },
  { year: "2018", venue: "KDD (Oral)", title: "Disturbance Grassmann Kernels for Subspace-Based Learning", authors: [{ name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Huanhuan Chen" }, { name: "Feng Lin" }], links: [{ label: "PDF", href: "https://arxiv.org/abs/1802.03517" }, { label: "Video", href: "https://www.youtube.com/watch?v=1qLHgSrcZ4M" }, { label: "DOI", href: "https://doi.org/10.1145/3219819.3219959" }, { label: "Supplementary", href: "/files/sigkdd_supp.pdf" }], tags: [], detail: "/publication/dgkernel/" },
  { year: "2016", venue: "ECML", title: "Sequential Data Classification in the Space of Liquid State Machines", authors: [{ name: "Yang Li" }, { name: "Junyuan \"Jason\" Hong", highlighted: true }, { name: "Huanhuan Chen" }], links: [{ label: "PDF", href: "https://link.springer.com/chapter/10.1007/978-3-319-46128-1_20" }, { label: "Code", href: "https://github.com/jyhong836/LSMModelSpace" }], tags: [], detail: "/publication/lsm-model-space/" },
];

function Publications() {
  const [filter, setFilter] = React.useState('All');
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
    <section id="publications" style={{ background: C.secondary, padding: '120px 0', color: C.paper }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
        <div style={{ maxWidth: 900, marginBottom: 56 }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.16em', color: C.paper, opacity: 0.6, textTransform: 'uppercase', fontWeight: 500 }}>
            § 02 · Publications
          </div>
          <div style={{
            fontFamily: F.display, fontWeight: 700, fontSize: 56, letterSpacing: '-0.035em',
            lineHeight: 1.02, color: C.paper, marginTop: 14, textWrap: 'balance',
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
          {filtered.map((p, i) => <PubRow key={i} p={p} />)}
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

function PubRow({ p, showYear = true }) {
  // venue may be bare ("ICLR") or carry a parenthetical modifier ("ICLR (Spotlight)",
  // "VLDB (Best Paper Finalist)"). Split so the two-line column still shows a
  // distinct type sub-label when there is one.
  const venueMatch = (p.venue || '').match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  const venueBase = venueMatch ? venueMatch[1] : p.venue;
  const typeLabel = venueMatch ? venueMatch[2] : (p.type || '');
  const highlight = /(Spotlight|Best Paper|Finalist|Oral)/i.test(typeLabel);
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: showYear ? '100px 160px 1fr 200px' : '160px 1fr 200px',
      gap: 24,
      padding: '22px 0', borderBottom: `1px solid ${C.paper}18`, alignItems: 'baseline',
    }}>
      {showYear && (
        <div style={{ fontFamily: F.mono, fontSize: 13, color: C.paper, opacity: 0.85, letterSpacing: '0.05em' }}>
          {p.year}
        </div>
      )}
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
        {p.title}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
        {p.tags.map(t => (
          <span key={t} style={{
            fontFamily: F.mono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '4px 8px', border: `1px solid ${C.paper}33`, color: C.paper, opacity: 0.7,
            whiteSpace: 'nowrap',
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// 06 — People
// ————————————————————————————————————————————————————————————

const PEOPLE = [
  { name: 'Junyuan "Jason" Hong', role: 'Principal Investigator', note: 'Assistant Professor, NUS ECE · 2026–', accent: true },
  { name: 'Open Position', role: 'PhD Student', note: 'Apply via form — fully funded', open: true },
  { name: 'Open Position', role: 'PhD Student', note: 'Apply via form — fully funded', open: true },
  { name: 'Open Position', role: 'Postdoc', note: 'Trustworthy AI / Healthcare', open: true },
  { name: 'Open Position', role: 'Remote Intern', note: 'Rolling basis', open: true },
];

const ALUMNI = [
  { name: 'Zhangheng Li', now: 'Research Scientist · Zoom AI', prior: 'PhD · UT Austin' },
  { name: 'Runjin Chen',  now: 'Anthropic', prior: 'PhD · UT Austin · Anthropic Fellow 2025' },
  { name: 'Wes Robbins',  now: 'Clearview AI', prior: 'PhD · UT Austin' },
  { name: 'Gabriel Perin',now: 'MS · IME-USP · IBM Research', prior: 'Undergrad · USP, Brazil' },
  { name: 'Jeffrey Tan',  now: '—', prior: 'Undergrad · UC Berkeley · VLDB 24 Best Paper Nominee' },
  { name: 'Shuyang Yu',   now: 'Samsung', prior: 'PhD · MSU' },
  { name: 'Haobo Zhang',  now: 'PhD · UMich · Amazon Intern', prior: 'PhD · MSU · US-UK PETs 3rd place' },
  { name: 'Siqi Liang',   now: 'PhD · UMich · Amazon Intern', prior: 'PhD · MSU' },
];

function People() {
  return (
    <section id="people" style={{ background: C.paper, padding: '120px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
        <SectionHeader
          kicker="§ 03 · People"
          title="Navigators, in and out of the lab."
          lede="Current members, open positions, and alumni charting their own courses after CoSTA."
        />

        <MonoLabel size={10}>Current & opening</MonoLabel>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 1,
          marginTop: 16, background: `${C.ink}18`, border: `1px solid ${C.ink}18`,
        }}>
          {PEOPLE.map((p, i) => <PersonCard key={i} p={p} />)}
        </div>

        <div style={{ height: 80 }} />
        <MonoLabel size={10}>Previous mentees</MonoLabel>
        <div style={{ marginTop: 16, borderTop: `1px solid ${C.ink}22` }}>
          {ALUMNI.map((a, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.4fr', gap: 24,
              padding: '16px 0', borderBottom: `1px solid ${C.ink}15`, alignItems: 'baseline',
            }}>
              <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 17, color: C.ink, letterSpacing: '-0.015em' }}>
                {a.name}
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

function PersonCard({ p }) {
  const bg = p.accent ? C.ink : p.open ? C.paperWarm : '#fff';
  const fg = p.accent ? C.paper : C.ink;
  return (
    <div style={{
      background: bg, color: fg, padding: 24, minHeight: 180, display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 22,
          background: p.accent ? C.accent : `${C.ink}15`,
          border: p.open ? `1.5px dashed ${C.ink}55` : 'none',
        }} />
        {p.open && (
          <div style={{
            fontFamily: F.mono, fontSize: 9, letterSpacing: '0.16em', color: C.accent,
            textTransform: 'uppercase', fontWeight: 600,
          }}>• Hiring</div>
        )}
      </div>
      <div>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 17, letterSpacing: '-0.015em', lineHeight: 1.15 }}>
          {p.name}
        </div>
        <div style={{ fontFamily: F.display, fontSize: 12.5, opacity: 0.75, marginTop: 4 }}>
          {p.role}
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 9.5, letterSpacing: '0.08em', opacity: 0.55, marginTop: 10 }}>
          {p.note}
        </div>
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// 07 — News / timeline
// ————————————————————————————————————————————————————————————

const NEWS = [
  { date: '01 · 2026', body: 'One paper (Training-Free Robot Planning) accepted to ICRA 2026.', tags: ['Paper'] },
  { date: '12 · 2025', body: 'Travelling to NeurIPS — co-organizing the GenAI4Health workshop; giving a talk on LLM Brain Rot at LockLLM.', tags: ['Travel', 'Talk'] },
  { date: '10 · 2025', body: 'New paper covered by Nature News, WIRED, Forbes, and FORTUNE — LLMs can get "Brain Rot" after browsing social media.', tags: ['Press', 'Paper'] },
  { date: '08 · 2025', body: 'Joining NUS ECE as Tenure-Track Assistant Professor from July 2026, after a year at MGH & Harvard Medical School.', tags: ['Milestone'] },
  { date: '07 · 2025', body: 'Three papers (LoX, SEAL, More is Less) accepted to COLM 2025 · MedHallu accepted to EMNLP 2025.', tags: ['Paper'] },
  { date: '07 · 2025', body: 'Area Chair at NeurIPS 2025; co-organizing GenAI4Health and FedKDD.', tags: ['Service'] },
  { date: '11 · 2024', body: 'A-CONECT chatbot research supported by the NAIRR Pilot Program.', tags: ['Grant'] },
  { date: '08 · 2024', body: 'LLM-PBE benchmark [VLDB 24] selected as best paper finalist; used for NeurIPS 2024 LLM Privacy Challenge.', tags: ['Honor', 'Paper'] },
  { date: '07 · 2024', body: 'A-CONECT project supported by OpenAI Researcher Access Program.', tags: ['Grant'] },
  { date: '05 · 2024', body: 'Named MLSys Rising Star for work in health and trustworthy ML.', tags: ['Honor'] },
  { date: '03 · 2023', body: 'ILLIDAN Lab team wins 3rd place in U.S. PETs prize challenge — covered by The White House.', tags: ['Honor', 'Press'] },
];

function News() {
  return (
    <section id="news" style={{ background: C.paperWarm, padding: '120px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
        <SectionHeader
          kicker="§ 04 · News"
          title="Dispatches from the frontier."
          lede="Papers, press, travel, and milestones — a running log of the lab's recent movements."
        />

        <div style={{
          paddingTop: 24, borderTop: `1px solid ${C.ink}20`,
        }}>
          <div>
            {NEWS.map((n, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '140px 1fr', gap: 24,
                padding: '22px 0', borderBottom: `1px solid ${C.ink}15`, alignItems: 'flex-start',
              }}>
                <div style={{
                  fontFamily: F.mono, fontSize: 12, letterSpacing: '0.08em', color: C.ink, opacity: 0.7,
                  display: 'flex', alignItems: 'center', gap: 10, paddingTop: 2,
                }}>
                  {n.date}
                </div>
                <div>
                  <div style={{
                    fontFamily: F.display, fontSize: 16, lineHeight: 1.5, color: C.ink,
                    textWrap: 'pretty', fontWeight: n.starred ? 500 : 400,
                  }}>
                    {n.body}
                  </div>
                  {n.tags && n.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {n.tags.map(t => (
                        <span key={t} style={{
                          fontFamily: F.mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
                          padding: '3px 8px', border: `1px solid ${C.ink}30`, color: C.ink, opacity: 0.75,
                          fontWeight: 500, whiteSpace: 'nowrap',
                        }}>{t}</span>
                      ))}
                    </div>
                  )}
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
  return (
    <section id="join" style={{ background: C.ink, color: C.paper, padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
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

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', position: 'relative' }}>
        <MonoLabel color={C.paper} opacity={0.7}>§ 05 · Join</MonoLabel>
        <div style={{
          fontFamily: F.display, fontWeight: 700, fontSize: 'clamp(48px, 6vw, 84px)',
          letterSpacing: '-0.04em', lineHeight: 1, marginTop: 16, maxWidth: 900, textWrap: 'balance',
        }}>
          Sail with us to the<br />
          <span style={{ fontFamily: F.editorial, fontStyle: 'italic', fontWeight: 400 }}>cognitive coastline</span>.
        </div>
        <div style={{
          fontFamily: F.editorial, fontStyle: 'italic', fontSize: 24, lineHeight: 1.45,
          opacity: 0.82, marginTop: 28, maxWidth: 720, textWrap: 'pretty',
        }}>
          We're seeking self-motivated PhD students and remote interns. If you're drawn to the
          intersection of cognitive science, healthcare, and trustworthy AI — we'd love to hear from you.
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginTop: 64,
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

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 48, alignItems: 'center' }}>
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
            href="https://docs.google.com/document/d/1L06GRLxORd_O5Jr2-e2KKZxAw2BA2qB9GfVFV_nVDHo/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: F.display, fontWeight: 500, fontSize: 15, color: C.paper,
              padding: '16px 24px', textDecoration: 'none', border: `1px solid ${C.paper}3a`,
              letterSpacing: '-0.01em',
            }}
          >Read openings document</a>
          <div style={{ fontFamily: F.mono, fontSize: 11, opacity: 0.55, marginLeft: 12, letterSpacing: '0.1em' }}>
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
  return (
    <footer style={{ background: C.paper, padding: '72px 0 48px', borderTop: `1px solid ${C.ink}1a` }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 40px',
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40,
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
          <div style={{ fontFamily: F.editorial, fontStyle: 'italic', fontSize: 18, color: C.ink, opacity: 0.72, marginTop: 20, maxWidth: 360, lineHeight: 1.4 }}>
            A research lab at the National University of Singapore, Department of
            Electrical &amp; Computer Engineering.
          </div>
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
        maxWidth: 1280, margin: '56px auto 0', padding: '24px 40px 0',
        borderTop: `1px solid ${C.ink}18`, display: 'flex', justifyContent: 'space-between',
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
  PUBS_FULL, PubRow, WaveMark, MonoLabel, SectionHeader, C, F,
});
