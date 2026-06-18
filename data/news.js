// News / timeline — reverse-chronological dispatches shown in the home page
// News section. Entry shape: { date, body, tags }
//   date: display string (free-form, e.g. "01 · 2026")
//   body: free text; supports inline Markdown **bold**, *italic*, and
//         [text](href) links via mdInline (see site/_shared.jsx)
//   tags: string[] used for the News section's tag filter chips
window.NEWS = [
  { date: '06 · 2026', body: 'One paper ([CrashTwin](https://openreview.net/pdf?id=RlMArW0XQ4)) is accepted to ECCV 2026.', tags: ['Paper'] },
  { date: '06 · 2026', body: 'We are grateful to receive NSF NAIRR Pilot Award for building dementia digital twins.', tags: ['Grant'] },
  { date: '05 · 2026', body: 'Jason serves as Area Chair at NeurIPS 2026 and is awarded the Gold Reviewer at ICML 2026.', tags: ['Honor'] },
  { date: '05 · 2026', body: 'One paper ([Scaling Textual Gradients](https://arxiv.org/abs/2506.00400)) is accepted to CAIS.', tags: ['Paper'] },
  { date: '04 · 2026', body: 'New preprint on AI autoresearch ([The Last Human-Written Paper](https://arxiv.org/abs/2604.24658)) is out.', tags: ['Paper'] },
  { date: '04 · 2026', body: 'Jason is co-organizing AutoML 2026.' },
  { date: '01 · 2026', body: 'We are grateful to receive a grant from NSF Access Program.', tags: ['Grant'] },
  { date: '01 · 2026', body: 'One paper (Training-Free Robot Planning) is accepted to ICRA 2026.', tags: ['Paper'] },
  { date: '10 · 2025', body: 'New paper covered by Nature News, WIRED, Forbes, and FORTUNE — LLMs can get "Brain Rot" after browsing social media.', tags: ['Press', 'Paper'] },
  // { date: '08 · 2025', body: 'Jason is joining NUS ECE as a Tenure-Track Assistant Professor starting July 2026, after a year at MGH & Harvard Medical School.' },
  { date: '07 · 2025', body: 'Jason serves as Area Chair at NeurIPS 2025; co-organizing GenAI4Health and FedKDD workshops.' },
  { date: '11 · 2024', body: 'A-CONECT project is supported by the NAIRR Pilot Program.', tags: ['Grant'] },
  { date: '08 · 2024', body: 'LLM-PBE benchmark is selected as best paper finalist and adopted for NeurIPS 2024 LLM Privacy Challenge.', tags: ['Honor', 'Paper'] },
  { date: '07 · 2024', body: 'A-CONECT project is supported by OpenAI Researcher Access Program.', tags: ['Grant'] },
  { date: '05 · 2024', body: 'Jason is named MLSys Rising Star for work in health and trustworthy ML.', tags: ['Honor'] },
];
