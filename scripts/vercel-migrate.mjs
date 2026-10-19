import { spawn } from 'node:child_process';

const maxAttempts = 4;
const waitMs = [0, 12_000, 20_000, 30_000];

function runMigration() {
  return new Promise((resolve, reject) => {
    const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const child = spawn(command, ['prisma', 'migrate', 'deploy'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    for (const stream of [child.stdout, child.stderr]) {
      stream.on('data', chunk => {
        const text = chunk.toString();
        output += text;
        process.stdout.write(text);
      });
    }
    child.on('error', reject);
    child.on('close', code => resolve({ code: code ?? 1, output }));
  });
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const delay = waitMs[attempt - 1] ?? 30_000;
  if (delay) {
    console.log(`Waiting ${Math.round(delay / 1000)}s before migration retry (${attempt}/${maxAttempts})…`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  console.log(`Running Prisma migration (${attempt}/${maxAttempts})…`);
  const result = await runMigration();
  if (result.code === 0) process.exit(0);

  const lockTimeout = /P1002|advisory lock/i.test(result.output);
  if (!lockTimeout || attempt === maxAttempts) {
    console.error(`Prisma migration failed on attempt ${attempt}.`);
    process.exit(result.code || 1);
  }
  console.warn('Database migration lock is busy. Retrying safely without changing database data.');
}
