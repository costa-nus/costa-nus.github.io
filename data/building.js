// What we're building — project cards in the home page Research section.
// Same visual shell as data/press.js entries (cover + caption), different
// semantics: each entry is an active lab project the public can try or read.
//
// Entry shape:
//   { name, tagline, status, href, image?, theme? }
//   name:    short brand (rendered bold, top-left of caption)
//   tagline: one-sentence description in editorial serif
//   status:  short meta ('Live · Public beta', 'In development', etc.) —
//            rendered in the top-right mono slot where press covers show the date
//   href:    primary project link (opens in new tab)
//   image:   optional path relative to site root (e.g. 'site/projects/aconect.jpg');
//            missing/failed images fall back to the typographic placeholder
//   theme:   optional pillar id ('T1'|'T2'|'T3') aligning a project with a research theme
window.WHAT_WE_BUILD = [
  {
    name: 'A-CONECT',
    tagline: 'A conversational AI for early dementia intervention.',
    status: 'Public beta',
    href: 'https://a-conect.github.io/#/features',
    image: 'site/projects/aconect.jpg',
    theme: 'T2',
  },
  {
    name: 'AutoML 2026',
    tagline: 'A conference on automated machine learning.',
    status: 'Conference · 2026',
    href: 'https://2026.automl.cc/',
    image: 'site/projects/automl2026.jpg',
    theme: 'T1',
  },
  {
    name: 'GenAI4Health @ NeurIPS 2025',
    tagline: 'A NeurIPS workshop on generative AI for health.',
    status: 'NeurIPS · Dec 2025',
    href: 'https://genai4health.github.io/',
    image: 'site/projects/genai4health.jpg',
    theme: 'T2',
  },
  {
    name: 'LLM-PC @ NeurIPS 2024',
    tagline: 'A NeurIPS challenge on LLM privacy.',
    status: 'NeurIPS · Competition',
    href: 'https://llm-pc.github.io/',
    image: 'site/projects/llm-pc.jpg',
    theme: 'T3',
  },
  {
    name: 'CLAS @ NeurIPS 2024',
    tagline: 'A NeurIPS competition on LLM and agent safety.',
    status: 'NeurIPS · Competition',
    href: 'https://neurips.cc/virtual/2024/competition/84796',
    image: 'site/projects/clas2024.jpg',
    theme: 'T3',
  },
];
