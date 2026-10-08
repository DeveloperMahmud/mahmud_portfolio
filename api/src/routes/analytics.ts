import { Router, type Request } from 'express';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { db } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';

const publicAnalytics = Router();
const adminAnalytics = Router();
adminAnalytics.use(requireAuth);

const eventTypes = ['page_view','project_view','cta_click','contact_view','form_start','inquiry_submit_success','external_project_click','slider_project_open','featured_slider_view','featured_slider_change','featured_slider_project_open','project_next_click','social_link_click','download_cv','engagement'] as const;
const eventSchema = z.object({
  eventType: z.enum(eventTypes),
  path: z.string().min(1).max(500),
  pageTitle: z.string().max(180).optional(),
  projectId: z.string().max(80).optional(),
  visitorId: z.string().min(16).max(128),
  sessionId: z.string().min(16).max(128),
  engagementMs: z.number().int().min(0).max(30 * 60 * 1000).optional(),
  ctaId: z.string().max(80).optional(),
  targetType: z.enum(['contact','project','external','social','download','navigation']).optional(),
  sourceContext: z.enum(['hero','slider','project','archive','journal','contact','navigation','footer']).optional()
}).strict();

function enabled() { return process.env.ANALYTICS_ENABLED === 'true' && (process.env.ANALYTICS_SALT?.trim().length || 0) >= 16; }
function localHost(req: Request) { return ['localhost','127.0.0.1','::1'].includes(req.hostname.toLowerCase()); }
function normalizePath(value: string) { try { const url=new URL(value,'https://portfolio.local'); return (`/${url.pathname}`).replace(/\/{2,}/g,'/').replace(/\/$/,'') || '/'; } catch { return '/'; } }
function excludedPath(path: string) { return path.startsWith('/admin') || path.startsWith('/api') || path.startsWith('/health') || path.startsWith('/share/'); }
function hash(value: string) { return createHash('sha256').update(`${process.env.ANALYTICS_SALT}:${value}`).digest('hex'); }
function device(ua: string) { return /tablet|ipad/i.test(ua) ? 'TABLET' : /mobile|android|iphone/i.test(ua) ? 'MOBILE' : 'DESKTOP'; }
function bot(ua: string) { return /bot|crawler|spider|headless|preview|lighthouse|uptime|monitor|facebookexternalhit|slurp/i.test(ua); }
function referrer(req: Request) { try { const value=req.get('referer'); return value ? new URL(value).hostname.toLowerCase().replace(/^www\./,'').slice(0,180) : null; } catch { return null; } }
function source(host: string | null) { if(!host)return 'DIRECT'; if(/google|bing|duckduckgo|yahoo/.test(host))return 'SEARCH'; if(/linkedin|behance|dribbble|instagram|facebook|x\.com|twitter/.test(host))return 'SOCIAL'; return 'REFERRAL'; }

publicAnalytics.get('/config', (req,res)=>res.json({enabled:enabled() && (!localHost(req) || process.env.ANALYTICS_TRACK_LOCAL === 'true'),respectDnt:true}));
publicAnalytics.post('/events', async (req,res) => {
  if(!enabled()) return res.status(202).json({ok:true,tracked:false,reason:'disabled'});
  if(localHost(req) && process.env.ANALYTICS_TRACK_LOCAL !== 'true') return res.status(202).json({ok:true,tracked:false,reason:'local'});
  if(req.get('dnt') === '1' || req.get('sec-gpc') === '1') return res.status(202).json({ok:true,tracked:false,reason:'privacy'});
  if(req.cookies?.mh_admin_session) return res.status(202).json({ok:true,tracked:false,reason:'admin'});
  const ua=(req.get('user-agent')||'').slice(0,500);
  if(bot(ua)) return res.status(202).json({ok:true,tracked:false,reason:'bot'});
  const parsed=eventSchema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({error:'Invalid analytics event'});
  const path=normalizePath(parsed.data.path);
  if(excludedPath(path)) return res.status(202).json({ok:true,tracked:false,reason:'excluded'});
  let projectId:string|undefined;
  if(parsed.data.projectId){const exists=await db.project.findUnique({where:{id:parsed.data.projectId},select:{id:true}});projectId=exists?.id;}
  const host=referrer(req);
  const country=(req.get('x-vercel-ip-country')||req.get('cf-ipcountry')||'').toUpperCase();
  const metadata={...(parsed.data.ctaId?{ctaId:parsed.data.ctaId}:{}),...(parsed.data.targetType?{targetType:parsed.data.targetType}:{}),...(parsed.data.sourceContext?{sourceContext:parsed.data.sourceContext}:{})};
  await db.analyticsEvent.create({data:{eventType:parsed.data.eventType,path,normalizedPath:path,pageTitle:parsed.data.pageTitle||null,projectId,visitorHash:hash(parsed.data.visitorId),sessionHash:hash(parsed.data.sessionId),referrerHost:host,source:source(host),deviceType:device(ua),countryCode:/^[A-Z]{2}$/.test(country)?country:null,engagementMs:parsed.data.engagementMs||0,metadata:metadata as Prisma.InputJsonValue}});
  res.status(202).json({ok:true,tracked:true});
});

const rangeSchema=z.object({from:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),to:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),days:z.coerce.number().int().min(1).max(366).optional()});
function range(query:unknown){const p=rangeSchema.safeParse(query);if(!p.success)throw new Error('Use valid from/to dates or days (1-366).');const now=new Date();const to=p.data.to?new Date(`${p.data.to}T23:59:59.999Z`):now;const from=p.data.from?new Date(`${p.data.from}T00:00:00.000Z`):new Date(to.getTime()-((p.data.days||30)-1)*86400000);if(from>to||to.getTime()-from.getTime()>366*86400000)throw new Error('Date range must be between 1 and 366 days.');const span=to.getTime()-from.getTime()+1;return{from,to,previousFrom:new Date(from.getTime()-span),previousTo:new Date(from.getTime()-1)}}
const pct=(current:number,previous:number)=>({current,previous,change:previous===0?(current===0?0:null):Math.round(((current-previous)/previous)*1000)/10,state:previous===0&&current>0?'new':'comparable'});
const unique=(rows:{visitorHash:string|null}[])=>new Set(rows.map(x=>x.visitorHash).filter(Boolean)).size;
const sessions=(rows:{sessionHash:string|null}[])=>new Set(rows.map(x=>x.sessionHash).filter(Boolean)).size;
const round=(n:number,d=1)=>Number(n.toFixed(d));
type EventRow=Awaited<ReturnType<typeof db.analyticsEvent.findMany>>[number];

async function report(query:unknown){
  const r=range(query);const cap=100001;
  const rows=await db.analyticsEvent.findMany({where:{occurredAt:{gte:r.previousFrom,lte:r.to}},orderBy:{occurredAt:'asc'},take:cap,include:{project:{select:{title:true,slug:true}}}});
  const partial=rows.length===cap;const current=rows.filter(x=>x.occurredAt>=r.from);const previous=rows.filter(x=>x.occurredAt<r.from);
  const [inquiries,previousInquiries,statuses]=await Promise.all([db.inquiry.count({where:{createdAt:{gte:r.from,lte:r.to}}}),db.inquiry.count({where:{createdAt:{gte:r.previousFrom,lte:r.previousTo}}}),db.inquiry.groupBy({by:['status'],where:{createdAt:{gte:r.from,lte:r.to}},_count:{_all:true}})]);
  const summarize=(list:EventRow[],iq:number)=>{const visitors=unique(list),sessionCount=sessions(list),pageViews=list.filter(x=>x.eventType==='page_view').length,projectViews=list.filter(x=>x.eventType==='project_view').length;return{visitors,sessions:sessionCount,pageViews,projectViews,avgPagesPerSession:sessionCount?round(pageViews/sessionCount,2):0,inquiries:iq,conversionRate:visitors?round(iq/visitors*100,2):0}};
  const currentSummary=summarize(current,inquiries),previousSummary=summarize(previous,previousInquiries);
  const comparisons=Object.fromEntries(Object.keys(currentSummary).map(k=>[k,pct(currentSummary[k as keyof typeof currentSummary],previousSummary[k as keyof typeof previousSummary])]));
  const dayMap=new Map<string,{date:string;visitors:Set<string>;sessions:Set<string>;pageViews:number;projectViews:number;inquiries:number}>();
  for(const row of current){const key=row.occurredAt.toISOString().slice(0,10);const item=dayMap.get(key)||{date:key,visitors:new Set(),sessions:new Set(),pageViews:0,projectViews:0,inquiries:0};if(row.visitorHash)item.visitors.add(row.visitorHash);if(row.sessionHash)item.sessions.add(row.sessionHash);if(row.eventType==='page_view')item.pageViews++;if(row.eventType==='project_view')item.projectViews++;dayMap.set(key,item)}
  const inquiryDates=await db.inquiry.findMany({where:{createdAt:{gte:r.from,lte:r.to}},select:{createdAt:true}});for(const iq of inquiryDates){const key=iq.createdAt.toISOString().slice(0,10);const item=dayMap.get(key)||{date:key,visitors:new Set(),sessions:new Set(),pageViews:0,projectViews:0,inquiries:0};item.inquiries++;dayMap.set(key,item)}
  const timeseries=[...dayMap.values()].sort((a,b)=>a.date.localeCompare(b.date)).map(x=>({date:x.date,visitors:x.visitors.size,sessions:x.sessions.size,pageViews:x.pageViews,projectViews:x.projectViews,inquiries:x.inquiries}));
  function groups(key:(row:EventRow)=>string|null,filter?:(row:EventRow)=>boolean){const map=new Map<string,{value:string;views:number;visitors:Set<string>;engagement:number}>();for(const row of current){if(filter&&!filter(row))continue;const value=key(row);if(!value)continue;const item=map.get(value)||{value,views:0,visitors:new Set(),engagement:0};item.views++;if(row.visitorHash)item.visitors.add(row.visitorHash);item.engagement+=row.engagementMs;map.set(value,item)}return [...map.values()].sort((a,b)=>b.views-a.views).slice(0,25).map(x=>({value:x.value,views:x.views,visitors:x.visitors.size,avgEngagementMs:x.views?Math.round(x.engagement/x.views):0}))}
  const projectGroups=new Map<string,{projectId:string;title:string;slug:string;views:number;visitors:Set<string>;engagement:number;inquiryAssists:number}>();for(const row of current.filter(x=>x.projectId)){const key=row.projectId!;const item=projectGroups.get(key)||{projectId:key,title:row.project?.title||'Deleted project',slug:row.project?.slug||'',views:0,visitors:new Set(),engagement:0,inquiryAssists:0};if(row.eventType==='project_view')item.views++;if(row.visitorHash)item.visitors.add(row.visitorHash);item.engagement+=row.engagementMs;if(row.eventType==='inquiry_submit_success')item.inquiryAssists++;projectGroups.set(key,item)}
  const projects=[...projectGroups.values()].sort((a,b)=>b.views-a.views).slice(0,25).map(x=>({...x,visitors:x.visitors.size,avgEngagementMs:x.views?Math.round(x.engagement/x.views):0}));
  const statusCount=Object.fromEntries(statuses.map(x=>[x.status,x._count._all]));
  return{enabled:true,partial,range:{from:r.from.toISOString(),to:r.to.toISOString(),timezone:'UTC'},overview:currentSummary,comparisons,timeseries,projects,pages:groups(x=>x.normalizedPath,x=>x.eventType==='page_view'),referrers:groups(x=>x.referrerHost),sources:groups(x=>x.source),devices:groups(x=>x.deviceType),countries:groups(x=>x.countryCode),funnel:{contactViews:current.filter(x=>x.eventType==='contact_view').length,formStarts:current.filter(x=>x.eventType==='form_start').length,submissions:inquiries,qualified:statusCount.QUALIFIED||0,won:statusCount.WON||0}};
}

adminAnalytics.get('/report',async(req,res)=>{if(!enabled())return res.json({enabled:false,reason:'Set ANALYTICS_ENABLED=true and a 16+ character ANALYTICS_SALT.'});try{res.json(await report(req.query))}catch(e){res.status(400).json({error:e instanceof Error?e.message:'Invalid analytics request'})}});
for(const section of ['overview','timeseries','projects','pages','referrers','devices','countries','funnel'] as const){adminAnalytics.get(`/${section}`,async(req,res)=>{if(!enabled())return res.json({enabled:false});try{const data=await report(req.query);res.json({enabled:true,range:data.range,partial:data.partial,[section]:data[section]})}catch(e){res.status(400).json({error:e instanceof Error?e.message:'Invalid analytics request'})}})}
adminAnalytics.post('/aggregate',async(req,res)=>{if(!enabled())return res.status(409).json({error:'Analytics is disabled'});try{const data=await report(req.body||{});const dateRows=data.timeseries.map(x=>({date:new Date(`${x.date}T00:00:00.000Z`),dimensionType:'OVERALL',dimensionValue:'ALL',uniqueVisitors:BigInt(x.visitors),sessions:BigInt(x.sessions),pageViews:BigInt(x.pageViews),projectViews:BigInt(x.projectViews),inquiries:BigInt(x.inquiries)}));for(const row of dateRows)await db.analyticsDaily.upsert({where:{date_dimensionType_dimensionValue:{date:row.date,dimensionType:row.dimensionType,dimensionValue:row.dimensionValue}},create:row,update:row});res.json({ok:true,days:dateRows.length,partial:data.partial})}catch(e){res.status(400).json({error:e instanceof Error?e.message:'Aggregation failed'})}});
adminAnalytics.delete('/cleanup',async(req,res)=>{const confirm=z.object({confirm:z.literal('DELETE_EXPIRED_ANALYTICS')}).safeParse(req.body);if(!confirm.success)return res.status(400).json({error:'Confirmation phrase is required'});const days=Math.min(3650,Math.max(1,Number(process.env.ANALYTICS_RETENTION_DAYS||365)));const cutoff=new Date(Date.now()-days*86400000);const [events,daily]=await db.$transaction([db.analyticsEvent.deleteMany({where:{occurredAt:{lt:cutoff}}}),db.analyticsDaily.deleteMany({where:{date:{lt:cutoff}}})]);await db.activityLog.create({data:{action:'ANALYTICS_CLEANUP',entity:'ANALYTICS',label:`Deleted ${events.count} events and ${daily.count} aggregates older than ${days} days`}});res.json({ok:true,cutoff,deletedEvents:events.count,deletedDaily:daily.count})});

export { publicAnalytics, adminAnalytics };
