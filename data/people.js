// Lab members and open positions — rendered on the home page People section.
// Entry shape: { name, role, term, kind, url?, scholar?, x?, highlight? }
//   kind: one of 'pi' | 'ra' | 'intern' | 'open'  (controls card color +
//         "• Hiring" label). Visual priority ramp, strongest → softest:
//           'pi'     → dark ink bg, orange avatar
//           'ra'     → fog (cool) bg, solid ink avatar       (RA / PhD / core)
//           'intern' → white bg, subtle avatar
//           'open'   → paperWarm bg + dashed avatar + "• Hiring" chip
//   role: free-form label shown under the name (e.g. affiliation suffix).
//   term: time at the lab — semester ("2026 Spring"), range ("2026 Fall -"),
//         or anchor for open slots ("2026 Summer", "Rolling basis").
//   url:      optional homepage URL  → 🌐 homepage icon link.
//   scholar:  optional Google Scholar profile URL → 🎓 scholar icon link.
//   x:        optional X (Twitter) profile URL → X icon link.
//             Each social icon renders ONLY when its field is present.
//   highlight: optional one-line notable experience (e.g. "Intern @ Qwen"),
//             shown as a small accented row under the role.
window.PEOPLE = [
  { name: 'Junyuan "Jason" Hong', role: 'Principal Investigator', term: '2026 Fall -', kind: 'pi', url: 'https://jyhong.gitlab.io/', scholar: 'https://scholar.google.com/citations?user=7Cbv6doAAAAJ&hl=en', x: 'https://x.com/hjy836' },
  { name: 'Junrui Zhang', role: 'Research Assistant · Ex: USTC', term: '2026 Fall -', kind: 'ra', url: 'https://alniyatrui.github.io/', scholar: 'https://scholar.google.com/citations?user=n7fNKpYAAAAJ' },
  { name: 'Runchuan Zhu', role: 'Research Assistant · Ex: PKU', term: '2026 Fall -', kind: 'ra', url: 'https://zrc007.github.io/', scholar: 'https://scholar.google.com/citations?user=Y_9AfuIAAAAJ', highlight: 'Research Intern @ Qwen' },
  { name: 'Minh Khoi Ho', role: 'Remote Intern · MBZUAI', term: '2026 Spring', kind: 'intern', url: 'https://hmkhoi2701.github.io/', scholar: 'https://scholar.google.com/citations?user=K5bD_NAAAAAJ' },
  { name: 'Xiang Gao', role: 'Remote Intern · Tsinghua (Yao class)', term: '2026 Spring', kind: 'intern', scholar: 'https://scholar.google.com/citations?user=zaMoZTMAAAAJ&hl=en' },
  // { name: 'Open Position', role: 'Remote Intern', term: 'Rolling basis', kind: 'open' },
  { name: 'Open Position', role: 'Remote Intern', term: '2026 Summer', kind: 'open' },
  { name: 'Open Position', role: 'PhD', term: '2027 Fall', kind: 'open' },
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
  { name: 'Jeffrey Tan',  now: 'Google', prior: 'Undergrad · UC Berkeley · VLDB 24 Best Paper Nominee', url: 'https://www.linkedin.com/in/tanjeffreyz/' },
  { name: 'Shuyang Yu',   now: 'Samsung', prior: 'PhD · MSU', url: 'https://scholar.google.com.hk/citations?user=ftBPf3oAAAAJ&hl=en' },
  { name: 'Haobo Zhang',  now: 'PhD · UMich · Amazon Intern', prior: 'PhD · MSU · US-UK PETs 3rd place', url: 'https://scholar.google.com/citations?user=uiNEZZQAAAAJ&hl=en' },
  { name: 'Siqi Liang',   now: 'PhD · UMich · Amazon Intern', prior: 'PhD · MSU', url: 'https://agentds.github.io/' },
];
