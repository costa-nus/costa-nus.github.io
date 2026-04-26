// Top navigation bar. Reveals on scroll on the home page; sticky on sub-pages.

const { C, F, useIsMobile, WaveMark } = window;

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

Object.assign(window, { Nav });
