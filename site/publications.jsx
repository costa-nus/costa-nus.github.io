// Publications section + the PubRow building block reused on /publications/.
// Reads window.PUBS_FULL (data/publications.js) and derives Most-recent + Selected.

const { C, F, useIsMobile, SubSectionTitle, AuthorName, AuthorInfo } = window;

const PUBS_FULL = window.PUBS_FULL;
const RECENT_MONTHS_WINDOW = 6;

// Decide whether a publication counts as "recent" for the home-page
// Most-recent subsection. Reads `p.date` as ISO "YYYY-MM-DD" (synced from
// jyhong.gitlab.io — see CLAUDE.md). Falls back to `{year}-12-31` so newly
// added entries without a date still surface if their year overlaps the
// window — no manual annotation needed.
function isRecent(p, now = new Date(), monthsBack = RECENT_MONTHS_WINDOW) {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - monthsBack);
  const cutoffISO = cutoff.toISOString().slice(0, 10);
  const dateISO = p.date || (p.year ? `${p.year}-12-31` : null);
  return dateISO != null && dateISO >= cutoffISO;
}

function Publications() {
  const isMobile = useIsMobile();
  // Selected = PI-flagged entries from the archive. Derived so the landing
  // page and /publications/ stay in sync from a single source of truth.
  const selected = React.useMemo(() => PUBS_FULL.filter(p => p.selected), []);
  // Most recent = entries whose `date` falls inside the rolling window.
  // Sorted newest-first by date, then by year as a tiebreaker.
  const recent = React.useMemo(() => {
    const now = new Date();
    return PUBS_FULL
      .filter(p => isRecent(p, now, RECENT_MONTHS_WINDOW))
      .slice()
      .sort((a, b) => (b.date || '').localeCompare(a.date || '')
        || String(b.year).localeCompare(String(a.year)));
  }, []);
  const subHeader = (label) => (
    <SubSectionTitle color={C.accent} style={{ marginBottom: 18 }}>{label}</SubSectionTitle>
  );

  return (
    <section id="publications" style={{ background: C.secondary, padding: isMobile ? '72px 0' : '120px 0', color: C.paper }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px' }}>
        <div style={{ maxWidth: 900, marginBottom: isMobile ? 32 : 56 }}>
          <div style={{
            fontFamily: F.display, fontWeight: 700, fontSize: 'clamp(34px, 6.2vw, 56px)',
            letterSpacing: '-0.035em',
            lineHeight: 1.04, color: C.paper, textWrap: 'balance',
          }}>
            Publications
          </div>
        </div>

        <div style={{ marginBottom: isMobile ? 32 : 48, display: 'flex' }}>
          <a href="/publications/" style={{
            fontFamily: F.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: C.accent, textDecoration: 'none', fontWeight: 500,
            padding: '10px 16px', border: `1px solid ${C.accent}`,
          }}>
            View all publications →
          </a>
        </div>

        {recent.length > 0 && (
          <div style={{ marginBottom: isMobile ? 48 : 64 }}>
            {subHeader(`Most recent · last ${RECENT_MONTHS_WINDOW} months`)}
            <div style={{ borderTop: `1px solid ${C.paper}22` }}>
              {recent.map((p, i) => (
                <PubRow
                  key={`r-${i}`}
                  p={p}
                  showYear={i === 0 || recent[i - 1].year !== p.year}
                  showStar={false}
                />
              ))}
            </div>
          </div>
        )}

        {subHeader('Selected')}

        <div style={{ borderTop: `1px solid ${C.paper}22` }}>
          {selected.map((p, i) => (
            <PubRow
              key={i}
              p={p}
              showYear={i === 0 || selected[i - 1].year !== p.year}
              showStar={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// A paper's project page, or null when it has no standalone site. The PI site
// labels a project site with the word "Website" (usually "🌍 Website"), which
// is what both publication views key off to make the title link jump straight
// to the project page instead of to the PDF or the PI's per-paper page.
// Exported on window so /publications/ applies the same rule — keep the
// definition here so the two views cannot drift apart.
function projectHref(p) {
  const hit = (p.links || []).find(l => (l.label || '').toLowerCase().includes('website'));
  return hit ? hit.href : null;
}

// Pick the best external link for a publication title: prefer a project
// website, then the PDF/preprint, then fall back to the first link.
function pickPubHref(p) {
  const links = p.links || [];
  if (!links.length) return null;
  const score = (l) => {
    const lab = (l.label || '').toLowerCase();
    if (lab.includes('website')) return 0;
    if (lab === 'pdf' || lab === 'preprint') return 1;
    return 2;
  };
  return [...links].sort((a, b) => score(a) - score(b))[0].href;
}

// Compact, collapsible author line for the home-page rows. The archive at
// /publications/ prints every author; here the row has to stay on one line, so
// the middle of a long list collapses behind an "(N more authors)" control.
//
// What survives a collapse, and why: the opening authors and the final author
// carry the most signal in an author list, the PI anchors the paper to the lab,
// and an equal-contribution note means a co-first author who would be
// misleading to hide. Everything else is foldable. Because the PI can sit in
// the middle of a long list, the hidden names may fall into more than one run —
// each run gets its own control, and they all toggle together.
function AuthorLine({ authors, compact }) {
  const [expanded, setExpanded] = React.useState(false);
  const list = authors || [];
  const n = list.length;

  const LEAD = 1;                 // opening author always shown
  const TAIL = 1;                 // senior/last author always shown
  const keep = new Set();
  for (let i = 0; i < Math.min(LEAD, n); i++) keep.add(i);
  for (let i = Math.max(0, n - TAIL); i < n; i++) keep.add(i);
  list.forEach((a, i) => { if (a.highlighted || a.note) keep.add(i); });

  // Folding a single name buys no space and costs a control, so don't. Decide
  // this from the list itself, not from the current expand state, or the
  // "(less)" control disappears the moment it is needed.
  const collapsible = (n - keep.size) >= 2;
  const collapsed = !expanded && collapsible;

  // A gap of a single name would render "(1 more author)" — wider than the
  // name it hides — so show that name instead.
  if (collapsed) {
    let i = 0;
    while (i < n) {
      if (keep.has(i)) { i++; continue; }
      let j = i;
      while (j < n && !keep.has(j)) j++;
      if (j - i === 1) keep.add(i);
      i = j;
    }
  }
  // Flatten to segments first — a name or a run of hidden names — so the ", "
  // separators fall between segments uniformly and the control is punctuated
  // like a name rather than butting against the one before it.
  const segments = [];
  list.forEach((a, i) => {
    if (collapsed && !keep.has(i)) {
      const last = segments[segments.length - 1];
      if (last && last.gap) last.count++;
      else segments.push({ gap: true, count: 1, at: i });
      return;
    }
    segments.push({ author: a, at: i });
  });

  const parts = [];
  segments.forEach((s, k) => {
    if (k) parts.push(<span key={`sep-${k}`}>, </span>);
    parts.push(s.gap
      ? <button
          key={`more-${s.at}`}
          type="button"
          className="author-more"
          aria-expanded="false"
          onClick={() => setExpanded(true)}
        >({s.count} more author{s.count === 1 ? '' : 's'})</button>
      : <React.Fragment key={s.at}>
          <AuthorName author={s.author} />
          {s.author.note && <AuthorInfo tip={s.author.note} />}
        </React.Fragment>
    );
  });

  // Keeping to one line is a hard constraint, and no name-count heuristic can
  // promise it: a paper with four equal-contribution authors keeps four names
  // whatever we do, and the column is only ~490px at 1024px wide. So the
  // collapsed line clips with an ellipsis, which holds at any width. Because a
  // clipped line could cut off the "(N more authors)" control, the whole
  // collapsed line is clickable — the control is the visible affordance, not
  // the only way out of it.
  // The clamp keys off `expanded`, not `collapsible`: a short list hides no
  // names yet can still wrap on a narrow screen, and it has to stay on one
  // line too. Clicking such a line simply unclamps it.
  const clamp = !expanded ? {
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    cursor: 'pointer',
  } : null;

  return (
    <div
      style={{
        fontFamily: F.display, fontSize: compact ? 12 : 13, lineHeight: 1.5,
        color: C.paper, opacity: 0.62, marginTop: compact ? 6 : 7,
        ...clamp,
      }}
      title={!expanded ? 'Show all authors' : undefined}
      onClick={!expanded ? () => setExpanded(true) : undefined}
    >
      {parts}
      {expanded && (
        <>
          {' '}
          <button type="button" className="author-more" aria-expanded="true"
                  onClick={() => setExpanded(false)}>(less)</button>
        </>
      )}
    </div>
  );
}

function PubRow({ p, showYear = true, showStar = true }) {
  const isMobile = useIsMobile();
  // venue may be bare ("ICLR") or carry a parenthetical modifier ("ICLR (Spotlight)",
  // "VLDB (Best Paper Finalist)"). Split so the two-line column still shows a
  // distinct type sub-label when there is one.
  const venueMatch = (p.venue || '').match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  const venueBase = venueMatch ? venueMatch[1] : p.venue;
  const typeLabel = venueMatch ? venueMatch[2] : (p.type || '');
  const highlight = /(Spotlight|Best Paper|Finalist|Oral)/i.test(typeLabel);
  const href = pickPubHref(p);
  const titleNode = href
    ? <a href={href} target="_blank" rel="noopener"
         style={{ color: 'inherit', textDecoration: 'none', borderBottom: `1px solid ${C.paper}33` }}>
        {p.title}
      </a>
    : p.title;

  const tagChips = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
      {p.tags.map(t => (
        <span key={t} style={{
          fontFamily: F.mono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '4px 8px', border: `1px solid ${C.paper}33`, color: C.paper, opacity: 0.7,
          whiteSpace: 'nowrap',
        }}>{t}</span>
      ))}
    </div>
  );

  // When a paper has press coverage, surface outlet names (echoing the
  // PIIntro "Covered in" strip) in the slot that would otherwise hold
  // tag chips. Italic editorial serif, hover brightens to accent.
  const mediaStrip = p.media && p.media.length > 0 ? (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '4px 12px',
      justifyContent: isMobile ? 'flex-start' : 'flex-end',
      alignItems: 'baseline',
    }}>
      <span style={{
        fontFamily: F.mono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: C.paper, opacity: 0.5, fontWeight: 500, marginRight: 2,
      }}>Covered in</span>
      {p.media.map(m => (
        <a key={m.name} href={m.href} target="_blank" rel="noopener noreferrer"
           style={{
             fontFamily: F.editorial, fontStyle: 'italic', fontSize: 13,
             color: C.paper, opacity: 0.7, textDecoration: 'none',
             letterSpacing: '-0.005em', whiteSpace: 'nowrap',
             transition: 'opacity 0.15s ease-out, color 0.15s ease-out',
           }}
           onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = C.accent; }}
           onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.color = C.paper; }}
        >{m.name}</a>
      ))}
    </div>
  ) : null;
  const hasTags = p.tags && p.tags.length > 0;
  const sideSlot = mediaStrip ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: isMobile ? 'flex-start' : 'flex-end' }}>
      {mediaStrip}
      {hasTags && tagChips}
    </div>
  ) : (hasTags ? tagChips : null);

  if (isMobile) {
    return (
      <div style={{ padding: '18px 0', borderBottom: `1px solid ${C.paper}18` }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap',
          fontFamily: F.mono, fontSize: 11, letterSpacing: '0.08em', color: C.paper, opacity: 0.75,
        }}>
          <span>{p.year}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ fontFamily: F.display, fontWeight: 600, fontSize: 13, opacity: 1, letterSpacing: 0 }}>
            {venueBase}
          </span>
          {typeLabel && (
            <span style={{
              color: highlight ? C.accent : C.paper, opacity: highlight ? 1 : 0.55,
              textTransform: 'uppercase', fontWeight: 500,
            }}>
              {typeLabel}
            </span>
          )}
        </div>
        <div style={{
          fontFamily: F.editorial, fontSize: 17, lineHeight: 1.32, color: C.paper,
          letterSpacing: '-0.005em', marginTop: 8, textWrap: 'pretty',
        }}>
          {showStar && p.selected && (
            <span title="PI's selected pick" style={{
              color: C.accent, marginRight: 6, fontFamily: F.display, fontSize: 15,
            }}>★</span>
          )}
          {titleNode}
        </div>
        {p.authors && p.authors.length > 0 && <AuthorLine authors={p.authors} compact />}
        {sideSlot && <div style={{ marginTop: 10 }}>{sideSlot}</div>}
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '100px 160px 1fr 200px',
      gap: 24,
      padding: '22px 0', borderBottom: `1px solid ${C.paper}18`, alignItems: 'baseline',
    }}>
      <div style={{ fontFamily: F.mono, fontSize: 13, color: C.paper, opacity: 0.85, letterSpacing: '0.05em' }}>
        {showYear ? p.year : ''}
      </div>
      <div>
        <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 15, color: C.paper }}>{venueBase}</div>
        {typeLabel && (
          <div style={{
            fontFamily: F.mono, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: highlight ? C.accent : C.paper, opacity: highlight ? 1 : 0.5, marginTop: 4, fontWeight: 500,
          }}>
            {typeLabel}
          </div>
        )}
      </div>
      <div style={{
        fontFamily: F.editorial, fontSize: 19, lineHeight: 1.35, color: C.paper,
        letterSpacing: '-0.005em', textWrap: 'pretty',
      }}>
        {showStar && p.selected && (
          <span title="PI's selected pick" style={{
            color: C.accent, marginRight: 8, fontFamily: F.display, fontSize: 16,
            verticalAlign: '1px',
          }}>★</span>
        )}
        {titleNode}
        {p.authors && p.authors.length > 0 && <AuthorLine authors={p.authors} />}
      </div>
      {sideSlot}
    </div>
  );
}

Object.assign(window, { Publications, PubRow, PUBS_FULL, projectHref });
