// Research pillars — three-column cards on the home page Research section.
// Entry shape: { id, title, lede, bullets, refs, figure }
//   figure: 'neurons' | 'pulse' | 'shield'   (small decorative SVG)
//   lede + bullets accept inline Markdown: **bold** and *italic*. Patterns
//   don't nest and don't support escapes (see mdInline in site/_shared.jsx).
//   Note: lede renders in editorial italic, so *italic* inside it is a no-op
//   visually — use **bold** for emphasis there.
window.RESEARCH_PILLARS = [
    {
      id: 'T1',
      title: 'Cognitive Science of AI',
      // lede: 'We aim to understand the inner workings and vulnerabilities of AI systems through the lens of cognitive psychology and neuroscience.',
      lede: 'Understand the inner mechanisms of AI systems through the lens of cognitive psychology and neuroscience.',
      bullets: [
        'Does AI *internally* share the same mechanistc vulnerabilities as humans, e.g., brain rot [3], emotion biases?',
        'Can we steer AI behaviors via intervening cognitive mechanisms internally (by neurons [2]) or externally (by prompts [1])?',
        // 'How to steer AI behaviors internally (by neurons [2]) or externally (by prompts [1])?',
        // 'Developing general automatic frameworks of reasoning and learning, e.g., LLM-driven Auto Differentiation [1].',
        // 'Understanding the learning process and cognitive behaviors of AI via psychological or neuron intervention [2] [3].',
      ],
      refs: ['[1] DP-OPT · ICLR 24 Spotlight', '[2] SEAL · COLM 25', '[3] LLM Brain Rot · arXiv 25'],
      figure: 'neurons',
    },
    {
      id: 'T2',
      title: 'Trustworthy AI',
      lede: 'Develop fundamental computational methodologies to make AI cognitive behaviors accountable, interpretable and therefore trustworthy.',
      bullets: [
        'Risk quantification and mitigation for AI security/privacy [1,5].',
        'Harnessing compound AI/agentic systems in the wild [6].',
        // 'Privacy attack and defense in machine learning and multi-agent networks [5].',
        // 'Constitutional AI agents in security-sensitive environments [6].',
      ],
      refs: ['[5] LLM-PBE · VLDB 24 Best Paper Finalist', '[6] GuardAgent · ICML 25'],
      figure: 'shield',
  },
  {
    id: 'T3',
    title: 'AI for Cognitive Health',
    lede: 'Advance the understanding and treatment of cognitive disorders via cognitive simulation.',
    bullets: [
      'Cognitive digital twins for informing clinical trial development [4].',
      'AI-driven dementia diagnosis and intervention for older adults [4].',
      // 'Digital twin of dementia patients – AI-driven simulation of cognitive behaviors [4].',
    ],
    refs: ['[4] A-CONECT · ICLRW 24'],
    figure: 'pulse',
  },
  ];
