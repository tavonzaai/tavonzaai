#!/usr/bin/env node
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Cross-platform test discovery for Node.js 20+ built-in test runner with tsx.
 * Node 20 CLI does not expand recursive glob patterns ('src/**\/*.spec.ts').
 * This script discovers all *.spec.ts files across src/ and passes them to node --test.
 */
function findSpecFiles(dir) {
  let results = [];
  try {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(findSpecFiles(fullPath));
      } else if (entry.endsWith('.spec.ts')) {
        results.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
  }
  return results;
}

const files = findSpecFiles('src');

if (files.length === 0) {
  console.log('No test files found under src/.');
  process.exit(0);
}

const result = spawnSync(process.execPath, ['--test', '--import', 'tsx', ...files], {
  stdio: 'inherit',
});

process.exit(result.status ?? 0);
