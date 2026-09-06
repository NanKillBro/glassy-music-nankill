import { spawnSync } from 'node:child_process';
import { constants as fsConstants } from 'node:fs';
import { access, cp, mkdir, rm, rename, stat, readFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const stagingRoot = join(repoRoot, 'pack', '.sync-extension-staging');
const extensionJobs = [
  {
    name: 'better-lyrics-glassy',
    sourceDir: join(repoRoot, 'extensions-src', 'better-lyrics-glassy'),
    outputDir: join(repoRoot, 'extensions-src', 'better-lyrics-glassy', 'dist', 'chrome'),
    targetDir: join(repoRoot, 'extensions', 'bl'),
  },
  {
    name: 'better-lyrics-glassy-dev',
    sourceDir: join(repoRoot, 'extensions-src', 'better-lyrics-glassy-dev'),
    outputDir: join(repoRoot, 'extensions-src', 'better-lyrics-glassy-dev', 'dist', 'chrome'),
    targetDir: join(repoRoot, 'extensions', 'bl-dev'),
  },
  {
    name: 'shaders-glassy',
    sourceDir: join(repoRoot, 'extensions-src', 'shaders-glassy'),
    outputDir: join(repoRoot, 'extensions-src', 'shaders-glassy', 'build', 'chrome-mv3-prod'),
    targetDir: join(repoRoot, 'extensions', 'bls'),
  },
  {
    name: 'tacet-glassy',
    sourceDir: join(repoRoot, 'extensions-src', 'tacet-glassy'),
    outputDir: join(repoRoot, 'extensions-src', 'tacet-glassy', 'build', 'chrome-mv3-prod'),
    targetDir: join(repoRoot, 'extensions', 'tacet'),
  },
];

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    env: process.env,
    shell: false,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runPackageManager(args, cwd, isPnpm = false) {
  const cmd = isPnpm ? 'pnpm' : 'npm';
  const result = spawnSync(cmd, args, {
    cwd,
    env: process.env,
    shell: true,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runNpm(args, cwd) {
  runPackageManager(args, cwd, false);
}

async function exists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// Returns the version a package's own manifest reports, or null when it is not
// installed. Used to compare what is on disk against what the lockfile asks for.
async function installedVersion(packageDir, dependency) {
  try {
    const manifestPath = join(packageDir, 'node_modules', dependency, 'package.json');
    return JSON.parse(await readFile(manifestPath, 'utf8')).version ?? null;
  } catch {
    return null;
  }
}

// Returns the version the lockfile pins for a dependency, or null when the lockfile
// is missing or does not mention it. npm and pnpm lockfiles are read differently;
// only npm's is parsed here because that is the format the submodules use.
async function lockedVersion(packageDir, dependency) {
  try {
    const lock = JSON.parse(await readFile(join(packageDir, 'package-lock.json'), 'utf8'));
    return lock.packages?.[`node_modules/${dependency}`]?.version ?? null;
  } catch {
    return null;
  }
}

// A submodule's node_modules is a build input, and an out-of-date one is silently
// wrong rather than loudly broken: when better-lyrics-glassy-dev moved from
// extension@2.1.3 to 4.1.5, the pre-existing tree from the older commit was kept and
// every build afterwards ran the old bundler. 2.1.3 does not mount an Extension.js
// default-export entrypoint, so `export default function initializeBetterLyrics()`
// was left unreferenced and rspack tree-shook the whole initialisation path out of
// the bundle — the extension loaded, evaluated, and did nothing at all, with no error
// anywhere to point at the cause.
//
// So the presence of node_modules is not enough; we reinstall whenever the version on
// disk disagrees with the lockfile. `npm ci` rather than `npm install` for the repair,
// to land exactly what is pinned instead of re-resolving ranges.
const VERSION_CRITICAL_DEPENDENCIES = ['extension'];

async function installDependencies(packageDir) {
  const nodeModulesDir = join(packageDir, 'node_modules');
  const isPnpm = await exists(join(packageDir, 'pnpm-lock.yaml'));

  if (!(await exists(nodeModulesDir))) {
    const args = ['install'];
    if (isPnpm) {
      args.push('--ignore-workspace');
    }
    runPackageManager(args, packageDir, isPnpm);
    return;
  }

  // pnpm submodules are left alone: the check below reads an npm lockfile, and pnpm's
  // own install is already strict about matching its lockfile.
  if (isPnpm) {
    return;
  }

  for (const dependency of VERSION_CRITICAL_DEPENDENCIES) {
    const [onDisk, pinned] = await Promise.all([
      installedVersion(packageDir, dependency),
      lockedVersion(packageDir, dependency),
    ]);

    if (pinned === null || onDisk === pinned) {
      continue;
    }

    console.log(
      `[extensions] ${dependency}: installed ${onDisk ?? 'nothing'}, lockfile wants ${pinned} — reinstalling`,
    );
    runNpm(['ci', '--no-audit', '--no-fund'], packageDir);
    return;
  }
}

async function buildExtension(job) {
  console.log(`\n[extensions] Building ${job.name}...`);
  await installDependencies(job.sourceDir);
  const isPnpm = await exists(join(job.sourceDir, 'pnpm-lock.yaml'));
  
  if (job.name === 'tacet-glassy') {
    runPackageManager(['run', 'sync:ort'], job.sourceDir, isPnpm);
  }
  
  runPackageManager(['run', 'build'], job.sourceDir, isPnpm);

  const sourceStats = await stat(job.outputDir);
  if (!sourceStats.isDirectory()) {
    throw new Error(`Expected build output directory at ${job.outputDir}`);
  }
}

async function stageDirectory(sourceDir, stagedDir) {
  await rm(stagedDir, { force: true, recursive: true });
  await mkdir(dirname(stagedDir), { recursive: true });
  await cp(sourceDir, stagedDir, { force: true, recursive: true, verbatimSymlinks: true });
}

async function swapDirectory(stagedDir, targetDir) {
  await rm(targetDir, { force: true, recursive: true });
  await rename(stagedDir, targetDir);
}

async function main() {
  run('git', ['submodule', 'update', '--init', '--recursive'], repoRoot);
  await rm(stagingRoot, { force: true, recursive: true });

  const stagedJobs = [];

  try {
    for (const job of extensionJobs) {
      await buildExtension(job);
      const stagedDir = join(stagingRoot, basename(job.targetDir));
      await stageDirectory(job.outputDir, stagedDir);

      stagedJobs.push({ stagedDir, targetDir: job.targetDir, name: job.name });
    }

    for (const job of stagedJobs) {
      console.log(`[extensions] Updating ${job.name} in extensions/...`);
      await swapDirectory(job.stagedDir, job.targetDir);
    }
  } finally {
    await rm(stagingRoot, { force: true, recursive: true });
  }

  console.log('\n[extensions] Extension sync completed successfully.');
}

main().catch((error) => {
  console.error('\n[extensions] Sync failed:', error);
  process.exit(1);
});