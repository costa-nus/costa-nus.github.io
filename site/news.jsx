// News timeline. Reads window.NEWS (data/news.js).

const { C, F, useIsMobile, SectionHeader } = window;

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

Object.assign(window, { News });
