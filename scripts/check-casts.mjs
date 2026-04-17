#!/usr/bin/env node
// Guards against type-safety escape hatches that defeat generated types.
// Bans: `as unknown as X`, `as any`, `: any`. Exits 1 on any match.
//
// Why: `src/features/apps/components/installation/AppInstaller.tsx` once shipped
// a broken sideload call because `as unknown as Parameters<...>` hid a payload
// mismatch from the compiler. This check prevents that regression class.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const SRC = join(ROOT, 'src');

const PATTERNS = [
  { re: /\bas\s+unknown\s+as\b/, label: 'as unknown as' },
  { re: /\bas\s+any\b/, label: 'as any' },
  { re: /:\s*any\b(?!\s*\/\/)/, label: ': any' },
];

const EXT = new Set(['.ts', '.tsx']);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (EXT.has(p.slice(p.lastIndexOf('.')))) yield p;
  }
}

const violations = [];

for (const file of walk(SRC)) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.includes('eslint-disable') || line.includes('check-casts-disable')) return;
    const trimmed = line.trim();
    // Skip comment lines — we only ban the pattern in code
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    for (const { re, label } of PATTERNS) {
      if (re.test(line)) {
        violations.push({ file: relative(ROOT, file), line: i + 1, label, text: trimmed });
      }
    }
  });
}

if (violations.length === 0) {
  console.log('check-casts: ok — no forbidden type assertions found');
  process.exit(0);
}

console.error(`check-casts: found ${violations.length} forbidden type assertion(s):\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  [${v.label}]`);
  console.error(`    ${v.text}\n`);
}
console.error('Fix by using generated types (orval), runtime guards (zod/instanceof), or correcting the data flow.');
console.error('If truly unavoidable, annotate the line with `// check-casts-disable` and explain why.');
process.exit(1);
