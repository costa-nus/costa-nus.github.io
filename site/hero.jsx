// Hero section + animated coastline waves used as its backdrop.

const { C, F, useIsMobile, MonoLabel, NusLogo } = window;

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
        <a
          href="https://nus.edu.sg"
          target="_blank"
          rel="noreferrer"
          style={{ display: 'inline-block', marginBottom: isMobile ? 20 : 28 }}
          aria-label="National University of Singapore"
        >
          <NusLogo height={isMobile ? 72 : 104} color={C.ink} />
        </a>
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

Object.assign(window, { Hero });
