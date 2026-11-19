"""Verify or restore Phase 11's historical evidence without overwriting later work."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / 'docs/uxui/phase11-codex-evidence-2026-11-19'
PREFIX = 'output/playwright/phase11-codex-2026-11-19/'


def digest(data):
    return hashlib.sha256(data).hexdigest()


def destination(name):
    parts = PurePosixPath(name)
    if not name.startswith(PREFIX) or '\\' in name or '..' in parts.parts or parts.is_absolute():
        raise ValueError('Unexpected archive path: ' + name)
    path = ROOT.joinpath(*parts.parts)
    if not path.resolve().is_relative_to((ROOT / PREFIX).resolve()):
        raise ValueError('Archive path escapes evidence directory: ' + name)
    for parent in [path, *path.parents]:
        if parent == ROOT:
            break
        if parent.is_symlink() or (hasattr(parent, 'is_junction') and parent.is_junction()):
            raise ValueError('Restore path contains a link: ' + str(parent))
    return path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['verify', 'restore'], nargs='?', default='verify')
    args = parser.parse_args()
    manifest = json.loads((PACKAGE / 'manifest.json').read_text(encoding='utf-8'))
    archive = PACKAGE / 'evidence.zip'
    if digest(archive.read_bytes()) != manifest['archiveSha256']:
        raise ValueError('Archive checksum mismatch')
    records = manifest['files']
    names = [row['path'] for row in records]
    if len(names) != len(set(names)):
        raise ValueError('Duplicate manifest paths')
    restored = 0
    with zipfile.ZipFile(archive) as bundle:
        if sorted(bundle.namelist()) != sorted(names):
            raise ValueError('Archive and manifest file lists differ')
        # Verify every member and every existing destination before any restoration.
        for row in records:
            data = bundle.read(row['path'])
            if len(data) != row['bytes'] or digest(data) != row['sha256']:
                raise ValueError('Member checksum mismatch: ' + row['path'])
            path = destination(row['path'])
            if args.action == 'restore' and path.exists() and digest(path.read_bytes()) != row['sha256']:
                raise ValueError('Existing evidence differs; nothing overwritten: ' + row['path'])
        if args.action == 'restore':
            for row in records:
                path = destination(row['path'])
                if path.exists():
                    continue
                path.parent.mkdir(parents=True, exist_ok=True)
                # Exclusive create also protects against a concurrent writer.
                with path.open('xb') as stream:
                    stream.write(bundle.read(row['path']))
                restored += 1
    print(json.dumps({'passed': True, 'historicalArchiveOnly': True,
                      'verifiedFiles': len(records), 'restoredFiles': restored,
                      'currentApplicationOrBuildCertified': False}))
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (OSError, ValueError, KeyError, zipfile.BadZipFile) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
