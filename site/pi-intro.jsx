// PI introduction strip — portrait + pull-quote + press coverage row.

const { C, F, useIsMobile, MonoLabel, SPONSORS, NEWS } = window;

function PIIntro() {
  const isMobile = useIsMobile();
  const [showAllNews, setShowAllNews] = React.useState(false);
  const NEWS_PREVIEW = 7;
  const visibleNews = showAllNews ? NEWS : NEWS.slice(0, NEWS_PREVIEW);
  // Subtle accent-underlined inline link, reused across the bio prose.
  const link = {
    color: C.ink, fontWeight: 600, textDecoration: 'none',
    borderBottom: `1.5px solid ${C.accent}59`, paddingBottom: 1,
  };
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
          {/* <MonoLabel>About the PI</MonoLabel> */}
          <p style={{
            fontFamily: F.display, fontWeight: 500,
            fontSize: 'clamp(18px, 2.3vw, 23px)',
            lineHeight: 1.5, color: C.ink, margin: '16px 0 0',
            textWrap: 'pretty', letterSpacing: '-0.015em',
          }}>
            At CoSTA Lab, we aim to build trustworthy AI by exploring the frontier where{' '}
            <u style={{ textDecorationColor: C.accent, textDecorationThickness: 2, textUnderlineOffset: 4 }}>human minds meet machine intelligence</u>.
          </p>

          {/* news */}
          <div style={{ marginTop: isMobile ? 36 : 44 }}>
            <MonoLabel size={9}>News</MonoLabel>
            <div style={{ marginTop: 14, borderTop: `1px solid ${C.ink}20` }}>
              {visibleNews.map((n, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '84px 1fr',
                  gap: isMobile ? 4 : 20,
                  padding: '7px 0',
                  alignItems: 'baseline',
                }}>
                  <div style={{
                    fontFamily: F.mono, fontSize: 12, letterSpacing: '0.08em', color: C.ink, opacity: 0.7,
                    whiteSpace: 'nowrap',
                  }}>{n.date}</div>
                  <div style={{
                    fontFamily: F.display, fontSize: 15, lineHeight: 1.45, color: C.ink,
                    textWrap: 'pretty', fontWeight: n.starred ? 500 : 400,
                  }}>
                    {n.body}
                    {n.tags && n.tags.map(t => (
                      <span key={t} style={{
                        fontFamily: F.mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
                        padding: '2px 7px', border: `1px solid ${C.ink}30`, color: C.ink, opacity: 0.7,
                        fontWeight: 500, whiteSpace: 'nowrap',
                        marginLeft: 8, verticalAlign: '2px', display: 'inline-block',
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {NEWS.length > NEWS_PREVIEW && (
              <button
                onClick={() => setShowAllNews(v => !v)}
                style={{
                  marginTop: 14, background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  fontFamily: F.mono, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: C.ink, opacity: 0.7, fontWeight: 600,
                  transition: 'color 0.15s ease-out, opacity 0.15s ease-out',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = C.accent; e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.ink; e.currentTarget.style.opacity = '0.7'; }}
              >
                {showAllNews ? '− Show less' : `+ Show ${NEWS.length - NEWS_PREVIEW} more`}
              </button>
            )}
          </div>

          {/* coverage strip */}
          <div style={{ marginTop: 48 }}>
            <MonoLabel size={9}>Media Coverage</MonoLabel>
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

          {/* sponsor strip */}
          <div style={{ marginTop: 40 }}>
            <MonoLabel size={9}>Sponsors (Inc. Prior Institutes)</MonoLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginTop: 16, alignItems: 'center' }}>
              {SPONSORS.map(({ name, url, image, height }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  <img
                    src={image}
                    alt={`${name} logo`}
                    style={{
                      height, width: 'auto', display: 'block',
                      filter: 'grayscale(1)', opacity: 0.55,
                      transition: 'opacity 0.15s ease-out, filter 0.15s ease-out',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.filter = 'grayscale(0)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0.55'; e.currentTarget.style.filter = 'grayscale(1)'; }}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { PIIntro });
