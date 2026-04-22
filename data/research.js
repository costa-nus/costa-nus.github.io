// Research pillars — three-column cards on the home page Research section.
// Entry shape: { id, title, lede, bullets, refs, figure }
//   figure: 'neurons' | 'pulse' | 'shield'   (small decorative SVG)
window.RESEARCH_PILLARS = [
    {
      id: 'T1',
      title: 'Cognitive Science of AI',
      lede: 'We aim to understand the inner workings and vulnerabilities of AI systems through the lens of cognitive psychology and neuroscience.',
      bullets: [
        'Developing general automatic frameworks of reasoning and learning, e.g., LLM-driven Auto Differentiation [1].',
        'Understanding the learning process and cognitive behaviors of AI via psychological or neuron intervention [2] [3].',
      ],
      refs: ['[1] DP-OPT · ICLR 24 Spotlight', '[2] SEAL · COLM 25', '[3] LLM Brain Rot · arXiv 25'],
      figure: 'neurons',
    },
    {
      id: 'T2',
      title: 'AI for Cognitive Health',
      lede: 'We leverage AI to advance our understanding and treatment of cognitive disorders and to simulate cognitive symptoms.',
      bullets: [
        'AI-driven dementia diagnosis and intervention for older adults [4].',
        'Digital twin of dementia patients – AI-driven simulation of cognitive behaviors [4].',
      ],
      refs: ['[4] A-CONECT · ICLRW 24'],
      figure: 'pulse',
    },
    {
      id: 'T3',
      title: 'AI Safety',
      lede: 'We are dedicated to developing fundamental computational methodologies for accountable and interpretable AI safety, including risk quantification, and mitigation.',
      bullets: [
        'Privacy attack and defense in machine learning and multi-agent networks [5].',
        'Constitutional AI agents in security-sensitive environments [6].',
      ],
      refs: ['[5] LLM-PBE · VLDB 24 Best Paper Finalist', '[6] GuardAgent · ICML 25'],
      figure: 'shield',
    },
  ];
