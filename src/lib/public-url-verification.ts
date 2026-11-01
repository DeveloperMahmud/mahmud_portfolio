import { lookup } from 'node:dns/promises';
import https from 'node:https';
import { isIP } from 'node:net';

export class PublicUrlVerificationError extends Error {
  constructor(public readonly code:string,message:string){super(message)}
}

function publicIpv4(address:string){
  const p=address.split('.').map(Number);if(p.length!==4||p.some(x=>!Number.isInteger(x)||x<0||x>255))return false;
  const [a,b,c]=p;
  return !(a===0||a===10||a===127||a>=224||(a===100&&b>=64&&b<=127)||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&b===0&&c===0)||(a===192&&b===0&&c===2)||(a===192&&b===88&&c===99)||(a===192&&b===168)||(a===198&&b>=18&&b<=19)||(a===198&&b===51&&c===100)||(a===203&&b===0&&c===113));
}

function publicIp(address:string){
  const family=isIP(address);
  if(family===4)return publicIpv4(address);
  if(family!==6)return false;
  const lower=address.toLowerCase();
  const mapped=lower.match(/(?:^|:)ffff:(\d+\.\d+\.\d+\.\d+)$/);if(mapped)return publicIpv4(mapped[1]);
  const first=parseInt(lower.split(':')[0]||'0',16);
  return first>=0x2000&&first<=0x3fff&&!lower.startsWith('2001:db8:');
}

async function pinnedAddress(url:URL){
  if(url.protocol!=='https:'||url.username||url.password||url.hash)throw new PublicUrlVerificationError('INVALID_URL','Use a public HTTPS URL without credentials or a fragment.');
  const host=url.hostname.toLowerCase();
  if(host==='localhost'||host.endsWith('.localhost')||host.endsWith('.local'))throw new PublicUrlVerificationError('PRIVATE_DESTINATION','Local and private destinations cannot be verified.');
  let addresses;
  try{addresses=await lookup(host,{all:true,verbatim:true})}catch{throw new PublicUrlVerificationError('DNS_FAILED','The live URL hostname could not be resolved.');}
  if(!addresses.length||addresses.some(item=>!publicIp(item.address)))throw new PublicUrlVerificationError('PRIVATE_DESTINATION','The live URL resolves to a private or reserved network address.');
  return addresses[0];
}

function request(url:URL,address:{address:string;family:number},method:'HEAD'|'GET',timeoutMs:number,maxBytes:number){
  return new Promise<{status:number;location:string|null} >((resolve,reject)=>{
    let bytes=0,settled=false;
    const finish=(error?:Error,value?:{status:number;location:string|null})=>{if(settled)return;settled=true;error?reject(error):resolve(value!)};
    const req=https.request(url,{method,headers:{'User-Agent':'Mahmudul-Portfolio-Link-Validator/1.0','Accept':'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1',...(method==='GET'?{'Range':`bytes=0-${Math.min(maxBytes-1,65535)}`}:{})},lookup:(_host,_options,callback)=>callback(null,address.address,address.family as 4|6)},res=>{
      const status=res.statusCode||0,location=res.headers.location||null;
      res.on('data',chunk=>{bytes+=Buffer.byteLength(chunk);if(bytes>maxBytes){req.destroy();finish(new PublicUrlVerificationError('RESPONSE_TOO_LARGE','The verification response exceeded the safe inspection limit.'));}});
      res.on('end',()=>finish(undefined,{status,location}));
      res.on('error',error=>finish(error));
      if(method==='HEAD')res.resume();
    });
    req.setTimeout(Math.max(250,timeoutMs),()=>{req.destroy();finish(new PublicUrlVerificationError('TIMEOUT','The live URL did not respond within the verification timeout.'));});
    req.on('error',error=>finish(error));req.end();
  });
}

export async function verifyPublicHttpsUrl(input:string,options:{timeoutMs?:number;maxRedirects?:number;maxBytes?:number}={}){
  const timeoutMs=Math.min(15000,Math.max(1000,options.timeoutMs||8000)),maxRedirects=Math.min(5,Math.max(0,options.maxRedirects??3)),maxBytes=Math.min(262144,Math.max(1024,options.maxBytes||65536)),deadline=Date.now()+timeoutMs;
  let current:URL;try{current=new URL(input)}catch{throw new PublicUrlVerificationError('INVALID_URL','The live URL is invalid.');}
  for(let redirects=0;redirects<=maxRedirects;redirects++){
    const remaining=deadline-Date.now();if(remaining<=0)throw new PublicUrlVerificationError('TIMEOUT','The live URL verification timed out.');
    const address=await pinnedAddress(current);
    let result=await request(current,address,'HEAD',remaining,maxBytes);
    if(result.status===405||result.status===501)result=await request(current,address,'GET',deadline-Date.now(),maxBytes);
    if(result.status>=300&&result.status<400&&result.location){
      if(redirects===maxRedirects)throw new PublicUrlVerificationError('TOO_MANY_REDIRECTS','The live URL redirected too many times.');
      current=new URL(result.location,current);continue;
    }
    if(result.status<200||result.status>=400)throw new PublicUrlVerificationError('UNHEALTHY_STATUS',`The live URL responded with HTTP ${result.status}.`);
    return {ok:true as const,status:result.status,finalUrl:current.href,redirects,verifiedAddressFamily:address.family};
  }
  throw new PublicUrlVerificationError('TOO_MANY_REDIRECTS','The live URL redirected too many times.');
}
