import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { db } from '../lib/db.js';
import { absolute, metadataHtml, replaceHead, seoContext } from '../lib/seo.js';
import { pageStudioSystemEnabled, parsePageStudioConfig, resolveGlobalBlocks, studioBlocksSchema } from '../lib/page-studio.js';

const router=Router(),frontend=path.resolve(process.cwd(),'portfolio');

async function state(){const settings=await db.siteSettings.findFirst();return {settings,config:parsePageStudioConfig(settings?.pageStudioConfig)}}
export async function publicStudioEnabled(){const {config}=await state();return pageStudioSystemEnabled()&&config.publicEnabled}

async function dynamicData(){
  const now=new Date();const [projects,content,brands,settings]=await Promise.all([
    db.project.findMany({where:{deletedAt:null,status:'PUBLISHED',visibility:'PUBLIC',clientOnly:false,OR:[{scheduledAt:null},{scheduledAt:{lte:now}}]},orderBy:[{featured:'desc'},{sortOrder:'asc'}],select:{id:true,title:true,slug:true,category:true,service:true,client:true,coverImage:true,homepageImage:true,projectSubtitle:true}}),
    db.content.findMany({where:{deletedAt:null,status:'PUBLISHED',OR:[{scheduledAt:null},{scheduledAt:{lte:now}}]},orderBy:[{featured:'desc'},{publishedAt:'desc'}],select:{id:true,title:true,slug:true,category:true,excerpt:true,coverImage:true,publishedAt:true}}),
    db.brand.findMany({where:{deletedAt:null,active:true},orderBy:{sortOrder:'asc'},select:{id:true,name:true,logoAsset:true,logoDark:true,url:true,industry:true}}),db.siteSettings.findFirst()
  ]);
  return {projects,content,brands,settings:settings?{siteName:settings.siteName,title:settings.title,heroImage:settings.heroImage,navigationConfig:settings.navigationConfig,footerConfig:settings.footerConfig,aboutConfig:settings.aboutConfig,socialLinks:settings.socialLinks}: {}};
}

async function trustedOrigins(){return (await db.trustedEmbedSource.findMany({where:{enabled:true,allowIframe:true},select:{origin:true}})).map(x=>x.origin)}
async function pageByPath(requestPath:string){return db.customPage.findFirst({where:{publishedPath:requestPath,deletedAt:null,status:'PUBLISHED'}})}

export async function sendStudioPage(req:Request,res:Response,next:NextFunction){
  try{
    const {config}=await state();if(!pageStudioSystemEnabled()||!config.publicEnabled)return next();
    const page=await pageByPath(req.path);if(!page||!page.publishedSnapshot)return next();
    const published=page.publishedSnapshot as any,scheduledAt=published.scheduledAt?new Date(published.scheduledAt):null;
    if(!['PUBLIC','UNLISTED'].includes(published.visibility)||scheduledAt&&scheduledAt>new Date())return next();
    const [ctx,data,origins,navigationPreset,masters]=await Promise.all([seoContext(),dynamicData(),trustedOrigins(),published.navbarPresetId?db.navigationPreset.findFirst({where:{id:published.navbarPresetId,enabled:true}}):db.navigationPreset.findFirst({where:{enabled:true,isGlobal:true}}),db.reusableBlock.findMany({where:{active:true}})]);
    const blocks=resolveGlobalBlocks(studioBlocksSchema.parse(published.blocks),masters),publicPath=published.publishedPath||page.publishedPath||page.path,canonical=published.canonicalUrl||`${ctx.origin}${publicPath}`,title=published.seoTitle||`${published.title} — ${ctx.settings?.siteName||'Mahmudul Hassan'}`,description=(published.seoDescription||`Explore ${published.title} by ${ctx.settings?.siteName||'Mahmudul Hassan'}.`).slice(0,300),image=absolute(published.ogImage,ctx.origin);
    let html=await fs.readFile(path.join(frontend,'custom-page.html'),'utf8');
    html=replaceHead(html,metadataHtml({title,description,canonical,image,noIndex:published.noIndex||published.visibility==='UNLISTED',noFollow:published.noFollow,twitterCard:ctx.settings?.twitterCard,jsonLd:[{"@context":"https://schema.org","@type":"WebPage",name:published.title,description,url:canonical,dateModified:String(published.publicModifiedAt||page.publicModifiedAt||page.updatedAt),isPartOf:{"@id":ctx.websiteId}}]}));
    const bootstrap={page:{...published,blocks},dynamic:data,trustedOrigins:origins,navigationPreset,editor:false,device:'desktop'};
    const script=`<script>window.__PAGE_STUDIO_BOOTSTRAP__=${JSON.stringify(bootstrap).replace(/</g,'\\u003c')}</script>`;
    html=html.replace('<!--PAGE_STUDIO_BOOTSTRAP-->',script);res.type('html').send(html);
  }catch(error){next(error)}
}

router.get('/status',async(_req,res)=>{const {config}=await state();res.json({systemEnabled:pageStudioSystemEnabled(),publicEnabled:pageStudioSystemEnabled()&&config.publicEnabled,customPathsEnabled:config.customPathsEnabled})});
router.get('/data',async(_req,res)=>{if(!(await publicStudioEnabled()))return res.status(404).json({error:'Page Studio public pages are disabled.'});const [data,origins,navigationPreset]=await Promise.all([dynamicData(),trustedOrigins(),db.navigationPreset.findFirst({where:{enabled:true,isGlobal:true}})]);res.json({dynamic:data,trustedOrigins:origins,navigationPreset})});
router.get('/pages/:slug',async(req,res)=>{if(!(await publicStudioEnabled()))return res.status(404).json({error:'Page Studio public pages are disabled.'});const page=await db.customPage.findFirst({where:{slug:req.params.slug,deletedAt:null,status:'PUBLISHED'},include:{taxonomy:{include:{term:true}}}});if(!page||!page.publishedSnapshot)return res.status(404).json({error:'Page not found.'});const masters=await db.reusableBlock.findMany({where:{active:true}}),published=page.publishedSnapshot as any,scheduledAt=published.scheduledAt?new Date(published.scheduledAt):null;if(!['PUBLIC','UNLISTED'].includes(published.visibility)||scheduledAt&&scheduledAt>new Date())return res.status(404).json({error:'Page not found.'});res.json({page:{...published,blocks:resolveGlobalBlocks(studioBlocksSchema.parse(published.blocks),masters)}})});

export default router;
