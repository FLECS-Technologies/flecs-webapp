#!/usr/bin/env node
// Guards the CSP <-> inline-script coupling. The nginx `script-src` directive
// whitelists the synchronous theme-init <script> in index.html by its sha256
// hash. If that script changes but the hash isn't regenerated, the browser
// silently blocks the script: the theme flashes (FOUC) and a CSP violation is
// logged — with nothing failing the build. This check fails fast on drift.
//
// To fix a reported mismatch, copy the "expected" hash printed below into the
// `script-src` of every nginx conf listed.

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const INDEX = join(ROOT, 'index.html');
const CONFS = ['docker/fs/etc/nginx/conf.d/flecs-webapp.conf', 'whitelabel/flecs-webapp.conf'];

const sri = (body) => 'sha256-' + createHash('sha256').update(body).digest('base64');

// Every attribute-less inline <script> needs its own hash in the CSP. (Scripts
// with attributes — e.g. <script type="module" src=...> — are covered by 'self'.)
const html = readFileSync(INDEX, 'utf8');
const bodies = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);

if (bodies.length === 0) {
  console.error('check-csp-hash: no inline <script> found in index.html — did the markup change?');
  process.exit(1);
}

const expected = bodies.map(sri);
const problems = [];

for (const rel of CONFS) {
  let text;
  try {
    text = readFileSync(join(ROOT, rel), 'utf8');
  } catch {
    continue; // conf absent in this checkout — skip rather than fail
  }
  const present = new Set([...text.matchAll(/'(sha256-[A-Za-z0-9+/=]+)'/g)].map((m) => m[1]));
  const missing = expected.filter((h) => !present.has(h));
  if (missing.length) problems.push({ conf: relative(ROOT, join(ROOT, rel)), missing });
}

if (problems.length === 0) {
  console.log(`check-csp-hash: ok — CSP script-src matches index.html (${expected.join(', ')})`);
  process.exit(0);
}

console.error('check-csp-hash: inline script hash(es) missing from CSP script-src:\n');
for (const { conf, missing } of problems) {
  console.error(`  ${conf}`);
  for (const h of missing) console.error(`    add: '${h}'`);
  console.error('');
}
console.error("The theme-init script in index.html changed — update each conf's script-src hash.");
process.exit(1);
