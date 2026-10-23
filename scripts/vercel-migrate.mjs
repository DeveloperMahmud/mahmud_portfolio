import { spawn } from 'node:child_process';

const parsedAttempts = Number.parseInt(process.env.MIGRATION_MAX_ATTEMPTS || '5', 10);
const maxAttempts = Number.isFinite(parsedAttempts) ? Math.min(Math.max(parsedAttempts, 1), 8) : 5;
const retryDelaysMs = [0, 5_000, 12_000, 20_000, 30_000, 45_000, 60_000, 75_000];
const attemptTimeoutMs = 90_000;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function runMigration() {
  return new Promise((resolve, reject) => {
    const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const child = spawn(command, ['prisma', 'migrate', 'deploy'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    let output = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, attemptTimeoutMs);

    for (const stream of [child.stdout, child.stderr]) {
      stream.on('data', chunk => {
        const text = chunk.toString();
        output += text;
        process.stdout.write(text);
      });
    }
    child.on('error', error => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', code => {
      clearTimeout(timer);
      resolve({ code: code ?? 1, output, timedOut });
    });
  });
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const baseDelay = retryDelaysMs[attempt - 1] ?? 75_000;
  const jitter = baseDelay ? Math.floor(Math.random() * 2_500) : 0;
  const delay = baseDelay + jitter;
  if (delay) {
    console.log(`Waiting ${Math.round(delay / 1000)}s before migration retry (${attempt}/${maxAttempts})...`);
    await wait(delay);
  }

  console.log(`Running Prisma migration (${attempt}/${maxAttempts})...`);
  const result = await runMigration();
  if (result.code === 0) process.exit(0);

  if (result.timedOut) {
    console.error(`Prisma migration attempt ${attempt} exceeded ${attemptTimeoutMs / 1000}s.`);
    process.exit(result.code || 1);
  }

  const advisoryLockTimeout = /P1002[\s\S]*advisory lock|advisory lock[\s\S]*P1002/i.test(result.output);
  if (!advisoryLockTimeout || attempt === maxAttempts) {
    console.error(`Prisma migration failed on attempt ${attempt}.`);
    process.exit(result.code || 1);
  }
  console.warn('Database migration lock is busy. Retrying with bounded backoff and jitter.');
}
