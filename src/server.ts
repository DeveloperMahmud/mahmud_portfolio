import 'dotenv/config';
import app from './app.js';
import { db } from './lib/db.js';
const port = Number(process.env.PORT || 8787);
async function start() {
  await db.$connect();
  app.listen(port, () => console.log(`Portfolio V7 running on http://localhost:${port}`));
}
start().catch((error) => { console.error('Failed to start Portfolio V7:', error); process.exit(1); });
