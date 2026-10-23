import 'dotenv/config';

if (!process.env.DATABASE_URL?.trim()) {
  console.error('Local smoke test requires DATABASE_URL in .env.');
  console.error('Use an isolated development/QA database, then run npm run test:smoke:local again.');
  console.error('For database-independent checks, run npm run test:smoke:static.');
  process.exit(2);
}

const host='127.0.0.1',port=Number(process.env.SMOKE_LOCAL_PORT||8799);
process.env.SMOKE_BASE_URL=`http://${host}:${port}`;
const {default:app}=await import('../dist/src/app.js');
const server=app.listen(port,host);
await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject)});
try{await import('./smoke.mjs')}finally{await new Promise(resolve=>server.close(resolve))}
