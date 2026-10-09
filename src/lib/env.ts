const insecureSecrets=new Set(['','replace-with-a-long-random-secret','dev-only-secret-change-me','change-me']);

export function validateEnvironment(){
  const production=process.env.NODE_ENV==='production';
  const missing:string[]=[];
  if(!process.env.DATABASE_URL?.trim())missing.push('DATABASE_URL');
  const jwt=process.env.JWT_SECRET?.trim()||'';
  if(production&&(insecureSecrets.has(jwt)||jwt.length<32))missing.push('JWT_SECRET (at least 32 random characters)');
  if(production&&!process.env.BLOB_READ_WRITE_TOKEN?.trim())missing.push('BLOB_READ_WRITE_TOKEN');
  if(missing.length)throw new Error(`Required production configuration is missing or unsafe: ${missing.join(', ')}`);
  return {optional:{email:Boolean(process.env.RESEND_API_KEY&&process.env.RESEND_FROM_EMAIL),durableMedia:Boolean(process.env.BLOB_READ_WRITE_TOKEN||process.env.S3_BUCKET||process.env.GITHUB_TOKEN),errorMonitoring:process.env.ERROR_MONITORING_ENABLED==='true'&&Boolean(process.env.SENTRY_DSN),indexNow:Boolean(process.env.INDEXNOW_KEY),searchConsole:Boolean(process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID&&process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN)}};
}
