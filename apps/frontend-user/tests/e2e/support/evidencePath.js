import { test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

// Keep each test/project's evidence in Playwright's own artifact directory.
export function evidencePath(filename) {
  const destination = test.info().outputPath(filename);
  mkdirSync(path.dirname(destination), { recursive: true });
  return destination;
}
