export function productionOrigin() {
  const configured = process.env.APP_ORIGIN?.trim().replace(/\/$/, '');
  if (configured) return configured;
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelHost) return `https://${vercelHost.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
  return `http://localhost:${process.env.PORT || 8787}`;
}

export function allowedOrigins() {
  const origins = new Set([productionOrigin()]);
  for(const host of [process.env.VERCEL_URL,process.env.VERCEL_BRANCH_URL])if(host?.trim())origins.add(`https://${host.replace(/^https?:\/\//,'').replace(/\/$/,'')}`);
  if (process.env.NODE_ENV !== 'production') {
    origins.add(`http://localhost:${process.env.PORT || 8787}`);
    origins.add('http://localhost:3000');
  }
  return origins;
}
