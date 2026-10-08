import { db } from './db.js';

function cleanHeader(value:string){return value.replace(/[\r\n]+/g,' ').trim().slice(0,180)}

export async function sendInquiryNotification(inquiry:{id:string;name:string;email:string;service?:string|null;budget?:string|null;timeline?:string|null;message:string},retryDeliveryId?:string){
  const settings=await db.siteSettings.findFirst();
  const recipient=process.env.INQUIRY_NOTIFICATION_EMAIL||settings?.inquiryRecipientEmail||settings?.email;
  const apiKey=process.env.RESEND_API_KEY,fromEmail=process.env.RESEND_FROM_EMAIL;
  const max=Math.max(1,Math.min(5,Number(process.env.EMAIL_RETRY_MAX_ATTEMPTS)||3));
  const delivery=retryDeliveryId?await db.emailDelivery.findUnique({where:{id:retryDeliveryId}}):await db.emailDelivery.create({data:{inquiryId:inquiry.id,type:'ADMIN_NOTIFICATION',provider:apiKey?'RESEND':null,status:apiKey&&fromEmail&&recipient?'QUEUED':'NOT_REQUESTED'}});
  if(!delivery)return {sent:false,status:'FAILED_PERMANENT',error:'Delivery record not found'};
  if(!apiKey||!fromEmail||!recipient)return {sent:false,status:'NOT_REQUESTED',deliveryId:delivery.id,error:'Email provider is not configured.'};
  if(delivery.attemptCount>=max)return {sent:false,status:'FAILED_PERMANENT',deliveryId:delivery.id,error:'Retry limit reached.'};
  try{
    const fromName=cleanHeader(process.env.RESEND_FROM_NAME||settings?.siteName||'Portfolio Website');
    const subject=cleanHeader((settings?.inquirySubject||'New project inquiry — {name}').replaceAll('{name}',inquiry.name).replaceAll('{service}',inquiry.service||'General'));
    const body=[`New project inquiry from ${inquiry.name}`,`Email: ${inquiry.email}`,`Service: ${inquiry.service||'—'}`,`Budget: ${inquiry.budget||'—'}`,`Timeline: ${inquiry.timeline||'—'}`,'',inquiry.message].join('\n');
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from:`${fromName} <${fromEmail}>`,to:[recipient],reply_to:inquiry.email,subject,text:body}),signal:AbortSignal.timeout(8000)});
    const payload=await response.json().catch(()=>({})) as {id?:string;message?:string};
    if(!response.ok){const temporary=response.status===429||response.status>=500;const attempts=delivery.attemptCount+1;const status=temporary&&attempts<max?'FAILED_TEMPORARY':'FAILED_PERMANENT';await db.emailDelivery.update({where:{id:delivery.id},data:{status,attemptCount:attempts,lastErrorCode:`HTTP_${response.status}`,nextRetryAt:status==='FAILED_TEMPORARY'?new Date(Date.now()+Math.min(3600000,60000*2**attempts)):null}});return {sent:false,status,deliveryId:delivery.id,error:payload.message||`Provider returned ${response.status}`};}
    await db.emailDelivery.update({where:{id:delivery.id},data:{status:'SENT',attemptCount:{increment:1},providerId:payload.id||null,lastErrorCode:null,nextRetryAt:null}});
    return {sent:true,status:'SENT',deliveryId:delivery.id,providerId:payload.id};
  }catch(error){const attempts=delivery.attemptCount+1,status=attempts<max?'FAILED_TEMPORARY':'FAILED_PERMANENT';await db.emailDelivery.update({where:{id:delivery.id},data:{status,attemptCount:attempts,lastErrorCode:'NETWORK_ERROR',nextRetryAt:status==='FAILED_TEMPORARY'?new Date(Date.now()+Math.min(3600000,60000*2**attempts)):null}});return {sent:false,status,deliveryId:delivery.id,error:error instanceof Error?error.message:'Email request failed'};}
}
