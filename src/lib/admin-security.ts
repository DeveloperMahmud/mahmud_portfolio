import { db } from './db.js';

export type AdminSecurity={adminPath:string;hideCanonicalAdmin:boolean};
let cached:{expires:number;value:AdminSecurity}|null=null;

export async function readAdminSecurity():Promise<AdminSecurity>{
  if(cached&&cached.expires>Date.now())return cached.value;
  const settings=await db.siteSettings.findFirst({select:{securityConfig:true}});
  const config=(settings?.securityConfig&&typeof settings.securityConfig==='object'&&!Array.isArray(settings.securityConfig)?settings.securityConfig:{}) as Record<string,unknown>;
  const value={adminPath:String(config.adminPath||'/manage-portfolio'),hideCanonicalAdmin:config.hideCanonicalAdmin===true};
  cached={expires:Date.now()+60_000,value};
  return value;
}

export function updateAdminSecurityCache(value:AdminSecurity){cached={expires:Date.now()+60_000,value}}
