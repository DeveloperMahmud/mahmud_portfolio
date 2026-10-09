import 'dotenv/config';
import app from '../dist/src/app.js';
const host='127.0.0.1',port=Number(process.env.SMOKE_LOCAL_PORT||8799);
process.env.SMOKE_BASE_URL=`http://${host}:${port}`;
const server=app.listen(port,host);
await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject)});
try{await import('./smoke.mjs')}finally{await new Promise(resolve=>server.close(resolve))}
