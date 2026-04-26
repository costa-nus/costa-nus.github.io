// Site footer — wordmark + three columns of links.

const { C, F, useIsMobile, WaveMark, MonoLabel } = window;

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
            ['Openings', '/openings/'],
            ['Interest form', 'https://forms.gle/4LufZpRmkTfyj5uq9'],
          ]],
          ['External', [
            ['NUS ECE', 'https://cde.nus.edu.sg/ece/'],
            ['PI\'s site', 'https://jyhong.gitlab.io/'],
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

Object.assign(window, { Footer });
