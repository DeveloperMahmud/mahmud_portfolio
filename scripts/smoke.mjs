const base=(process.env.SMOKE_BASE_URL||'http://127.0.0.1:8787').replace(/\/$/,'');
const results=[];
async function check(name,path,assert,options){try{const response=await fetch(base+path,{redirect:'manual',...options});const text=await response.text();const ok=assert(response,text);results.push({name,ok,status:response.status});if(!ok)process.exitCode=1}catch(error){results.push({name,ok:false,error:error.message});process.exitCode=1}}
await check('health','/api/health',(r,t)=>r.ok&&JSON.parse(t).ok);
await check('homepage','/',(r,t)=>r.ok&&/rel="canonical"/i.test(t)&&/application\/ld\+json/i.test(t));
await check('work archive','/work.html',(r,t)=>r.ok&&/<main/i.test(t));
await check('journal archive','/blog.html',(r,t)=>r.ok&&/<main/i.test(t));
await check('sitemap','/sitemap.xml',(r,t)=>r.ok&&/<urlset/i.test(t));
await check('robots','/robots.txt',(r,t)=>r.ok&&/User-agent:/i.test(t)&&/Sitemap:/i.test(t));
await check('admin login','/admin.html',(r,t)=>r.ok&&/loginForm/.test(t));
await check('protected operations','/api/admin/operations/health',r=>r.status===401);
await check('invalid inquiry','/api/public/inquiries',r=>r.status===400,{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
const projectResponse=await fetch(base+'/api/public/projects').catch(()=>null);if(!projectResponse?.ok){const allowed=process.env.SMOKE_ALLOW_DATA_UNAVAILABLE==='true';results.push({name:'published project',ok:allowed,status:projectResponse?.status,skipped:allowed?'Data-backed route unavailable before pending migration':'Public projects API unavailable'});if(!allowed)process.exitCode=1}else{const projects=await projectResponse.json();if(projects?.projects?.[0]?.slug)await check('published project',`/work/${encodeURIComponent(projects.projects[0].slug)}`,(r,t)=>r.ok&&/rel="canonical"/i.test(t));else results.push({name:'published project',ok:true,skipped:'No published fixture/data available'})}
console.table(results);if(process.exitCode)throw new Error('Smoke checks failed');
