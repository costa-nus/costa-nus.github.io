// Research pillars — three-column cards on the home page Research section.
// Entry shape: { id, title, lede, bullets, refs, figure }
//   figure: 'neurons' | 'pulse' | 'shield'   (small decorative SVG)
//   lede + bullets accept inline Markdown: **bold** and *italic*. Patterns
//   don't nest and don't support escapes (see mdInline in site/_shared.jsx).
//   Note: lede renders in editorial italic, so *italic* inside it is a no-op
//   visually — use **bold** for emphasis there.
//   refs: array of "Selected work" entries under each card. Each entry is
//   either a plain string (rendered as muted text) or { label, href } where
//   href is the paper's PDF URL (rendered as a link, opens in a new tab).
//   PDF URLs mirror the matching entry's PDF link in data/publications.js.
window.RESEARCH_PILLARS = [
    {
      id: 'T1',
      title: 'Cognitive Science of AI',
      // lede: 'We aim to understand the inner workings and vulnerabilities of AI systems through the lens of cognitive psychology and neuroscience.',
      lede: 'Understand the inner mechanisms of AI systems through the lens of cognitive psychology and neuroscience.',
      bullets: [
        'Does AI *internally* share the same mechanistc vulnerabilities as humans, e.g., brain rot [3], emotion biases?',
        'How to steer AI behaviors via intervening cognitive mechanisms internally (by neurons [2]) or externally (by prompts [1])?',
        // 'How to steer AI behaviors internally (by neurons [2]) or externally (by prompts [1])?',
        // 'Developing general automatic frameworks of reasoning and learning, e.g., LLM-driven Auto Differentiation [1].',
        // 'Understanding the learning process and cognitive behaviors of AI via psychological or neuron intervention [2] [3].',
      ],
      refs: [
        { label: '[1] DP-OPT · ICLR 24 Spotlight', href: 'https://arxiv.org/abs/2312.03724' },
        { label: '[2] SEAL · COLM 25', href: 'https://arxiv.org/abs/2504.07986' },
        { label: '[3] LLM Brain Rot · arXiv 25', href: 'https://arxiv.org/abs/2510.13928' },
      ],
      figure: 'neurons',
    },
    {
      id: 'T2',
      title: 'Trustworthy AI',
      lede: 'Develop fundamental computational methodologies to make AI cognitive behaviors accountable, interpretable and therefore trustworthy.',
      bullets: [
        'How to quantify risks for AI safety/privacy in use [1,5]?',
        'How to harness compound AI/agentic systems in the wild [6]?',
        // 'Privacy attack and defense in machine learning and multi-agent networks [5].',
        // 'Constitutional AI agents in security-sensitive environments [6].',
      ],
      refs: [
        { label: '[5] LLM-PBE · VLDB 24 Best Paper Finalist', href: 'https://arxiv.org/abs/2408.12787' },
        { label: '[6] GuardAgent · ICML 25', href: 'https://arxiv.org/abs/2406.09187' },
      ],
      figure: 'shield',
    },
    {
      id: 'T3',
      title: 'AI for Cognitive Health',
      lede: 'Advance the understanding and intervention of cognitive disorders via cognitive simulation.',
      bullets: [
        'How to accelerate clinical trial development through cognitive simulation [4]?',
        'How to use science-informed AI systems to drive dementia diagnosis [7] and intervention [4]?',
        // 'How to create digital twins of dementia patients – AI-driven simulation of cognitive behaviors [4].',
      ],
      refs: [
        { label: '[4] A-CONECT · ICLRW 24', href: 'https://openreview.net/pdf?id=rACfuoNKBU' },
        { label: '[7] In-home MCI Detection · AD 20', href: 'https://alz-journals.onlinelibrary.wiley.com/doi/full/10.1002/alz.044371' },
      ],
      figure: 'pulse',
    },
  ];
