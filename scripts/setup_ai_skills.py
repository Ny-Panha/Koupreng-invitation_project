#!/usr/bin/env python3
"""Offline team skill installation shared by the PowerShell and Bash launchers."""

import argparse
import fnmatch
import hashlib
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import tempfile
import time


IGNORED = ('__pycache__', '*.pyc', '*.pyo', '.DS_Store')


class SetupError(Exception):
    """An actionable setup failure."""


def is_link(path: Path) -> bool:
    # lstat also detects Windows junctions on Python versions before is_junction.
    try:
        info = path.lstat()
    except FileNotFoundError:
        return False
    return stat.S_ISLNK(info.st_mode) or bool(
        getattr(info, 'st_file_attributes', 0) & getattr(stat, 'FILE_ATTRIBUTE_REPARSE_POINT', 0x400)
    )


def checked_path(boundary: Path, path: Path) -> Path:
    """Check containment and existing ancestors before writing or moving a path."""
    boundary = boundary.resolve()
    path = path.absolute()
    if '..' in path.parts or not path.is_relative_to(boundary) or path == boundary:
        raise SetupError(f'Path is outside the installation directory: {path}')
    current = boundary
    for part in path.relative_to(boundary).parts:
        current = current / part
        if is_link(current):
            raise SetupError(f'Refusing a symlink or junction: {current}')
    return path


def inventory(directory: Path) -> dict[str, str]:
    """Hash all skill assets, excluding only generated Python/OS cache files."""
    if is_link(directory):
        raise SetupError(f'Refusing a symlink or junction: {directory}')
    files = {}
    for entry in sorted(directory.iterdir()):
        if any(fnmatch.fnmatch(entry.name, pattern) for pattern in IGNORED):
            continue
        if is_link(entry):
            raise SetupError(f'Refusing a symlink or junction: {entry}')
        if entry.is_dir():
            for name, checksum in inventory(entry).items():
                files[f'{entry.name}/{name}'] = checksum
        elif entry.is_file():
            files[entry.name] = hashlib.sha256(entry.read_bytes()).hexdigest()
        else:
            raise SetupError(f'Unsupported skill asset: {entry}')
    return files


def move_directory(source: Path, destination: Path) -> None:
    """Allow briefly held Windows file handles to close before giving up."""
    for attempt in range(5):
        try:
            source.rename(destination)
            return
        except OSError as error:
            if getattr(error, 'winerror', None) not in (5, 32, 33) or attempt == 4:
                raise
            time.sleep(0.1 * (2 ** attempt))


def verify_sources(project: Path) -> list[tuple[Path, dict[str, str]]]:
    skills = checked_path(project, project / '.agents' / 'skills')
    if not skills.is_dir():
        raise SetupError('Missing .agents/skills. Use a complete checkout of the repository.')
    sources = []
    for directory in sorted(skills.iterdir()):
        if is_link(directory):
            raise SetupError(f'Refusing a symlink or junction: {directory}')
        if directory.is_dir() and directory.name not in IGNORED:
            sources.append((directory, inventory(directory)))
    if not sources:
        raise SetupError('No bundled skill directories were found.')

    # Reuse the project's hash, frontmatter, custom-skill, routing, and link checks.
    validator = project / 'scripts' / 'validate-agent-routing.py'
    result = subprocess.run([sys.executable, '-B', str(validator)], cwd=project, check=False)
    if result.returncode:
        raise SetupError(
            'Repository skill verification failed; nothing was installed. Restore the affected '
            'source files from a reviewed Git checkout and retry. --force cannot bypass this check.'
        )
    print(f'\nVerified {len(sources)} bundled skill directories.', flush=True)
    return sources


def install(project: Path, user_directory: Path, agent: str, scope: str, force: bool,
            sources: list[tuple[Path, dict[str, str]]]) -> None:
    agents = ('codex', 'claude') if agent == 'all' else (agent,)
    boundary = (project if scope == 'project' else user_directory).resolve()
    plans = []
    unchanged = 0
    conflicts = []

    # Preflight every agent before making any destination changes.
    for selected in agents:
        if selected == 'codex' and scope == 'project':
            print(f'Codex: uses {project / ".agents" / "skills"} directly.', flush=True)
            continue
        folder = '.agents' if selected == 'codex' else '.claude'
        destination_root = checked_path(boundary, boundary / folder / 'skills')
        for source, checksums in sources:
            destination = checked_path(boundary, destination_root / source.name)
            exists = destination.exists()
            if exists and destination.is_dir() and inventory(destination) == checksums:
                unchanged += 1
                continue
            if exists and not force:
                conflicts.append(str(destination))
            plans.append((source, checksums, destination, exists))

    if conflicts:
        raise SetupError(
            'Existing skills contain different files:\n  ' + '\n  '.join(conflicts)
            + '\nRerun with --force (PowerShell: -Force) to back up and replace these copies.'
        )

    backup_roots = {}
    for source, checksums, destination, exists in plans:
        checked_path(boundary, destination)
        destination.parent.mkdir(parents=True, exist_ok=True)
        agent_root = destination.parent.parent
        # Stage a complete, verified copy on the same filesystem before replacing anything.
        with tempfile.TemporaryDirectory(prefix='.ai-skills-stage-', dir=agent_root) as staging:
            staged = checked_path(boundary, Path(staging) / source.name)
            shutil.copytree(source, staged, ignore=shutil.ignore_patterns(*IGNORED))
            if inventory(staged) != checksums:
                raise SetupError(f'Skill changed while copying: {source}. Rerun setup.')
            backup = None
            if exists:
                if agent_root not in backup_roots:
                    backup_parent = checked_path(boundary, agent_root / 'skill-backups')
                    backup_parent.mkdir(parents=True, exist_ok=True)
                    backup_roots[agent_root] = Path(tempfile.mkdtemp(prefix='setup-', dir=backup_parent))
                backup = checked_path(boundary, backup_roots[agent_root] / source.name)
                move_directory(destination, backup)
            try:
                move_directory(staged, destination)
            except BaseException:
                if backup is not None and not destination.exists():
                    move_directory(backup, destination)
                raise

    print(f'Installed: {len(plans)} skill copies; already current: {unchanged}.')
    for backup_root in backup_roots.values():
        print(f'Previous copies backed up to: {backup_root}')
    print('Setup complete. Open this repository in a new Codex or Claude Code session.')
    print('Ask the agent to read AGENTS.md and .agents/ROUTER.md before choosing skills for a task.')


def main() -> int:
    parser = argparse.ArgumentParser(
        description='Verify and install every bundled Koupreng skill for Codex and Claude Code. '
                    'Offline; no administrator privileges or AI credentials required.'
    )
    parser.add_argument('--agent', choices=('all', 'codex', 'claude'), default='all')
    parser.add_argument('--scope', choices=('project', 'user'), default='project',
                        help='project (default) or personal skills across repositories')
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--verify-only', action='store_true',
                      help='only validate repository sources and routing; never install')
    mode.add_argument('--force', action='store_true',
                      help='back up and replace differing installed copies; source checks still apply')
    args = parser.parse_args()
    if sys.version_info < (3, 10):
        parser.error('Python 3.10+ is required.')
    project = Path(__file__).resolve().parent.parent
    try:
        sources = verify_sources(project)
        if not args.verify_only:
            install(project, Path.home(), args.agent, args.scope, args.force, sources)
        return 0
    except (SetupError, OSError) as error:
        print(f'ERROR: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
