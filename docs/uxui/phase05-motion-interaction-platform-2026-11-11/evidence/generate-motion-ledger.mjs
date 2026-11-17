// Run at repository root: node docs/uxui/phase05-motion-interaction-platform-2026-11-11/evidence/generate-motion-ledger.mjs
// AST-resolved module graph plus source-owner motion scan. No runtime state is inferred.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../../../..');
const output = import.meta.dirname;
const require = createRequire(path.join(root, 'apps/frontend-user/package.json'));
const { parse } = require('@babel/parser');
const relative = file => path.relative(root, file).replaceAll('\\', '/');
const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '.mjs', '.css'];
const indexFiles = ['index.js', 'index.jsx', 'index.ts', 'index.tsx'];
const apps = ['frontend-user', 'frontend-admin'];
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(?:jsx?|tsx?|mjs|css)$/.test(entry.name) && !/\.(?:test|spec)\./.test(entry.name) && entry.name !== 'application-tokens.css') files.push(file);
  }
}
for (const app of apps) walk(path.join(root, 'apps', app, 'src'));
const fileSet = new Set(files);
const motion = [
  ['framer', /(?:from\s*['"]framer-motion['"]|require\(['"]framer-motion['"]\))/],
  ['css-transition', /\btransition(?:-\w+)?\s*:/],
  ['css-animation', /\b(?:animation(?:-\w+)?\s*:|@keyframes)\b/],
  ['observer', /\bIntersectionObserver\b|\buseInView\b/],
  ['timer', /\bset(?:Timeout|Interval)\s*\(/],
  ['frame', /\brequestAnimationFrame\s*\(/],
  ['media', /\b(?:\.play\s*\(|<video\b|<audio\b)/],
  ['scroll', /\b(?:scrollIntoView|addEventListener\(['"]scroll|scrollTo\s*\()/],
  ['drag-resize', /\b(?:onPointerMove|onDrag|DndContext|resize-handle)\b/],
  ['canvas-3d', /\b(?:<canvas\b|WebGL|THREE\.|perspective\s*:|rotate[XY]\()/],
];
function resolve(from, spec) {
  if (!spec.startsWith('.') && !spec.startsWith('@/')) return { external: spec };
  const src = path.join(root, 'apps', relative(from).split('/')[1], 'src');
  const base = spec.startsWith('@/') ? path.join(src, spec.slice(2)) : path.resolve(path.dirname(from), spec);
  for (const extension of extensions) {
    const candidate = path.normalize(base + extension);
    if (fileSet.has(candidate)) return { file: relative(candidate) };
  }
  for (const name of indexFiles) {
    const candidate = path.join(base, name);
    if (fileSet.has(candidate)) return { file: relative(candidate) };
  }
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return { asset: relative(base) };
  return { unresolved: spec };
}
const nodes = {};
const unresolved = [];
for (const file of files) {
  const id = relative(file), source = fs.readFileSync(file, 'utf8');
  const imports = [], external = [], assets = [];
  if (!file.endsWith('.css')) {
    let ast;
    try { ast = parse(source, { sourceType: 'unambiguous', plugins: ['jsx', 'typescript', 'importAttributes'] }); }
    catch (error) { unresolved.push({ source: id, reason: `parse: ${error.message}` }); continue; }
    function add(spec, kind) {
      if (typeof spec !== 'string') { unresolved.push({ source: id, kind, reason: 'dynamic expression' }); return; }
      const result = resolve(file, spec);
      if (result.file) imports.push({ target: result.file, kind });
      else if (result.external) external.push(result.external);
      else if (result.asset) assets.push(result.asset);
      else unresolved.push({ source: id, kind, spec, reason: 'unresolved local import' });
    }
    function visit(value) {
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value)) { value.forEach(visit); return; }
      if (value.type === 'ImportDeclaration' || value.type === 'ExportNamedDeclaration' || value.type === 'ExportAllDeclaration') {
        if (value.source) add(value.source.value, value.type);
      } else if (value.type === 'ImportExpression') add(value.source?.value, 'dynamic import');
      else if (value.type === 'CallExpression' && value.callee?.type === 'Import') add(value.arguments?.[0]?.value, 'dynamic import');
      for (const [key, child] of Object.entries(value)) if (key !== 'loc' && key !== 'tokens' && key !== 'comments') visit(child);
    }
    visit(ast.program);
  } else {
    for (const match of source.matchAll(/@import\s+['"]([^'"]+)['"]/g)) {
      const result = resolve(file, match[1]);
      if (result.file) imports.push({ target: result.file, kind: 'CSS import' });
    }
  }
  const kinds = motion.filter(([, regex]) => regex.test(source)).map(([kind]) => kind);
  nodes[id] = { imports, external: [...new Set(external)], assets: [...new Set(assets)], motionKinds: kinds };
}
const consumers = {};
for (const [id, node] of Object.entries(nodes)) for (const { target } of node.imports) (consumers[target] ||= []).push(id);
const entries = {
  userApp: 'apps/frontend-user/src/app/App.jsx',
  adminApp: 'apps/frontend-admin/src/app/App.jsx',
  rendererRegistry: 'apps/frontend-user/src/features/templates/registry/templateRegistry.js',
};
const reachable = {};
for (const [label, entry] of Object.entries(entries)) {
  const seen = new Set(), pending = [entry];
  while (pending.length) {
    const id = pending.pop();
    if (seen.has(id) || !nodes[id]) continue;
    seen.add(id);
    pending.push(...nodes[id].imports.map(item => item.target));
  }
  reachable[label] = seen;
}
const owners = Object.entries(nodes).filter(([, node]) => node.motionKinds.length).map(([source, node], index) => {
  const body = fs.readFileSync(path.join(root, source), 'utf8');
  const declarations = body.split(/\r?\n/).map((line, i) => ({ line: i + 1, excerpt: line.trim().slice(0, 180) }))
    .filter(item => /\b(?:transition|animation|IntersectionObserver|requestAnimationFrame|setTimeout|scrollIntoView|useInView|onDrag|onPointerMove)\b|@keyframes|<motion\./.test(item.excerpt)).slice(0, 15);
  const timings = [...new Set(body.match(/(?:--ui-duration-[\w-]+|\b\d+(?:\.\d+)?(?:ms|s)\b|duration\s*:\s*\d+(?:\.\d+)?)/g) || [])].slice(0, 15);
  const easing = [...new Set(body.match(/(?:cubic-bezier\([^)]*\)|--ui-ease-[\w-]+|\bease(?:-in|-out|-in-out)?\b|\blinear\b)/g) || [])].slice(0, 10);
  const cleanup = ['clearTimeout', 'clearInterval', 'cancelAnimationFrame', '.disconnect(', '.unobserve(', 'removeEventListener'].filter(token => body.includes(token));
  const a11y = ['prefers-reduced-motion', 'usePrefersReducedMotion', 'aria-', 'focus-visible', '.focus('].filter(token => body.includes(token));
  return {
  id: `MOTION-${String(index + 1).padStart(3, '0')}`,
  source,
  app: source.split('/')[1],
  sourceFeature: source.split('/').slice(3, 6).join('/'),
  implementation: node.motionKinds,
  purpose: source.includes('/features/templates/') ? 'ceremonial guest art or media; verify per layout' :
    source.includes('/shared/ui/') ? 'shared feedback or content hierarchy' :
    source.includes('frontend-admin') ? 'operational chrome; require restraint' : 'feature-specific hierarchy or feedback',
  triggerEvidence: declarations,
  durationExpressions: timings,
  easingExpressions: easing,
  interruptionCleanupSignals: cleanup,
  inputAccessibilitySignals: a11y,
  risk: 'SOURCE REVIEW REQUIRED for task blocking, layout shift, focus, media consent, and low-end frames',
  directConsumers: consumers[source] || [],
  transitiveEntries: Object.entries(reachable).filter(([, seen]) => seen.has(source)).map(([label]) => label),
  routeConsumer: 'UNKNOWN unless directly verified; route JSX bindings are not resolved to feature groups',
  decision: source.includes('/shared/animations/SiteAnimations') ? 'REFINE' : source.includes('/shared/ui/AnimatedNumber') ? 'REFINE' : source.includes('/features/templates/') ? 'KEEP / family review Phase 10 and 16' : 'DEFER to route owner; shared policy applies',
  evidence: 'source scan and AST import graph only; no browser behavior implied',
  };
});
const previous = JSON.parse(fs.readFileSync(path.join(root, 'docs/uxui/phase04-reusable-component-system-2026-11-11/evidence/route-adoption.json'), 'utf8'));
const registryFile = path.join(root, 'apps/frontend-user/src/features/templates/registry/templateRegistry.js');
const registryAst = parse(fs.readFileSync(registryFile, 'utf8'), { sourceType: 'module' });
const registryDeclaration = registryAst.program.body.flatMap(statement => statement.declaration?.declarations || [])
  .find(declaration => declaration.id?.name === 'templateRegistry');
if (!registryDeclaration || registryDeclaration.init.type !== 'ObjectExpression') throw new Error('Template registry shape changed');
const rendererAliases = registryDeclaration.init.properties.map(property => ({
  key: property.key.value ?? property.key.name,
  family: property.value.name,
}));
const current = JSON.parse(fs.readFileSync(path.join(root, 'docs/qa/batch12/route-matrix.json'), 'utf8')).routes;
if (previous.length !== current.length || previous.some((row, i) => row.app !== current[i].application || row.pattern !== current[i].pattern)) {
  throw new Error('Current route contracts diverge from Phase 04 ownership; reconcile manually');
}
const routes = current.map((row, i) => {
  const prior = previous[i];
  const group = row.group;
  let policy = 'functional feedback only; no ambient motion';
  if (row.application === 'frontend-admin') policy = group === 'admin-template-edit' ? 'spatial Studio controls; no save animation authority' : 'static operational data and tokenized feedback';
  else if (/template-demo|public-invitation/.test(group)) policy = 'renderer-owned ceremony; immediate Skip and reduced-motion static path';
  else if (/^venues$|^venue-detail$/.test(group)) policy = 'venue-owned ScrollReveal; no global route curtain';
  else if (/home|catalog|contact|pricing/.test(group)) policy = 'page-owned editorial enhancement; essential content always visible';
  else if (/auth/.test(group)) policy = 'immediate validation feedback; no route curtain';
  else if (/payment|checkout|gift|budget|report|rsvp/.test(group)) policy = 'static authoritative state; feedback only';
  return {
    routeId: prior.routeId, app: row.application, pattern: row.pattern, group,
    aliasOrRedirect: /alias|redirect/i.test(prior.sourceOwnerOrAlias),
    phaseOwner: prior.primaryPhase, sourceOwnerOrAlias: prior.sourceOwnerOrAlias,
    motionPolicy: policy, phase05Adoption: group === 'template-demo' ? 'shared fallback gate only; dedicated family review pending' :
      group === 'admin-dashboard' || group === 'admin-templates' || group === 'admin-packages' ? 'static shared AdminUI metric/card policy' :
      /^venues$|^venue-detail$/.test(group) ? 'existing venue motion retained; global route layer removed' :
      /auth|payment|checkout/.test(group) ? 'nonblocking route policy' : 'policy documented; route-specific adoption deferred',
    functionalBrowserCoverage: 'NOT TESTED unless named in Phase 05 browser matrix',
  };
});
const graph = Object.fromEntries(Object.entries(nodes).map(([source, node]) => [source, {
  imports: node.imports, external: node.external, assets: node.assets,
  directConsumers: consumers[source] || [],
  transitiveEntries: Object.entries(reachable).filter(([, seen]) => seen.has(source)).map(([label]) => label),
}]));
const metadata = {
  sourceSha: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root }).toString().trim(),
  generatedAt: new Date().toISOString(),
  parsing: '@babel/parser JSX/TS, relative and @/ resolution, CSS @import; unresolved dynamic expressions recorded',
  scannedFiles: files.length, parsedFiles: Object.keys(nodes).length, motionOwnerFiles: owners.length,
  currentRouteContracts: routes.length, groups: new Set(routes.map(row => row.group)).size,
  byApp: Object.fromEntries(apps.map(app => [app, routes.filter(row => row.app === app).length])),
  unresolvedImports: unresolved.length,
  rendererFamilies: new Set(rendererAliases.map(row => row.family)).size,
  rendererAliases: rendererAliases.length,
  sharedRendererIds: ['event-essential', 'koupreng-demo-wedding'],
  fallback: 'DefaultTemplateLayout',
};
for (const [name, value] of Object.entries({ 'module-graph.json': graph, 'motion-owners.json': owners, 'route-adoption.json': routes, 'renderer-registry.json': rendererAliases, 'unresolved-imports.json': unresolved, 'validation-metadata.json': metadata })) {
  fs.writeFileSync(path.join(output, name), JSON.stringify(value, null, 2) + '\n');
}
console.log(JSON.stringify(metadata));
