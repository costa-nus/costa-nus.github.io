// PI introduction strip — portrait + pull-quote + press coverage row.

const { C, F, useIsMobile, MonoLabel } = window;

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

Object.assign(window, { PIIntro });
