const fs = require('fs');
const path = require('path');

const openapiPath = path.resolve(__dirname, '../packages/api-contracts/openapi.yaml');
const outputPath = path.resolve(__dirname, '../apps/frontend-admin/src/features/api-monitor/openapiContractManifest.json');

const yaml = fs.readFileSync(openapiPath, 'utf8');
const lines = yaml.split('\n');

let currentPath = null;
let currentMethod = null;
let currentTag = '';
let currentSummary = '';
const endpoints = [];

function commitCurrent() {
  if (currentPath && currentMethod) {
    endpoints.push({
      path: currentPath,
      method: currentMethod,
      tag: currentTag || 'General',
      summary: currentSummary || '',
      isLegacy: !currentPath.startsWith('/api/v1')
    });
  }
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const pathMatch = line.match(/^  (\/[^:]+):/);
  if (pathMatch) {
    commitCurrent();
    currentPath = pathMatch[1];
    currentMethod = null;
    currentTag = '';
    currentSummary = '';
    continue;
  }
  if (currentPath) {
    const mMatch = line.match(/^    (get|post|put|patch|delete|options):/i);
    if (mMatch) {
      commitCurrent();
      currentMethod = mMatch[1].toUpperCase();
      currentTag = '';
      currentSummary = '';
      continue;
    }
    if (currentMethod) {
      const tagMatch = line.match(/^      - ([A-Za-z0-9 _-]+)/);
      if (tagMatch && !currentTag) {
        currentTag = tagMatch[1];
      }
      const sumMatch = line.match(/^      summary: (.*)/);
      if (sumMatch && !currentSummary) {
        currentSummary = sumMatch[1].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
}
commitCurrent();

fs.writeFileSync(outputPath, JSON.stringify(endpoints, null, 2));
console.log('Successfully generated ' + endpoints.length + ' endpoints to ' + outputPath);

