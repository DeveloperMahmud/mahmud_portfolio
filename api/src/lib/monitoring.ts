import { Prisma } from '@prisma/client';
import { db } from './db.js';

const sensitive=/authorization|cookie|password|secret|token|api.?key|dsn|message|email|name/i;
export function redact(input:unknown,depth=0):unknown{
  if(depth>4)return '[truncated]';
  if(Array.isArray(input))return input.slice(0,20).map(x=>redact(x,depth+1));
  if(input&&typeof input==='object')return Object.fromEntries(Object.entries(input as Record<string,unknown>).slice(0,40).map(([key,value])=>[key,sensitive.test(key)?'[redacted]':redact(value,depth+1)]));
  if(typeof input==='string')return input.replace(/(bearer\s+)[^\s]+/gi,'$1[redacted]').slice(0,1000);
  return input;
}

export async function captureIncident(error:unknown,source:string,context:Record<string,unknown>={}){
  if(process.env.ERROR_MONITORING_ENABLED!=='true')return;
  const message=(error instanceof Error?error.message:String(error||'Unknown error')).slice(0,1000);
  const environment=process.env.SENTRY_ENVIRONMENT||process.env.VERCEL_ENV||process.env.NODE_ENV||'development';
  await db.errorIncident.create({data:{source,environment,release:process.env.SENTRY_RELEASE||process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,40),message,context:redact(context) as Prisma.InputJsonValue}}).catch(()=>{});
  const dsn=process.env.SENTRY_DSN;
  if(!dsn)return;
  try{
    const u=new URL(dsn);const project=u.pathname.replace(/^\//,'');if(!project||!u.username)return;
    const endpoint=`${u.protocol}//${u.host}/api/${project}/store/?sentry_version=7&sentry_key=${encodeURIComponent(u.username)}`;
    await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message,level:'error',platform:'node',environment,release:process.env.SENTRY_RELEASE,extra:redact(context)}),signal:AbortSignal.timeout(2500)});
  }catch{}
}
