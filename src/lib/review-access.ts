import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Request,Response } from 'express';

export const REVIEW_COOKIE='mh_review_session';
const secret=()=>{const value=process.env.JWT_SECRET?.trim();if(!value)throw new Error('JWT_SECRET is required for review sessions');return value};
export const newReviewToken=()=>crypto.randomBytes(32).toString('base64url');
export const hashReviewToken=(token:string)=>crypto.createHash('sha256').update(token).digest('hex');
export type ReviewSession={sub:string;workspaceId:string;canComment:boolean;canDecide:boolean;exp:number};
export function setReviewSession(res:Response,input:Omit<ReviewSession,'exp'>,expiresAt:Date){
  const seconds=Math.max(60,Math.min(7*86400,Math.floor((expiresAt.getTime()-Date.now())/1000)));
  const token=jwt.sign(input,secret(),{expiresIn:seconds});
  res.cookie(REVIEW_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/api/public/reviews',maxAge:seconds*1000});
}
export function readReviewSession(req:Request){const token=req.cookies?.[REVIEW_COOKIE];if(!token)return null;try{return jwt.verify(token,secret()) as ReviewSession}catch{return null}}
export function clearReviewSession(res:Response){res.clearCookie(REVIEW_COOKIE,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/api/public/reviews'})}
