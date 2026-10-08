export function productionOrigin() {
  const configured = process.env.APP_ORIGIN?.trim().replace(/\/$/, '');
  if (configured) return configured;
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelHost) return `https://${vercelHost.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
  return `http://localhost:${process.env.PORT || 8787}`;
}

export function allowedOrigins() {
  const origins = new Set([productionOrigin()]);
  if (process.env.NODE_ENV !== 'production') {
    origins.add(`http://localhost:${process.env.PORT || 8787}`);
    origins.add('http://localhost:3000');
  }
  return origins;
}
