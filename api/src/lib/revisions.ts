import { Prisma } from '@prisma/client';
import { db } from './db.js';

const secretKey=/password|secret|token|authorization|cookie|api.?key|dsn/i;

export function safeSnapshot(value:unknown):Prisma.InputJsonValue {
  const clean=(input:unknown):unknown=>{
    if(input instanceof Date)return input.toISOString();
    if(Array.isArray(input))return input.map(clean);
    if(input&&typeof input==='object')return Object.fromEntries(Object.entries(input as Record<string,unknown>).filter(([key])=>!secretKey.test(key)).map(([key,item])=>[key,clean(item)]));
    if(typeof input==='bigint')return input.toString();
    return input===undefined?null:input;
  };
  return clean(value) as Prisma.InputJsonValue;
}

export async function createRevision(resourceType:string,resourceId:string,snapshot:unknown,options:{actorId?:string;summary?:string;sourceAction?:string}={}){
  const latest=await db.contentRevision.findFirst({where:{resourceType,resourceId},orderBy:{revision:'desc'},select:{revision:true}});
  const row=await db.contentRevision.create({data:{resourceType,resourceId,revision:(latest?.revision||0)+1,snapshot:safeSnapshot(snapshot),actorId:options.actorId,summary:options.summary,sourceAction:options.sourceAction||'SAVE'}});
  const keep=Math.max(5,Math.min(250,Number(process.env.REVISION_RETENTION_COUNT)||50));
  const old=await db.contentRevision.findMany({where:{resourceType,resourceId},orderBy:{revision:'desc'},skip:keep,select:{id:true}});
  if(old.length)await db.contentRevision.deleteMany({where:{id:{in:old.map(x=>x.id)}}});
  return row;
}
