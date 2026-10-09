import { PrismaClient } from '@prisma/client';

const globalForPrisma=globalThis as unknown as {portfolioPrisma?:PrismaClient};
export const db=globalForPrisma.portfolioPrisma??new PrismaClient();
if(process.env.NODE_ENV!=='production')globalForPrisma.portfolioPrisma=db;
