"""Isolated installer regression tests; never touch the developer's agent homes."""

import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest import mock


REPO = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('setup_ai_skills', REPO / 'scripts/setup_ai_skills.py')
setup = importlib.util.module_from_spec(spec)
spec.loader.exec_module(setup)
CUSTOM = (
    'koupreng-premium-ux', 'koupreng-backend-standards', 'koupreng-payment-security',
    'koupreng-database-flyway', 'koupreng-qa-release', 'koupreng-deployment',
)


class TeamSkillsSetupTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='koupreng skills tests ')
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name).resolve()
        self.project = self.base / 'team checkout'
        self.user_directory = self.base / 'personal home'
        self.user_directory.mkdir()
        self.skills = self.project / '.agents/skills'
        (self.project / 'scripts').mkdir(parents=True)
        for filename in ('setup_ai_skills.py', 'validate-agent-routing.py',
                         'setup-ai-skills.ps1', 'setup-ai-skills.sh'):
            shutil.copy2(REPO / 'scripts' / filename, self.project / 'scripts' / filename)
        for name in (*CUSTOM, 'demo-vendor', 'design-helper'):
            self.write(f'.agents/skills/{name}/SKILL.md',
                       f'---\nname: {name}\ndescription: Fixture skill for team setup.\n---\n# Fixture\n')
            self.write(f'.agents/skills/{name}/references/details.md', 'Fixture reference\n')
        self.write('.agents/skills/design-helper/scripts/helper.py',
                   'raise RuntimeError("Bundled scripts must never execute during setup")\n')
        self.write('AGENTS.md', 'Read .agents/ROUTER.md before editing.\n')
        self.write('CODEX.md', 'Read AGENTS.md.\n')
        self.write('CLAUDE.md', '@./AGENTS.md\n')
        self.write('GEMINI.md', '@./AGENTS.md\n')
        self.write('.agents/ROUTER.md', '\n'.join(f'`{name}`' for name in CUSTOM))
        self.write('.agents/SKILLS_INDEX.md', 'Fixture skill index\n')
        pinned = self.skills / 'demo-vendor/SKILL.md'
        self.write('ai-skills.lock.json', json.dumps({
            'version': '1.0.0', 'schemaVersion': '2026-03-01', 'skills': [{
                'skill': 'demo-vendor', 'commit': 'a' * 40,
                'files': [{'path': 'SKILL.md', 'sha256': hashlib.sha256(pinned.read_bytes()).hexdigest()}],
            }],
        }))

    def write(self, relative, content):
        path = self.project / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding='utf-8')
        return path

    def run_cli(self, *args, prefix=None):
        command = prefix or [sys.executable, '-B', str(self.project / 'scripts/setup_ai_skills.py')]
        return subprocess.run([*command, *args], cwd=self.base, capture_output=True, text=True,
                              encoding='utf-8', timeout=30,
                              env={**os.environ, 'HOME': str(self.user_directory),
                                   'USERPROFILE': str(self.user_directory)})

    def source_files(self):
        return {path.relative_to(self.skills): path.read_bytes()
                for path in self.skills.rglob('*') if path.is_file()}

    def test_default_installs_all_assets_without_changing_source_and_rerun_is_noop(self):
        original = self.source_files()
        result = self.run_cli()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        destination = self.project / '.claude/skills'
        for relative, content in original.items():
            self.assertEqual((destination / relative).read_bytes(), content)
        self.assertEqual(self.source_files(), original)
        self.assertFalse((self.project / '.codex').exists())
        marker = destination / 'design-helper/SKILL.md'
        modified = marker.stat().st_mtime_ns
        again = self.run_cli()
        self.assertEqual(again.returncode, 0, again.stdout + again.stderr)
        self.assertIn('Installed: 0 skill copies; already current: 8.', again.stdout)
        self.assertEqual(marker.stat().st_mtime_ns, modified)
        self.assertFalse((self.project / '.claude/skill-backups').exists())

    def test_verification_is_read_only(self):
        result = self.run_cli('--verify-only')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertFalse((self.project / '.claude').exists())

    def test_pinned_checksum_failure_blocks_even_forced_install(self):
        self.write('.agents/skills/demo-vendor/SKILL.md', 'Modified pinned file\n')
        result = self.run_cli('--force')
        self.assertEqual(result.returncode, 1)
        self.assertIn('hash mismatch', result.stdout)
        self.assertIn('cannot bypass', result.stderr)
        self.assertFalse((self.project / '.claude').exists())

    def test_missing_custom_assets_block_install(self):
        shutil.rmtree(self.skills / CUSTOM[0] / 'references')
        result = self.run_cli()
        self.assertEqual(result.returncode, 1)
        self.assertIn('references directory missing or empty', result.stdout)
        self.assertFalse((self.project / '.claude').exists())

    def test_unpinned_invalid_frontmatter_blocks_install(self):
        self.write('.agents/skills/design-helper/SKILL.md', '# Missing frontmatter\n')
        result = self.run_cli()
        self.assertEqual(result.returncode, 1)
        self.assertIn('frontmatter', result.stdout)
        self.assertFalse((self.project / '.claude').exists())

    def test_conflict_preflight_preserves_personal_skill_and_installs_nothing(self):
        personal = self.write('.claude/skills/design-helper/personal.txt', 'Keep my edits\n')
        result = self.run_cli()
        self.assertEqual(result.returncode, 1)
        self.assertIn('--force', result.stderr)
        self.assertEqual(personal.read_text(), 'Keep my edits\n')
        self.assertEqual([path.name for path in personal.parent.parent.iterdir()], ['design-helper'])

    def test_force_backs_up_conflicts_and_preserves_unrelated_skills(self):
        self.write('.claude/skills/design-helper/personal.txt', 'Keep my edits\n')
        unrelated = self.write('.claude/skills/my-other-skill/SKILL.md', 'Unrelated\n')
        result = self.run_cli('--force')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        backups = list((self.project / '.claude/skill-backups').glob('setup-*/design-helper/personal.txt'))
        self.assertEqual(len(backups), 1)
        self.assertEqual(backups[0].read_text(), 'Keep my edits\n')
        self.assertFalse((self.project / '.claude/skills/design-helper/personal.txt').exists())
        self.assertEqual(unrelated.read_text(), 'Unrelated\n')
        self.assertEqual(list((self.project / '.claude').glob('.ai-skills-stage-*')), [])

    def test_codex_project_uses_native_discovery_without_copies(self):
        result = self.run_cli('--agent', 'codex')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn('directly', result.stdout)
        self.assertFalse((self.project / '.claude').exists())

    def test_user_scope_installs_both_agents_in_an_isolated_home(self):
        result = self.run_cli('--scope', 'user')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        for folder in ('.agents', '.claude'):
            for relative, content in self.source_files().items():
                self.assertEqual((self.user_directory / folder / 'skills' / relative).read_bytes(), content)
        self.assertFalse((self.project / '.claude').exists())

    def test_user_scope_agent_selection(self):
        result = self.run_cli('--agent', 'claude', '--scope', 'user')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertTrue((self.user_directory / '.claude/skills/design-helper/SKILL.md').is_file())
        self.assertFalse((self.user_directory / '.agents').exists())

    def test_conflict_in_second_agent_blocks_all_user_installations(self):
        personal = self.user_directory / '.claude/skills/design-helper/SKILL.md'
        personal.parent.mkdir(parents=True)
        personal.write_text('Keep my skill\n', encoding='utf-8')
        result = self.run_cli('--scope', 'user')
        self.assertEqual(result.returncode, 1)
        self.assertFalse((self.user_directory / '.agents').exists())
        self.assertEqual(personal.read_text(), 'Keep my skill\n')

    def test_failed_replacement_restores_previous_copy(self):
        personal = self.write('.claude/skills/design-helper/personal.txt', 'Keep my edits\n')
        source = self.skills / 'design-helper'
        original_rename = Path.rename

        def fail_install(path, target):
            if path.parent.name.startswith('.ai-skills-stage-'):
                raise OSError('Simulated replacement failure')
            return original_rename(path, target)

        with mock.patch.object(Path, 'rename', fail_install):
            with self.assertRaisesRegex(OSError, 'Simulated replacement failure'):
                setup.install(self.project, self.user_directory, 'claude', 'project', True,
                              [(source, setup.inventory(source))])
        self.assertEqual(personal.read_text(), 'Keep my edits\n')
        self.assertEqual(list((self.project / '.claude').glob('.ai-skills-stage-*')), [])

    def test_temporary_windows_file_lock_is_retried(self):
        source = self.skills / 'design-helper'
        original_rename = Path.rename
        attempts = 0

        def initially_locked(path, target):
            nonlocal attempts
            attempts += 1
            if attempts == 1:
                error = PermissionError('Simulated Windows file lock')
                error.winerror = 32
                raise error
            return original_rename(path, target)

        with mock.patch.object(Path, 'rename', initially_locked), \
                mock.patch.object(setup.time, 'sleep'), mock.patch('builtins.print'):
            setup.install(self.project, self.user_directory, 'claude', 'project', False,
                          [(source, setup.inventory(source))])
        self.assertEqual(attempts, 2)
        self.assertEqual((self.project / '.claude/skills/design-helper/SKILL.md').read_bytes(),
                         (source / 'SKILL.md').read_bytes())

    def test_cache_files_are_not_distributed(self):
        self.write('.agents/skills/design-helper/__pycache__/cache.pyc', 'Generated\n')
        result = self.run_cli()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertFalse((self.project / '.claude/skills/design-helper/__pycache__').exists())

    def test_unknown_argument_and_conflicting_modes_fail_without_changes(self):
        for args in (('--typo',), ('--verify-only', '--force')):
            with self.subTest(args=args):
                self.assertEqual(self.run_cli(*args).returncode, 2)
                self.assertFalse((self.project / '.claude').exists())

    def test_paths_outside_destination_are_rejected(self):
        with self.assertRaises(setup.SetupError):
            setup.checked_path(self.project, self.base / 'outside')
        with self.assertRaises(setup.SetupError):
            setup.checked_path(self.project, self.project / '..' / 'outside')

    def test_linked_destinations_are_refused_even_with_force(self):
        target = self.base / 'external skills'
        target.mkdir()
        (self.project / '.claude').mkdir()
        linked = self.project / '.claude/skills'
        if os.name == 'nt':
            # A junction needs no Windows developer mode or elevated symlink privileges.
            result = subprocess.run(['powershell', '-NoProfile', '-Command',
                                     'New-Item -ItemType Junction -Path $env:KOUPRENG_TEST_LINK '
                                     '-Target $env:KOUPRENG_TEST_TARGET -ErrorAction Stop | Out-Null'],
                                    capture_output=True, text=True,
                                    env={**os.environ, 'KOUPRENG_TEST_LINK': str(linked),
                                         'KOUPRENG_TEST_TARGET': str(target)})
            self.assertEqual(result.returncode, 0, result.stderr)
        else:
            linked.symlink_to(target, target_is_directory=True)
        self.addCleanup(linked.rmdir if os.name == 'nt' else linked.unlink)
        result = self.run_cli('--force')
        self.assertEqual(result.returncode, 1)
        self.assertIn('symlink or junction', result.stderr)
        self.assertEqual(list(target.iterdir()), [])

    @unittest.skipUnless(os.name == 'nt', 'Windows PowerShell launcher')
    def test_powershell_launcher_forwards_agent_and_failure_exit_code(self):
        prefix = ['powershell', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File',
                  str(self.project / 'scripts/setup-ai-skills.ps1')]
        result = self.run_cli('-Agent', 'CoDeX', prefix=prefix)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertFalse((self.project / '.claude').exists())
        self.write('.agents/skills/demo-vendor/SKILL.md', 'Broken checksum\n')
        self.assertEqual(self.run_cli('-VerifyOnly', prefix=prefix).returncode, 1)

    @unittest.skipUnless(os.name == 'nt', 'Windows PowerShell launcher')
    def test_powershell_falls_back_when_python_launcher_is_unusable(self):
        binary_directory = self.base / 'test bin'
        binary_directory.mkdir()
        (binary_directory / 'py.cmd').write_text('@echo off\necho Unusable launcher 1>&2\nexit /b 1\n')
        prefix = ['powershell', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File',
                  str(self.project / 'scripts/setup-ai-skills.ps1')]
        with mock.patch.dict(os.environ, {'PATH': str(binary_directory) + os.pathsep + os.environ['PATH']}):
            result = self.run_cli('-VerifyOnly', prefix=prefix)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_bash_launcher_forwards_options_and_failure_exit_code(self):
        if os.name == 'nt':
            git = shutil.which('git')
            bash = Path(git).parent.parent / 'bin/bash.exe' if git else None
            if bash is None or not bash.is_file():
                self.skipTest('Git Bash is not available')
        else:
            bash = shutil.which('bash')
            if not bash:
                self.skipTest('Bash is not available')
        prefix = [str(bash), str(self.project / 'scripts/setup-ai-skills.sh')]
        result = self.run_cli('--agent', 'claude', prefix=prefix)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertTrue((self.project / '.claude/skills/design-helper/SKILL.md').is_file())
        self.write('.agents/skills/demo-vendor/SKILL.md', 'Broken checksum\n')
        self.assertEqual(self.run_cli('--verify-only', prefix=prefix).returncode, 1)


if __name__ == '__main__':
    unittest.main()
