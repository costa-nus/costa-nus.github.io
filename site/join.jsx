// Join section — recruiting CTA over a token-field SVG backdrop.

const { C, F, useIsMobile, MonoLabel } = window;

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

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: isMobile ? 40 : 64, alignItems: 'center' }}>
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

Object.assign(window, { Join });
