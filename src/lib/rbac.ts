import type { Request, Response, NextFunction } from 'express';
import { db } from './db.js';

const readMethod=(method:string)=>['GET','HEAD','OPTIONS'].includes(method);

export async function enforceAdminAccess(req:Request,res:Response,next:NextFunction){
  try{
    const session=res.locals.user as {sub?:string}|undefined;
    const user=session?.sub?await db.user.findUnique({where:{id:session.sub},select:{id:true,role:true,active:true}}):null;
    if(!user?.active)return res.status(401).json({error:'This CMS account is unavailable.'});
    res.locals.currentUser=user;
    if(user.role==='ADMIN')return next();
    if(readMethod(req.method))return next();
    const path=req.path.toLowerCase();
    if(user.role==='VIEWER')return res.status(403).json({error:'Viewer accounts have read-only access.'});
    if(user.role==='WRITER'){
      if(!/^\/(projects|content)(?:\/|$)/.test(path))return res.status(403).json({error:'Writer accounts can edit project and journal drafts only.'});
      if(req.method==='DELETE'||path.endsWith('/bulk')||path.includes('/share-link'))return res.status(403).json({error:'Writer accounts cannot delete, bulk-publish or share records.'});
      if(req.body&&typeof req.body==='object')req.body.status='DRAFT';
      return next();
    }
    if(user.role==='MODERATOR'){
      if(/^\/maintenance\/(inquiries|testimonials|reviews)(?:\/|$)/.test(path))return next();
      return res.status(403).json({error:'Moderator accounts can manage leads, testimonials and client-review workflows only.'});
    }
    if(user.role==='EDITOR'){
      if(/^\/operations\/(?:restore|backup)/.test(path)||/^\/maintenance\/(?:restore|control-center|settings|site-config)/.test(path))return res.status(403).json({error:'Administrator access is required for system, theme and security settings.'});
      return next();
    }
    return res.status(403).json({error:'This role does not have permission for that action.'});
  }catch(error){next(error)}
}
