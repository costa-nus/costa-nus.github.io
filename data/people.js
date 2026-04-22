// Lab members and open positions — rendered on the home page People section.
// Entry shape: { name, role, note, accent?, open? }
//   accent: true  → name gets orange accent (e.g. PI)
//   open:   true  → card rendered as an open/apply slot
window.PEOPLE = [
  { name: 'Junyuan "Jason" Hong', role: 'Principal Investigator', note: 'Assistant Professor, NUS ECE · 2026–', accent: true },
  { name: 'Junrui Zhang', role: 'Research Assistant', note: '2026 Fall -', accent: false },
  { name: 'Runchuan Zhu', role: 'Research Assistant', note: '2026 Fall -', accent: false },
  { name: 'Khoi Ho', role: 'Remote Intern', note: '2026', accent: false },
  // { name: 'Open Position', role: 'Remote Intern', note: 'Rolling basis', open: true },
];

// Lab alumni — current affiliation + prior role at the lab.
// Entry shape: { name, now, prior }
window.ALUMNI = [
  { name: 'Zhangheng Li', now: 'Research Scientist · Zoom AI', prior: 'PhD · UT Austin' },
  { name: 'Runjin Chen',  now: 'Anthropic', prior: 'PhD · UT Austin · Anthropic Fellow 2025' },
  { name: 'Wes Robbins',  now: 'Clearview AI', prior: 'PhD · UT Austin' },
  { name: 'Gabriel Perin',now: 'MS · IME-USP · IBM Research', prior: 'Undergrad · USP, Brazil' },
  { name: 'Jeffrey Tan',  now: '—', prior: 'Undergrad · UC Berkeley · VLDB 24 Best Paper Nominee' },
  { name: 'Shuyang Yu',   now: 'Samsung', prior: 'PhD · MSU' },
  { name: 'Haobo Zhang',  now: 'PhD · UMich · Amazon Intern', prior: 'PhD · MSU · US-UK PETs 3rd place' },
  { name: 'Siqi Liang',   now: 'PhD · UMich · Amazon Intern', prior: 'PhD · MSU' },
];
