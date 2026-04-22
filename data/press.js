// Press coverage — visual row on the home page Research section.
// Entry shape:
//   { outlet, headline, date, href, image?, theme? }
//   outlet:   e.g. 'Nature', 'WIRED' (short brand name, rendered as mono kicker)
//   headline: the article's own headline, not our paraphrase
//   date:     'Oct 2025' — kept short; displayed under the outlet
//   href:     article URL (opens in new tab)
//   image:    optional path relative to site root (e.g. 'site/press/nature-brainrot.jpg').
//             Missing/failed images fall back to a typographic cover.
//   theme:    optional pillar id ('T1'|'T2'|'T3') if we ever want to align a
//             press item with a research theme. Unused for now.
window.PRESS_COVERAGE = [
  {
    outlet: 'Nature',
    headline: 'Too much social media gives AI chatbots brain rot',
    date: 'Oct 2025',
    href: 'https://www.nature.com/articles/d41586-025-03542-2',
    image: 'site/press/nature-brainrot.jpg',
    theme: 'T1',
  },
  {
    outlet: 'WIRED',
    headline: 'AI Models Get Brain Rot, Too',
    date: 'Oct 2025',
    href: 'https://www.wired.com/story/ai-models-social-media-cognitive-decline-study/',
    image: 'site/press/wired-brainrot.jpg',
    theme: 'T1',
  },
  {
    outlet: 'Forbes',
    headline: 'Junky Online Content Gives AI Models Brain Rot Too',
    date: 'Oct 2025',
    href: 'https://www.forbes.com/sites/lesliekatz/2025/10/23/junky-online-content-gives-ai-models-brain-rot-too/',
    image: 'site/press/forbes-brainrot.jpg',
    theme: 'T1',
  },
  {
    outlet: 'Fortune',
    headline: 'Just like humans, AI can get "brain rot" from low-quality text — and the effects linger',
    date: 'Oct 2025',
    href: 'https://fortune.com/2025/10/22/ai-brain-rot-junk-social-media-viral-addicting-content-tech/',
    image: 'site/press/fortune-brainrot.jpg',
    theme: 'T1',
  },
];
