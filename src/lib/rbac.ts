import type { Request, Response, NextFunction } from 'express';
import { db } from './db.js';

const readMethod=(method:string)=>['GET','HEAD','OPTIONS'].includes(method);
const readScopes:Record<string,RegExp[]>={
  EDITOR:[
    /^\/(?:projects|content|brands|media|import|export)(?:\/|$)/,
    /^\/maintenance\/(?:settings|brand-assets|homepage)(?:\/|$)/,
    /^\/creative-tools(?:\/|$)/,
    /^\/page-studio(?:\/|$)/,
    /^\/seo(?:\/|$)/,
    /^\/operations\/(?:revisions|trash|previews|media\/maintenance)(?:\/|$)/
  ],
  WRITER:[/^\/(?:projects|content|brands)(?:\/|$)/],
  MODERATOR:[
    /^\/(?:projects|content|brands)(?:\/|$)/,
    /^\/maintenance(?:\/|$)/,
    /^\/operations\/inquiries(?:\/|$)/
  ],
  VIEWER:[
    /^\/(?:projects|content|brands|media)(?:\/|$)/,
    /^\/maintenance\/(?:brand-assets|homepage)(?:\/|$)/,
    /^\/creative-tools(?:\/|$)/,
    /^\/page-studio(?:\/|$)/
  ]
};
const editorWriteScopes=[
  /^\/(?:projects|content|brands|media|import)(?:\/|$)/,
  /^\/maintenance\/(?:brand-assets|homepage|testimonials|reviews|recruiter-profile|studio-profile|presentation-profile)(?:\/|$)/,
  /^\/creative-tools(?:\/|$)/,
  /^\/page-studio(?:\/|$)/,
  /^\/seo(?:\/|$)/,
  /^\/operations\/(?:previews|media\/maintenance|media\/[^/]+\/replace)(?:\/|$)/
];

function mayRead(role:string,path:string){return (readScopes[role]||[]).some(pattern=>pattern.test(path))}
function editorMayWrite(path:string){return editorWriteScopes.some(pattern=>pattern.test(path))}

export async function enforceAdminAccess(req:Request,res:Response,next:NextFunction){
  try{
    const session=res.locals.user as {sub?:string}|undefined;
    const user=session?.sub?await db.user.findUnique({where:{id:session.sub},select:{id:true,role:true,active:true}}):null;
    if(!user?.active)return res.status(401).json({error:'This CMS account is unavailable.'});
    res.locals.currentUser=user;
    const path=req.path.toLowerCase();
    if(user.role==='ADMIN')return next();
    if(readMethod(req.method))return mayRead(user.role,path)?next():res.status(403).json({error:'This account cannot view that CMS area.'});
    if(user.role==='VIEWER')return res.status(403).json({error:'Viewer accounts have read-only access.'});
    if(user.role==='WRITER'){
      if(!/^\/(projects|content)(?:\/|$)/.test(path))return res.status(403).json({error:'Writer accounts can edit project and journal drafts only.'});
      if(req.method==='DELETE'||path.endsWith('/bulk')||path.includes('/share-link'))return res.status(403).json({error:'Writer accounts cannot delete, bulk-publish or share records.'});
      const match=path.match(/^\/(projects|content)\/([^/]+)$/);
      if(req.method==='PATCH'&&match){
        const existing=match[1]==='projects'
          ?await db.project.findUnique({where:{id:match[2]},select:{status:true}})
          :await db.content.findUnique({where:{id:match[2]},select:{status:true}});
        if(!existing||existing.status!=='DRAFT')return res.status(403).json({error:'Writers can only edit records that are already drafts. Ask an editor to move published content back to draft first.'});
      }
      if(req.body&&typeof req.body==='object')req.body.status='DRAFT';
      return next();
    }
    if(user.role==='MODERATOR'){
      if(/^\/maintenance\/(inquiries|testimonials|reviews)(?:\/|$)/.test(path))return next();
      return res.status(403).json({error:'Moderator accounts can manage leads, testimonials and client-review workflows only.'});
    }
    if(user.role==='EDITOR'){
      return editorMayWrite(path)?next():res.status(403).json({error:'Administrator access is required for accounts, system controls, recovery and global site settings.'});
    }
    return res.status(403).json({error:'This role does not have permission for that action.'});
  }catch(error){next(error)}
}
