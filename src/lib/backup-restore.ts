const IMMUTABLE_UPDATE_FIELDS=new Set(['id','createdAt','updatedAt']);

export function normalizeBackupRow(row:Record<string,unknown>){
  return Object.fromEntries(Object.entries(row).map(([key,value])=>[
    key,
    key.endsWith('At')&&value!==null&&value!==undefined&&!(value instanceof Date)?new Date(String(value)):value
  ]));
}

export function restoreCreateData(row:Record<string,unknown>){
  return normalizeBackupRow(row);
}

export function restoreUpdateData(row:Record<string,unknown>){
  return Object.fromEntries(Object.entries(normalizeBackupRow(row)).filter(([key])=>!IMMUTABLE_UPDATE_FIELDS.has(key)));
}

export function assertMatchingIdentity(collection:string,backupRow:Record<string,unknown>,existing:Record<string,unknown>|null){
  if(existing&&backupRow.id&&existing.id&&backupRow.id!==existing.id){
    throw new Error(`${collection} contains an existing natural-key match with a different id. Restore stopped before writes.`);
  }
}
