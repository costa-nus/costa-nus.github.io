// People section — current members grid + previous mentees row.
// Reads window.PEOPLE / window.ALUMNI (data/people.js).

const { C, F, useIsMobile, MonoLabel, SectionHeader } = window;

const PEOPLE = window.PEOPLE;
const ALUMNI = window.ALUMNI;

function People() {
  const isMobile = useIsMobile();
  return (
    <section id="people" style={{ background: C.paper, padding: isMobile ? '72px 0' : '120px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px' }}>
        <SectionHeader title="People" />

        <MonoLabel size={10}>Current members</MonoLabel>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '180px' : '240px'}, 1fr))`,
          gap: 1,
          marginTop: 16, background: `${C.ink}18`, border: `1px solid ${C.ink}18`,
        }}>
          {PEOPLE.map((p, i) => <PersonCard key={i} p={p} />)}
        </div>

        <div style={{ height: isMobile ? 48 : 80 }} />
        <MonoLabel size={10}>Previous mentees with PI (before NUS)</MonoLabel>
        <div style={{ marginTop: 16, borderTop: `1px solid ${C.ink}22` }}>
          {ALUMNI.map((a, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr 1.4fr',
              gap: isMobile ? 4 : 24,
              padding: isMobile ? '14px 0' : '16px 0',
              borderBottom: `1px solid ${C.ink}15`,
              alignItems: 'baseline',
            }}>
              <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 17, color: C.ink, letterSpacing: '-0.015em' }}>
                {a.url ? (
                  <a href={a.url} target="_blank" rel="noopener noreferrer"
                     style={{ color: 'inherit', textDecoration: 'none', borderBottom: `1px solid ${C.ink}33` }}>
                    {a.name}
                  </a>
                ) : a.name}
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

// Visual priority, strongest → softest: PI (ink) > RA/PhD (fog) > Intern (white) > Open (paperWarm + dashed).
// Keys must match the `kind` enum in data/people.js; unknown/missing values fall back to 'ra'.
const PERSON_PALETTE = {
  pi:     { bg: C.ink,       fg: C.paper, dot: C.accent,      dotBorder: 'none' },
  ra:     { bg: C.fog,       fg: C.ink,   dot: C.ink,         dotBorder: 'none' },
  intern: { bg: '#fff',      fg: C.ink,   dot: `${C.ink}25`,  dotBorder: 'none' },
  open:   { bg: C.paperWarm, fg: C.ink,   dot: 'transparent', dotBorder: `1.5px dashed ${C.ink}55` },
};

function PersonCard({ p }) {
  const kind = PERSON_PALETTE[p.kind] ? p.kind : 'ra';
  const palette = PERSON_PALETTE[kind];
  const { bg, fg } = palette;
  return (
    <div style={{
      background: bg, color: fg, padding: 24, minHeight: 180, display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 22,
          background: palette.dot,
          border: palette.dotBorder,
        }} />
        {kind === 'open' && (
          <div style={{
            fontFamily: F.mono, fontSize: 9, letterSpacing: '0.16em', color: C.accent,
            textTransform: 'uppercase', fontWeight: 600,
          }}>• Hiring</div>
        )}
      </div>
      <div>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 17, letterSpacing: '-0.015em', lineHeight: 1.15 }}>
          {p.url ? (
            <a href={p.url} target="_blank" rel="noopener noreferrer"
               style={{ color: 'inherit', textDecoration: 'none', borderBottom: `1px solid ${fg}33` }}>
              {p.name}
            </a>
          ) : kind === 'open' ? (
            <a href="/openings/"
               style={{ color: 'inherit', textDecoration: 'none', borderBottom: `1px solid ${fg}33` }}>
              {p.name}
            </a>
          ) : p.name}
        </div>
        <div style={{ fontFamily: F.display, fontSize: 12.5, opacity: 0.75, marginTop: 4 }}>
          {p.role}
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 9.5, letterSpacing: '0.08em', opacity: 0.55, marginTop: 10 }}>
          {p.term}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { People });
