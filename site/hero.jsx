// Hero section + scroll-driven method-network backdrop.

const { C, F, useIsMobile, MonoLabel, NusLogo } = window;

function setupMethodScrollAnimation(svg, triggerEl) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger || !window.MotionPathPlugin) return null;

  const strokes = svg.querySelectorAll('path[stroke]');
  const fillsNoStroke = Array.from(svg.querySelectorAll('path[fill]:not([stroke])'));
  const circles = Array.from(svg.querySelectorAll('circle'));
  const smallFills = fillsNoStroke.filter(h => { const b = h.getBBox(); return b.width * b.height < 20; });
  const bigFills = fillsNoStroke.filter(h => { const b = h.getBBox(); return b.width * b.height >= 20; });
  const dots = [...bigFills, ...circles, ...smallFills];
  if (!strokes.length || !dots.length) return null;

  const center = (el) => {
    if (el.tagName === 'circle') {
      return { x: parseFloat(el.getAttribute('cx')) || 0, y: parseFloat(el.getAttribute('cy')) || 0 };
    }
    const b = el.getBBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };
  const pathEnds = (el) => {
    const d = el.getAttribute('d'); if (!d) return null;
    const segs = d.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi); if (!segs || !segs.length) return null;
    let sx = 0, sy = 0, ex = 0, ey = 0, cx = 0, cy = 0;
    segs.forEach((seg, i) => {
      const cmd = seg[0].toUpperCase();
      const nums = seg.slice(1).trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n));
      if (!nums.length) return;
      if (i === 0 && cmd === 'M') { sx = nums[0]; sy = nums[1]; cx = sx; cy = sy; }
      switch (cmd) {
        case 'M': case 'L': if (nums.length >= 2) { cx = nums[nums.length - 2]; cy = nums[nums.length - 1]; } break;
        case 'H': cx = nums[nums.length - 1]; break;
        case 'V': cy = nums[nums.length - 1]; break;
        case 'C': if (nums.length >= 6) { cx = nums[nums.length - 2]; cy = nums[nums.length - 1]; } break;
        case 'S': case 'Q': if (nums.length >= 4) { cx = nums[nums.length - 2]; cy = nums[nums.length - 1]; } break;
        case 'T': if (nums.length >= 2) { cx = nums[nums.length - 2]; cy = nums[nums.length - 1]; } break;
        case 'A': if (nums.length >= 7) { cx = nums[nums.length - 2]; cy = nums[nums.length - 1]; } break;
      }
      if (i === segs.length - 1) { ex = cx; ey = cy; }
    });
    return { start: { x: sx, y: sy }, end: { x: ex, y: ey } };
  };

  const MAX_DIST = 50;
  const used = new Set();
  let pairs = [];
  dots.forEach((d) => {
    const c = center(d);
    let best = null, minDist = Infinity;
    strokes.forEach((p) => {
      if (used.has(p)) return;
      const ends = pathEnds(p); if (!ends) return;
      const dStart = Math.hypot(c.x - ends.start.x, c.y - ends.start.y);
      const dEnd = Math.hypot(c.x - ends.end.x, c.y - ends.end.y);
      const m = Math.min(dStart, dEnd);
      if (m < MAX_DIST && m < minDist) { minDist = m; best = p; }
    });
    if (best) { pairs.push({ node: d, path: best }); used.add(best); }
  });
  if (pairs.length < dots.length / 2) {
    pairs = [];
    dots.forEach((d, m) => { if (m < strokes.length) pairs.push({ node: d, path: strokes[m] }); });
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: triggerEl,
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2,
      invalidateOnRefresh: true,
    },
  });
  pairs.forEach((pair, i) => {
    const clone = pair.node.cloneNode(true);
    const fillColor = pair.node.getAttribute('fill') || '#94C8FA';
    clone.setAttribute('fill', fillColor);
    clone.setAttribute('filter', 'drop-shadow(0 0 3px rgba(148, 200, 250, 0.7))');
    clone.removeAttribute('class');
    clone.style.animation = 'none'; // suppress the CSS pulse so GSAP fully controls opacity
    svg.appendChild(clone);
    gsap.set(clone, { opacity: 0 });
    tl.to(clone, { opacity: 1, duration: 0.3, ease: 'power2.out' }, i * 0.08);
    tl.to(clone, {
      motionPath: { path: pair.path, align: pair.path, alignOrigin: [0.5, 0.5], autoRotate: false },
      duration: 2.5,
      ease: 'none',
    }, i * 0.08);
  });

  return tl.scrollTrigger;
}

// Non-bold letters of the title; collapsed by the scroll handler in Hero so only "CoSTA" remains.
// clip-path crops horizontally at the shrinking box but leaves ascenders/descenders alone
// (overflow:hidden would clip them and shift the inline baseline).
function TitleSeg({ children }) {
  return (
    <span data-hs="out" style={{ display: 'inline-block', whiteSpace: 'pre', clipPath: 'inset(-0.3em 0 -0.3em 0)' }}>
      {children}
    </span>
  );
}

function Hero() {
  const isMobile = useIsMobile();
  const sectionRef = React.useRef(null);
  const bgRef = React.useRef(null);
  const titleRef = React.useRef(null);

  // Scroll-linked title morph: "Cognitive Science & Trustworthy AI Lab" -> "CoSTA".
  React.useEffect(() => {
    const h1 = titleRef.current;
    if (!h1) return;
    const outs = Array.from(h1.querySelectorAll('[data-hs="out"]'));
    const line = h1.querySelector('[data-hs="line"]');
    const dot = h1.querySelector('[data-hs="in"]');
    const tints = Array.from(h1.querySelectorAll('[data-hs="tint"]'));
    const clamp = (v) => Math.min(1, Math.max(0, v));
    const ease = (t) => t * t * (3 - 2 * t); // smoothstep: gentle start and end, even middle
    const STAGGER = 0.06;
    const DEAD = 80; // initial scroll distance with no visible change, so small nudges don't trigger it
    const TINT_START = 0.6, TINT_STEP = 0.1, TINT_LEN = 0.2; // A, then T, then S turn accent-orange near the end
    const PIN = 0.7; // share of scroll offset cancelled while collapsing (1 = fully pinned)
    let widths = [], lineH = 0, range = 450, raf = 0;

    const measure = () => {
      h1.style.transform = '';
      outs.forEach((el) => { el.style.width = ''; });
      if (line) line.style.height = '';
      widths = outs.map((el) => el.getBoundingClientRect().width);
      lineH = line ? line.getBoundingClientRect().height : 0;
      // The title drifts up at (1 - PIN) of normal scroll speed and finishes collapsing as it
      // nears the top. Capped so the hero's bottom edge (which clips the title) stays below it.
      const top0 = h1.getBoundingClientRect().top + window.scrollY;
      range = Math.min((top0 - 40) / (1 - PIN), window.innerHeight - 300 - DEAD);
    };
    const apply = () => {
      raf = 0;
      const s = Math.max(0, window.scrollY - DEAD);
      const p = clamp(s / range);
      // hold still through the dead zone, then counter-scroll most of the motion while collapsing;
      // it scrolls away normally afterwards
      h1.style.transform = window.scrollY === 0 ? '' : `translateY(${Math.min(window.scrollY, DEAD) + PIN * Math.min(s, range)}px)`;
      const n = outs.length;
      outs.forEach((el, i) => {
        const q = ease(clamp((p - i * STAGGER) / (1 - (n - 1) * STAGGER)));
        el.style.width = q === 0 ? '' : `${widths[i] * (1 - q)}px`;
        el.style.opacity = String(1 - q);
      });
      if (line) {
        const q = ease(clamp(p / 0.6));
        line.style.height = q === 0 ? '' : `${lineH * (1 - q)}px`;
        line.style.opacity = String(1 - q);
      }
      tints.forEach((el) => {
        const t = ease(clamp((p - TINT_START - Number(el.dataset.order) * TINT_STEP) / TINT_LEN));
        el.style.color = t === 0 ? C.ink : `color-mix(in srgb, ${C.accent} ${t * 100}%, ${C.ink})`;
      });
      if (dot) dot.style.opacity = String(ease(clamp((p - 0.5) / 0.5)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    const onResize = () => { measure(); apply(); };

    measure(); apply();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  React.useEffect(() => {
    if (!bgRef.current || !sectionRef.current) return;
    if (typeof window === 'undefined') return;
    if (window.innerWidth <= 768) return;
    let st = null;
    let cancelled = false;
    fetch('site/method-bg.svg')
      .then((r) => r.text())
      .then((txt) => {
        if (cancelled || !bgRef.current) return;
        bgRef.current.innerHTML = txt;
        const svg = bgRef.current.querySelector('svg');
        if (!svg) return;
        svg.setAttribute('preserveAspectRatio', 'xMidYMax meet');
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.display = 'block';
        const tryStart = () => {
          if (cancelled) return;
          if (!window.gsap || !window.MotionPathPlugin || !window.ScrollTrigger) {
            return setTimeout(tryStart, 80);
          }
          st = setupMethodScrollAnimation(svg, sectionRef.current);
        };
        tryStart();
      });
    return () => {
      cancelled = true;
      if (st) st.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} id="top" style={{ background: C.paper, paddingTop: isMobile ? 80 : 64, paddingBottom: isMobile ? 80 : 64, position: 'relative', overflow: 'hidden', minHeight: '100vh', boxSizing: 'border-box', display: 'flex' }}>
      {/* Decorative method-network backdrop — bottom-aligned, scaled to span the section, scroll-driven */}
      <div
        ref={bgRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          transform: 'scaleX(-1)', // mirror horizontally
          width: '60vw',
          maxWidth: 'none',
          opacity: 0.6,
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      />
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
      `}</style>
      <div className="costa-sun">
        <span className="costa-sun-ring costa-sun-ring-3" />
        <span className="costa-sun-ring costa-sun-ring-2" />
        <span className="costa-sun-ring costa-sun-ring-1" />
      </div>

      {/* 3-row grid: logo | title | meta. Outer rows split 0.8:1.2, so the title sits slightly above center and scales with viewport height. */}
      <div style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px', position: 'relative', zIndex: 1, display: 'grid', gridTemplateRows: '0.8fr auto 1.2fr' }}>
        <div>
        <a
          href="https://nus.edu.sg"
          target="_blank"
          rel="noreferrer"
          style={{ display: 'inline-block', marginBottom: isMobile ? 20 : 28 }}
          aria-label="National University of Singapore"
        >
          <NusLogo height={isMobile ? 72 : 104} color={C.ink} />
        </a>
        </div>
        <h1 ref={titleRef} style={{
          fontFamily: F.display, fontWeight: 500, fontSize: 'clamp(38px, 7.8vw, 96px)',
          letterSpacing: '-0.04em', lineHeight: 1.0, color: `${C.ink}80`, margin: 0,
          textWrap: 'balance',
        }}>
          <span style={{ fontWeight: 800, color: C.ink }}>Co</span>
          <TitleSeg>gnitive </TitleSeg>
          <span data-hs="tint" data-order="2" style={{ fontWeight: 800, color: C.ink }}>S</span>
          <TitleSeg>cience <span style={{ opacity: 0.75 }}>&amp;</span> </TitleSeg>
          <span data-hs="tint" data-order="1" style={{ fontWeight: 800, color: C.ink }}>T</span>
          <TitleSeg>rustworthy </TitleSeg>
          <span data-hs="tint" data-order="0" style={{ fontWeight: 800, color: C.ink }}>A</span>
          <TitleSeg>I</TitleSeg>
          {/* accent dot that takes over from the "Lab." dot once the title has collapsed */}
          <span data-hs="in" className="costa-dot-accent" style={{ opacity: 0 }} />
          <span data-hs="line" style={{ display: 'block' }}>
            Lab
            <span className="costa-dot-accent" />
          </span>
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

      </div>
    </section>
  );
}

Object.assign(window, { Hero });
