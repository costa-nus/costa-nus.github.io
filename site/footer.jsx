// Site footer — wordmark + social icons.

const { C, F, useIsMobile, WaveMark } = window;

const SOCIALS = [
  {
    label: 'X (Twitter)',
    href: 'https://x.com/hjy836',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Google Scholar',
    href: 'https://scholar.google.com/citations?user=7Cbv6doAAAAJ&hl=en',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2 1 9l11 7 9-5.727V17h2V9zM5 13.18v4L12 21l7-3.82v-4L12 17z" />
      </svg>
    ),
  },
];

function SocialIcon({ label, href, icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={label}
      title={label}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 40, height: 40, borderRadius: 20,
        border: `1px solid ${C.ink}26`,
        color: C.ink, opacity: 0.78,
        textDecoration: 'none', transition: 'opacity 0.15s, border-color 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.borderColor = `${C.ink}66`; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.78; e.currentTarget.style.borderColor = `${C.ink}26`; }}
    >
      {icon}
    </a>
  );
}

function Footer() {
  const isMobile = useIsMobile();
  return (
    <footer style={{ background: C.paper, padding: isMobile ? '48px 0 32px' : '56px 0 36px', borderTop: `1px solid ${C.ink}1a` }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px',
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between',
        gap: isMobile ? 24 : 0,
      }}>
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

        <div style={{ display: 'flex', gap: 10 }}>
          {SOCIALS.map((s) => <SocialIcon key={s.label} {...s} />)}
        </div>
      </div>

      <div style={{
        maxWidth: 1280, margin: isMobile ? '32px auto 0' : '40px auto 0',
        padding: isMobile ? '20px 20px 0' : '20px 40px 0',
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
