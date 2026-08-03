#!/usr/bin/env node
// Writes the web app SBOM in both published formats: SPDX for license compliance,
// CycloneDX for security tooling. Both come from package-lock.json, so regenerate
// them together after any dependency change.
//
// Each payload is parsed before it is written: a `> file` redirect truncates the
// target first, so a failed run would leave an empty SBOM for the build to ship.

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const OUT_DIR = join(ROOT, 'src', 'assets');
const FORMATS = ['spdx', 'cyclonedx'];

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

for (const format of FORMATS) {
  const target = join(OUT_DIR, `sbom.${format}.json`);

  // Non-zero exit throws and fails the npm script; stderr is inherited so the npm
  // diagnostic is not swallowed by the pipe.
  const payload = execFileSync(npm, ['sbom', '--sbom-format', format, '--omit', 'dev'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  JSON.parse(payload);
  writeFileSync(target, payload);
  console.log(`${format}: ${relative(ROOT, target)}`);
}
