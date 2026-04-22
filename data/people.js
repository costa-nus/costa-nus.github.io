// Lab members and open positions — rendered on the home page People section.
// Entry shape: { name, role, note, accent?, open?, url? }
//   accent: true  → name gets orange accent (e.g. PI)
//   open:   true  → card rendered as an open/apply slot
//   url:    optional homepage; when present, the name renders as a link.
window.PEOPLE = [
  { name: 'Junyuan "Jason" Hong', role: 'Principal Investigator', note: 'NUS ECE · 2026–', accent: true, url: 'https://jyhong.gitlab.io/' },
  { name: 'Junrui Zhang', role: 'Research Assistant', note: '2026 Fall -', accent: false, url: 'https://scholar.google.com/citations?user=n7fNKpYAAAAJ&hl=zh-CN' },
  { name: 'Runchuan Zhu', role: 'Research Assistant', note: '2026 Fall -', accent: false, url: 'https://scholar.google.com/citations?user=Y_9AfuIAAAAJ&hl=zh-CN' },
  { name: 'Khoi Ho', role: 'Remote Intern', note: '2026', accent: false, url: 'https://hmkhoi2701.github.io/' },
  // { name: 'Open Position', role: 'Remote Intern', note: 'Rolling basis', open: true },
];

// Lab alumni — current affiliation + prior role at the lab.
// Entry shape: { name, now, prior, url? }
//   url: optional homepage; when present, the name renders as a link.
window.ALUMNI = [
  { name: 'Zhangheng Li', now: 'Research Scientist · Zoom AI', prior: 'PhD · UT Austin', url: 'https://scholar.google.com/citations?user=NZCLqZMAAAAJ&hl=zh-CN' },
  { name: 'Runjin Chen',  now: 'Anthropic', prior: 'PhD · UT Austin · Anthropic Fellow 2025', url: 'https://chenrunjin.github.io/' },
  { name: 'Wes Robbins',  now: 'Clearview AI', prior: 'PhD · UT Austin', url: 'https://wes-robbins.xyz/' },
  { name: 'Gabriel Perin',now: 'MS · IME-USP · IBM Research', prior: 'Undergrad · USP, Brazil', url: 'https://scholar.google.com/citations?user=Ihn-OugAAAAJ&hl=en' },
  { name: 'Ostap Kilbasovych', now: 'MS · Mundus', prior: 'Undergrad · Ivan Franko National U. of Lviv, Ukraine', url: 'https://www.linkedin.com/in/ostap-kilbasovych-b88830175/' },
  { name: 'Jeffrey Tan',  now: '—', prior: 'Undergrad · UC Berkeley · VLDB 24 Best Paper Nominee', url: 'https://www.linkedin.com/in/tanjeffreyz/' },
  { name: 'Shuyang Yu',   now: 'Samsung', prior: 'PhD · MSU', url: 'https://scholar.google.com.hk/citations?user=ftBPf3oAAAAJ&hl=en' },
  { name: 'Haobo Zhang',  now: 'PhD · UMich · Amazon Intern', prior: 'PhD · MSU · US-UK PETs 3rd place', url: 'https://scholar.google.com/citations?user=uiNEZZQAAAAJ&hl=en' },
  { name: 'Siqi Liang',   now: 'PhD · UMich · Amazon Intern', prior: 'PhD · MSU', url: 'https://agentds.github.io/' },
];
