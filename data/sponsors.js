// Sponsors — logo row in the home page PI intro section.
// Entry shape:
//   { name, url, image, height }
//   name:   short label (used as alt text / aria-label, e.g. 'NSF')
//   url:    sponsor homepage (opens in new tab)
//   image:  path relative to site root (e.g. 'site/nsf-logo.png');
//           logos should have a transparent background
//   height: rendered height in px; tune per-logo so differently
//           proportioned marks read as visually balanced
window.SPONSORS = [
  { name: 'NSF',    url: 'https://www.nsf.gov/', image: 'site/nsf-logo.png',    height: 56 },
  { name: 'OpenAI', url: 'https://openai.com/',  image: 'site/openai-logo.png', height: 40 },
];
