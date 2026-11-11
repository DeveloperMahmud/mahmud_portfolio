import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';

const host='127.0.0.1',port=Number(process.env.PORT||8799),root=path.resolve(process.cwd(),'portfolio');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon'};
const server=createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url||'/',`http://${host}:${port}`).pathname);
    if(pathname==='/api/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end('{"ok":true,"mode":"static-preview"}')}
    let relative=pathname==='/'?'index.html':pathname.replace(/^\/+/,''),target=path.resolve(root,relative);
    if(!target.startsWith(root)){res.writeHead(403);return res.end('Forbidden')}
    const info=await stat(target).catch(()=>null);if(info?.isDirectory())target=path.join(target,'index.html');
    const body=await readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found')}
});
server.listen(port,host,()=>console.log(`Static preview: http://${host}:${port}`));
