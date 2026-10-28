"""Merge final per-case Playwright evidence without hiding the initial run result."""
import json
from collections import Counter
from pathlib import Path

folder = Path('.cache/royal-garden-v3-2')
reports = ['browser-regression-results.json', 'browser-release-results.json', 'browser-results.json']
cases, runs = {}, []

def visit(suites, source):
    for suite in suites:
        for spec in suite.get('specs', []):
            for test in spec['tests']:
                result = test['results'][-1]
                key = (spec['file'], spec['title'], test['projectName'])
                cases[key] = { 'file': spec['file'], 'title': spec['title'], 'project': test['projectName'],
                               'status': result['status'], 'durationMs': result['duration'],
                               'source': source, 'annotations': test.get('annotations', []) }
        visit(suite.get('suites', []), source)

for source in reports:
    data = json.loads((folder / source).read_text(encoding='utf-8'))
    runs.append({'source': source, 'stats': data['stats']})
    visit(data['suites'], source)
counts = dict(Counter(case['status'] for case in cases.values()))
assert set(counts) <= {'passed', 'skipped'}, counts
summary = {'note': 'Latest result per project/file/title across recorded runs; not one monolithic invocation.',
           'counts': counts, 'runs': runs, 'cases': list(cases.values())}
Path('docs/design/royal-garden-v3-2/evidence/qa-summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
print(counts)
