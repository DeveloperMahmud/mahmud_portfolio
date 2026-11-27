import { Prisma } from '@prisma/client';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreativeToolRedirectError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'CreativeToolRedirectError';
  }
}

type PreserveCreativeToolRedirectInput = {
  toolId: string;
  previousPublishedSlug: string | null;
  nextPublishedSlug: string;
};

export async function preserveCreativeToolSlugRedirect(
  tx: Prisma.TransactionClient,
  input: PreserveCreativeToolRedirectInput
) {
  const previous = input.previousPublishedSlug;
  const next = input.nextPublishedSlug;
  if (!previous || previous === next) return null;
  if (!slugPattern.test(previous) || !slugPattern.test(next)) {
    throw new CreativeToolRedirectError('INVALID_SLUG_REDIRECT', 'The previous or next Creative Lab slug is invalid.');
  }

  const redirectPairs=[
    {sourcePath:`/creative-lab/${previous}`,destination:`/creative-lab/${next}`},
    {sourcePath:`/creative-lab/${previous}/demo`,destination:`/creative-lab/${next}/demo`}
  ];

  const [claimedTool, relatedRules] = await Promise.all([
    tx.creativeTool.findFirst({
      where: {
        id: { not: input.toolId },
        deletedAt: null,
        OR: [{ slug: previous }, { publishedSlug: previous }, { publishedSlug: next }]
      },
      select: { id: true }
    }),
    tx.redirectRule.findMany({
      where: {
        OR: [
          { sourcePath: { startsWith: '/creative-lab/' } },
          { destination: { startsWith: '/creative-lab/' } }
        ]
      },
      select: { id: true, sourcePath: true, destination: true, statusCode: true, enabled: true }
    })
  ]);

  if (claimedTool) {
    throw new CreativeToolRedirectError('SLUG_PATH_CONFLICT', 'The previous or next Creative Lab path is claimed by another tool.');
  }
  for(const pair of redirectPairs){
    const sourceRule=relatedRules.find(rule=>rule.sourcePath===pair.sourcePath),destinationRule=relatedRules.find(rule=>rule.sourcePath===pair.destination);
    if(sourceRule&&sourceRule.destination!==pair.destination)throw new CreativeToolRedirectError('REDIRECT_SOURCE_CONFLICT','The previous Creative Lab path already has a different redirect.');
    if(destinationRule)throw new CreativeToolRedirectError('REDIRECT_CHAIN_CONFLICT','The new canonical Creative Lab path is already a redirect source.');
  }

  const results=[];
  let flattenedCount=0;
  for(const {sourcePath,destination} of redirectPairs){
    const sourceRule=relatedRules.find(rule=>rule.sourcePath===sourcePath),aliases=new Set<string>(),pending=[sourcePath];
    while(pending.length){
      const target=pending.pop()!;
      for(const rule of relatedRules.filter(candidate=>candidate.destination===target&&candidate.sourcePath!==sourcePath)){
        if(!rule.sourcePath.startsWith('/creative-lab/'))throw new CreativeToolRedirectError('REDIRECT_CHAIN_CONFLICT','A non-Creative-Lab redirect targets the previous public path.');
        if(!aliases.has(rule.sourcePath)){aliases.add(rule.sourcePath);pending.push(rule.sourcePath)}
      }
    }
    const flattenedRuleIds=relatedRules.filter(rule=>aliases.has(rule.sourcePath)).map(rule=>rule.id);
    if(flattenedRuleIds.length)await tx.redirectRule.updateMany({where:{id:{in:flattenedRuleIds}},data:{destination}});
    flattenedCount+=flattenedRuleIds.length;
    const rule=sourceRule
      ?await tx.redirectRule.update({where:{id:sourceRule.id},data:{destination,statusCode:301,enabled:true,reason:'Automatic redirect after published Creative Tool slug change'}})
      :await tx.redirectRule.create({data:{sourcePath,destination,statusCode:301,enabled:true,reason:'Automatic redirect after published Creative Tool slug change'}});
    results.push(rule);
  }
  return {rule:results[0],rules:results,flattenedCount};
}
