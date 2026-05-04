import { spawnSync } from 'node:child_process';
import { constants as fsConstants } from 'node:fs';
import { access, cp, mkdir, rm, rename, stat } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const stagingRoot = join(repoRoot, 'pack', '.sync-extension-staging');
const nodeExecutable = process.execPath;
const npmCli = join(dirname(nodeExecutable), 'node_modules', 'npm', 'bin', 'npm-cli.js');

const extensionJobs = [
  {
    name: 'better-lyrics-glassy',
    sourceDir: join(repoRoot, 'extensions-src', 'better-lyrics-glassy'),
    outputDir: join(repoRoot, 'extensions-src', 'better-lyrics-glassy', 'dist', 'chrome'),
    targetDir: join(repoRoot, 'extensions', 'bl'),
  },
  {
    name: 'shaders-glassy',
    sourceDir: join(repoRoot, 'extensions-src', 'shaders-glassy'),
    outputDir: join(repoRoot, 'extensions-src', 'shaders-glassy', 'build', 'chrome-mv3-prod'),
    targetDir: join(repoRoot, 'extensions', 'bls'),
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

function runNpm(args, cwd) {
  const result = spawnSync(nodeExecutable, [npmCli, ...args], {
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

async function exists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function installDependencies(packageDir) {
  const nodeModulesDir = join(packageDir, 'node_modules');

  if (await exists(nodeModulesDir)) {
    return;
  }

  runNpm(['ci'], packageDir);
}

async function buildExtension(job) {
  console.log(`\n[extensions] Building ${job.name}...`);
  await installDependencies(job.sourceDir);
  runNpm(['run', 'build'], job.sourceDir);

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