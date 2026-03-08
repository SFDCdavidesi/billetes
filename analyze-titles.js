const fs = require('fs');
const files = ['scraper/data/billetes_a.json', 'scraper/data/billetes_b.json', 'scraper/data/billetes_c.json'];
let all = [];
for (const f of files) {
  try {
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    all = all.concat(d.banknotes || []);
  } catch (e) { console.log('Skip', f); }
}
console.log('Total billetes:', all.length);

const FRAC_MAP = { '\u00BD': 0.5, '\u00BC': 0.25, '\u00BE': 0.75, '\u2153': 1/3, '\u2154': 2/3, '\u2155': 0.2, '\u215B': 0.125, '\u215C': 0.375, '\u215D': 0.625, '\u215E': 0.875 };
const FRAC_CHARS = Object.keys(FRAC_MAP).join('');

function parseDenomination(title, country) {
  if (!title || !country) return null;

  // Normalize: replace newlines, tabs, multiple spaces with single space
  let t = title.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();

  // Remove country from the beginning
  if (t.startsWith(country)) {
    t = t.slice(country.length);
  }

  // Trim separators (space, pipe, etc.)
  t = t.replace(/^[\s|]+/, '');
  if (!t) return null;

  // Case 1: starts with unicode fraction alone: "½ Real..."
  const fracRe = new RegExp('^([' + FRAC_CHARS + '])');
  const fm = t.match(fracRe);
  if (fm && (t.length === 1 || /[\s]/.test(t[1]))) {
    return FRAC_MAP[fm[1]];
  }

  // Case 2: starts with N/M fraction: "1/2 Real...", "1/4 Dinar..."
  const slashFrac = t.match(/^(\d+)\/(\d+)(?:\s|$)/);
  if (slashFrac) {
    return parseInt(slashFrac[1]) / parseInt(slashFrac[2]);
  }

  // Case 3: number (possible thousands dots/commas) + optional unicode frac + optional " N/M"
  // Examples: "4 ...", "1.000 ...", "2½ ...", "2 1/2 ...", "1Jiao", "300Wen"
  const numRe = new RegExp('^(\\d[\\d.,]*?)([' + FRAC_CHARS + '])?(?:\\s+(\\d+)/(\\d+))?(?:\\s|[A-Za-z]|$)');
  const m = t.match(numRe);
  if (!m) return null;

  let rawNum = m[1];
  let value;

  // thousands with dots: 1.000, 10.000, 100.000
  if (/^\d{1,3}(\.\d{3})+$/.test(rawNum)) {
    value = parseFloat(rawNum.replace(/\./g, ''));
  }
  // thousands with commas: 1,000, 10,000
  else if (/^\d{1,3}(,\d{3})+$/.test(rawNum)) {
    value = parseFloat(rawNum.replace(/,/g, ''));
  }
  // normal number
  else {
    value = parseFloat(rawNum.replace(',', '.'));
  }

  if (isNaN(value)) return null;

  // Add unicode fraction: "2½" → 2 + 0.5
  if (m[2]) value += FRAC_MAP[m[2]] || 0;

  // Add slash fraction: "2 1/2" → 2 + 0.5
  if (m[3] && m[4]) value += parseInt(m[3]) / parseInt(m[4]);

  return value;
}

let ok = 0, bad = 0;
const badExamples = [];
const results = [];

for (const b of all) {
  const denom = parseDenomination(b.title, b.country);
  if (denom !== null && denom > 0) {
    ok++;
    results.push({ title: b.title, denom });
  } else {
    bad++;
    if (badExamples.length < 30) badExamples.push({ title: b.title, country: b.country });
  }
}

console.log('Parsed OK:', ok, '| Failed:', bad);

if (badExamples.length) {
  console.log('\nFailed examples:');
  badExamples.forEach(e => console.log('  title:', JSON.stringify(e.title), '| country:', e.country));
}

console.log('\n--- Fractions ---');
results.filter(r => r.denom < 1 || r.denom % 1 !== 0).slice(0, 20).forEach(r =>
  console.log('  ', r.title, ' => ', r.denom)
);

console.log('\n--- Large numbers (1000+) ---');
results.filter(r => r.denom >= 1000).slice(0, 15).forEach(r =>
  console.log('  ', r.title, ' => ', r.denom)
);

console.log('\n--- Sample normal ---');
results.slice(0, 10).forEach(r =>
  console.log('  ', r.title, ' => ', r.denom)
);
