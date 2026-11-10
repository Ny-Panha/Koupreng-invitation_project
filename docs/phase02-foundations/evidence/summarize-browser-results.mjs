import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('./', import.meta.url));
const files = ['foundation-results.json', 'regression-results.json', 'final-verification-results.json'];
const reports = {}, samples = new Map();
const luminance = color => {
  const rgb = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
};
for (const file of files) {
  if (!fs.existsSync(directory + file)) continue;
  const data = JSON.parse(fs.readFileSync(directory + file, 'utf8'));
  const counts = { passed: 0, failed: 0, skipped: 0, other: 0, projects: {}, specifications: {} };
  const walk = suites => suites.forEach(suite => {
    for (const spec of suite.specs || []) for (const test of spec.tests || []) {
      const result = test.results.at(-1), status = result?.status || 'other';
      counts[['passed', 'failed', 'skipped'].includes(status) ? status : 'other']++;
      const project = counts.projects[test.projectName] ||= { passed: 0, failed: 0, skipped: 0, other: 0 };
      project[status in project ? status : 'other']++;
      const file = spec.file.split(/[\\/]/).at(-1);
      const specification = counts.specifications[file] ||= { passed: 0, failed: 0, skipped: 0, other: 0 };
      specification[status in specification ? status : 'other']++;
      for (const attachment of result?.attachments || []) {
        if (attachment.name !== 'contrast-computed-styles' || !attachment.body) continue;
        for (const sample of JSON.parse(Buffer.from(attachment.body, 'base64').toString())) {
          const key = [sample.selector, sample.foreground, sample.background].join('|');
          const opaqueRgb = /^rgb\(/.test(sample.foreground) && /^rgb\(/.test(sample.background);
          const a = opaqueRgb ? luminance(sample.foreground) : 0, b = opaqueRgb ? luminance(sample.background) : 0;
          samples.set(key, { selector: sample.selector, foreground: sample.foreground, background: sample.background,
            ratio: opaqueRgb ? Number(((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2)) : null,
            evidence: opaqueRgb ? 'Opaque computed RGB pair plus passing rendered axe check' : 'Passing rendered axe check; advanced/alpha color surface is not reduced to an uncomposited RGB ratio' });
        }
      }
    }
    walk(suite.suites || []);
  });
  walk(data.suites);
  reports[file] = { ...counts, durationMs: data.stats.duration, reportErrors: data.errors || [] };
}
const renderedContrast = [...samples.values()];
const result = { reports, renderedContrast };
fs.writeFileSync(directory + 'verification-summary.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (Object.values(reports).some(row => row.failed || row.other || row.skipped || row.reportErrors.length) || renderedContrast.some(row => row.ratio !== null && row.ratio < 4.5)) process.exitCode = 1;
