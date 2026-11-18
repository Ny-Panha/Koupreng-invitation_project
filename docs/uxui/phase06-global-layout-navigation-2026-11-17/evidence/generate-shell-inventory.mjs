// Route factories must first be exported using BATCH11_UPDATE_ROUTES=1 route tests.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '../../../..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8').replace(/^\uFEFF/, ''));
const write = (name, value) => fs.writeFileSync(path.join(import.meta.dirname, name), JSON.stringify(value, null, 2) + '\n');
const git = args => execFileSync('git', args, { cwd: root }).toString().trim();
const prior = read('docs/uxui/phase05-motion-interaction-platform-2026-11-11/evidence/route-adoption.json');
const contracts = read('docs/qa/batch12/route-matrix.json').routes;
const graph = read(path.relative(root, path.join(import.meta.dirname, 'module-graph.json')));
const factory = ['user', 'admin'].flatMap(app => read(`.cache/batch11/${app}-routes.json`).map(row => ({ ...row, app: `frontend-${app}` })));
const expanded = ['user','admin'].flatMap(app => read(`.cache/phase06/${app}-shells.json`));
if (factory.length !== contracts.length) throw new Error('Route denominator drift; reconcile ownership');
const shellFiles = {
  MarketingShell: 'apps/frontend-user/src/layouts/MarketingShell.jsx', AuthShell: 'apps/frontend-user/src/layouts/AuthShell.jsx',
  HostShell: 'apps/frontend-user/src/layouts/HostShell.jsx', EventWorkspace: 'apps/frontend-user/src/features/events/workspace/EventWorkspace.jsx',
  AdminLayout: 'apps/frontend-admin/src/layouts/AdminLayout.jsx', AdminStudio: 'apps/frontend-admin/src/features/templates/AdminTemplateEditFeature.jsx',
};
function closure(start) {
  const seen = new Set(), pending = [start];
  while (pending.length) { const id = pending.pop(); if (seen.has(id) || !graph[id]) continue; seen.add(id); pending.push(...graph[id].imports.map(i => i.target)); }
  return [...seen];
}
const routes = factory.map(row => {
  const contract = contracts.find(c => c.application === row.app && c.pattern === row.pattern);
  const historical = prior.find(c => c.app === row.app && c.pattern === row.pattern);
  if (!contract || !historical) throw new Error(`Unassigned route ${row.app} ${row.pattern}`);
  const group = contract.group, p = row.pattern;
  const binding = expanded.find(r => r.app === row.app && r.pattern === p);
  if(!binding) throw new Error(`Missing expanded shell binding ${p}`);
  const resolved = descriptor => {
    const module = descriptor.module?.split('?')[0];
    if(module?.startsWith('/src/')) return [`apps/${row.app}${module}`];
    if(module?.startsWith('/@fs/')) return [path.relative(root,module.slice(5)).replaceAll('\\','/')];
    if(['Navigate','RequireAuth','RequireAdmin','AccountRedirect','InvitationScopedRedirect','LegacyBuilder','LegacyEditor'].includes(descriptor.name)) return [];
    const exact = Object.keys(graph).filter(file => file.startsWith(`apps/${row.app}/`) && path.basename(file).replace(/\.[^.]+$/,'')===descriptor.name);
    return exact;
  };
  const leafModules = binding.components.flatMap(resolved).filter(file=>graph[file]);
  const inheritedModules = binding.shells.flatMap(resolved).filter(file=>graph[file]);
  const routeModules = [...new Set([...leafModules,...inheritedModules].flatMap(closure))];
  let shells;
  if (row.app === 'frontend-admin') shells = group.startsWith('admin-template-') ? ['AdminStudio'] : group === 'auth-login' ? ['AdminAuth'] : p === '*' ? ['AdminSystem'] : ['AdminLayout'];
  else if (group.startsWith('auth-')) shells = ['AuthShell'];
  else if (['home','catalog','pricing','contact','venues','venue-detail','checkout'].includes(group)) shells = ['MarketingShell'];
  else if (['template-demo','public-invitation','local-preview'].includes(group) || /\/preview$/.test(p)) shells = ['GuestRenderer'];
  else if (p === '*' || p.startsWith('/payments/')) shells = ['UserSystem'];
  else if (/^\/(create\/wedding\/|event\/.*\/manage)/.test(p)) shells = ['StandaloneEditorOrScopedRedirect'];
  else shells = p.startsWith('/app/events/:eventId') ? ['HostShell','EventWorkspace'] : ['HostShell'];
  const executedShells = binding.shells.map(s=>s.name).filter(name=>Object.hasOwn(shellFiles,name));
  if(executedShells.length) shells = executedShells;
  else if(row.redirect) shells = ['RedirectOnly'];
  if(/\/preview$/.test(p)&&executedShells.includes('HostShell')) shells.push('GuestRenderer');
  const alias = Boolean(row.redirect) || historical.aliasOrRedirect;
  return { routeId: historical.routeId, app: row.app, pattern: p, group, component: row.component,
    aliasOrRedirect: alias, staticRedirect: row.redirect, conditionalAliasEvidence: historical.sourceOwnerOrAlias,
    shell: shells, shellSources: shells.map(s => shellFiles[s]).filter(Boolean), access: row.access,
    shellVariant: /\/preview$/.test(p)&&executedShells.includes('HostShell') ? 'HostShell preview branch omits HostNav; EventWorkspace remains where declared; inner invitation keeps renderer ownership' : p.endsWith('/invitation')&&executedShells.includes('EventWorkspace') ? 'Focused Studio branch depends on authorized event type/template' : 'Declared shell; redirect destinations listed separately',
    routeKind: row.redirect ? 'STATIC REDIRECT' : /Redirect|LegacyBuilder|LegacyEditor/.test(row.component) ? 'CONDITIONAL ALIAS / legacy editor where nonnumeric' : 'SCREEN',
    executedShellChain: binding.shells, executedLeafBindings: binding.components,
    leafModules, inheritedModules, dependencyClosure: routeModules,
    primitiveSources: read('docs/uxui/phase04-reusable-component-system-2026-11-11/evidence/component-register.json').map(r=>r.source).filter(file=>routeModules.includes(file)),
    bindingConfidence: leafModules.length ? 'LAZY IMPORT / exact source basename resolved; includes potential conditional imports, not runtime state proof' : 'Redirect/local wrapper; exact source behavior documented separately; no invented feature import',
    authority: row.access === 'public' ? 'public route; guest token/catalog/payment status rules remain feature owned' : 'existing RequireAuth/RequireAdmin plus server authorization and event permissions',
    primaryPhase: historical.phaseOwner, concreteUrl: contract.concreteUrl,
    navigation: shells.includes('EventWorkspace') ? 'My Events > authorized event > exact task' : shells.includes('AdminLayout') ? 'Workspace > current admin destination' : shells.join(' > '),
    relevantStates: ['loading','empty','error','denied','expired','offline','dirty (where editable)'],
    responsive: ['phone','tablet','desktop','short landscape','reflow'], preferences: ['km','en','light','dark','reduced motion','keyboard'],
    verification: 'SOURCE-MAPPED', behaviorCoverage: 'See responsive-focus-results.json and explicit browser tests; no all-state certification',
    disposition: alias ? 'PRESERVE ALIAS; destination shell inherits foundation' : shells.some(s => shellFiles[s]) ? 'Phase 06 shared shell foundation; domain states retain primary phase owner' : 'PRESERVE separate guest/system/standalone boundary',
    carryover: shells.includes('GuestRenderer') ? ['P03-renderer-parity','P05-renderer-visibility'] : ['P01-route-inventory','P03-theme','P04-consumers','P05-navigation'],
  };
});
const components = read('docs/uxui/phase04-reusable-component-system-2026-11-11/evidence/component-register.json').map(row => ({
  source: row.source, family: row.family, directConsumers: graph[row.source]?.directConsumers || [],
  transitiveShells: Object.entries(shellFiles).filter(([, file]) => closure(file).includes(row.source)).map(([name]) => name),
  confidence: 'AST RESOLVED imports including literal dynamic imports; reachability is not behavioral adoption',
  stateCoverage: 'Only named real-route tests verify state; specialized states remain with domain owner',
  routeConsumers: routes.filter(route=>route.primitiveSources.includes(row.source)).map(route=>route.routeId),
}));
const shells = Object.entries(shellFiles).map(([name, source]) => ({ name, source,
  routes: routes.filter(row => row.shell.includes(name)).map(row => row.routeId), imports: graph[source]?.imports || [],
  directConsumers: graph[source]?.directConsumers || [], dependencyClosure: closure(source), verification: 'SOURCE-MAPPED',
}));
const sourcePatch = execFileSync('git', ['diff', '--binary', '--', 'apps/frontend-user/src', 'apps/frontend-admin/src'], { cwd: root });
const metadata = read(path.relative(root, path.join(import.meta.dirname, 'validation-metadata.json')));
const selectedComponentAPIs = components.filter(row=>/\/(?:Modal|LoadingButton|ResponsiveTable|FormField|SearchInput|AdminUI|Toast)\.jsx$/.test(row.source)).map(row=>({source:row.source,signatures:[...fs.readFileSync(path.join(root,row.source),'utf8').matchAll(/export (?:default )?function\s+\w+\s*\([\s\S]*?\)\s*\{/g)].map(match=>match[0].slice(0,1600))}));
write('source-snapshot.json', { ...metadata, observedAt: new Date().toISOString(), branch: git(['branch','--show-current']), startSha: '4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4', currentSha: git(['rev-parse','HEAD']), remoteSha: git(['rev-parse','origin/main']), dirty: git(['status','--short']).split('\n'), appPatchSha256: crypto.createHash('sha256').update(sourcePatch).digest('hex'), node: process.version,
  selectedComponentAPIs,
  installedVersions: Object.fromEntries(['react','vite','vitest','@playwright/test','@axe-core/playwright'].map(name=>[name,read(`apps/frontend-user/node_modules/${name}/package.json`).version])),
  baseline: { routes: 135, groups: 62, aliases: 38, dedicatedFamilies: 10 }, routeDrift: [], unassignedRoutes: 0,
  routes: routes.length, groups: new Set(routes.map(r => r.group)).size, appGroupPairs: new Set(routes.map(r => `${r.app}/${r.group}`)).size,
  migrationSqlFiles: execFileSync('git', ['ls-files', 'apps/backend/src/main/resources/db/migration/*.sql'], { cwd: root }).toString().trim().split('\n').length,
  instructions: { primary: 'koupreng-premium-ux', supporting: ['koupreng-qa-release','playwright'], push: 'NOT AUTHORIZED', deployment: 'NOT AUTHORIZED' },
});
write('route-shell-adoption.json', routes);
write('shell-consumer-graph.json', { shells, components, method: '@babel/parser module closure + executed expanded React route factories; shell assignment reconciled against current parent route source; no browser inference' });
fs.writeFileSync(path.join(import.meta.dirname, 'route-shell-adoption.md'), '# Current route-to-shell ownership\n\nSource mapping only; aliases are not separate verified workflows.\n\n| ID | App | Route | Group | Shell | Alias | Domain phase |\n|---|---|---|---|---|---|---|\n' + routes.map(r => `| ${r.routeId} | ${r.app} | \`${r.pattern}\` | ${r.group} | ${r.shell.join(', ')} | ${r.aliasOrRedirect} | ${r.primaryPhase} |`).join('\n') + '\n');
console.log(JSON.stringify({ routes: routes.length, groups: new Set(routes.map(r => r.group)).size, shells: shells.map(s => ({ name: s.name, leaves: s.routes.length })), componentEntries: components.length, unassigned: 0 }));
