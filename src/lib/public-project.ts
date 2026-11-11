type JsonRecord=Record<string,unknown>;

/**
 * Public Project APIs must never expose share credentials, deletion metadata or
 * private metric evidence. Keep the canonical Project record intact in the CMS
 * and remove private fields only at the public boundary.
 */
export function publicProjectDto<T extends JsonRecord>(project:T){
  const {
    accessTokenHash:_accessTokenHash,
    deletedBy:_deletedBy,
    deletedAt:_deletedAt,
    clientExpiresAt:_clientExpiresAt,
    ...safe
  }=project;
  const safeRecord=safe as JsonRecord;
  if(Array.isArray(safeRecord.resultMetrics))safeRecord.resultMetrics=safeRecord.resultMetrics.map(item=>{
    if(!item||typeof item!=='object'||Array.isArray(item))return item;
    const {sourceNote:_sourceNote,...metric}=item as JsonRecord;
    return metric;
  });
  return safeRecord;
}
