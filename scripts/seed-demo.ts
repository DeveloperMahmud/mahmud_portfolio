import { db } from '../src/lib/db.js';

const projects=[
['Premium A+ — Outdoor Hydration','premium-a-plus-outdoor-hydration','Amazon / E-commerce','A+ Content','PREMIUM A+','NorthPeak Outdoor','assets/demo-a-plus.svg',['assets/demo-a-plus.svg','assets/demo-listing.svg','assets/demo-brand.svg'],true,true,'AUTO',1],
['Amazon Listing — Smart Kitchen Tool','amazon-listing-smart-kitchen-tool','Amazon / E-commerce','Listing Images','LISTING IMAGES','Kitchena','assets/demo-listing.svg',['assets/demo-listing.svg','assets/demo-a-plus.svg','assets/demo-pack.svg'],true,true,'DIAGONAL',2],
['Brand Identity — Northline','brand-identity-northline','Branding / Graphic','Brand Identity','BRAND IDENTITY','Northline','assets/demo-brand.svg',['assets/demo-brand.svg','assets/demo-pack.svg','assets/demo-web.svg'],true,true,'SPLIT',3],
['Amazon Storefront — Home & Living','amazon-storefront-home-living','Amazon / E-commerce','Amazon Storefront','STOREFRONT','Haven & Home','assets/demo-store.svg',['assets/demo-store.svg','assets/demo-web.svg','assets/demo-a-plus.svg'],true,true,'CURTAIN',4],
['Product Motion — Launch Film','product-motion-launch-film','Video / Motion','Video Editing','VIDEO / MOTION','Forma Goods','assets/demo-motion.svg',['assets/demo-motion.svg','assets/demo-listing.svg','assets/demo-brand.svg'],true,true,'ZOOM',5],
['Landing Page — Product Launch','landing-page-product-launch','Web / Digital','Landing Page','LANDING PAGE','Aster Labs','assets/demo-web.svg',['assets/demo-web.svg','assets/demo-store.svg','assets/demo-motion.svg'],false,false,'AUTO',6],
['Electrical SLD — Commercial Building','electrical-sld-commercial-building','Engineering','Electrical SLD','ELECTRICAL SLD','Confidential','assets/demo-sld.svg',['assets/demo-sld.svg','assets/demo-web.svg'],false,false,'AUTO',7],
['Packaging System — Everyday Goods','packaging-system-everyday-goods','Branding / Graphic','Packaging','PACKAGING','Everyday Goods','assets/demo-pack.svg',['assets/demo-pack.svg','assets/demo-brand.svg','assets/demo-listing.svg'],false,false,'AUTO',8]
];
const bodies={
'premium-a-plus-outdoor-hydration':['Turn technical product benefits into a fast-scanning visual story.','Built a modular system with hero storytelling, feature callouts and comparison logic.'],
'amazon-listing-smart-kitchen-tool':['Communicate purchase reasons within a compact image sequence.','Combined clean product framing, feature graphics and lifestyle storytelling.'],
'brand-identity-northline':['Create a confident identity that scales across digital and physical touchpoints.','Established a restrained visual language with strong typography and repeatable layout rules.'],
'amazon-storefront-home-living':['Turn multiple product families into one coherent branded experience.','Created collection hierarchy, navigation cues and consistent visual modules.'],
'product-motion-launch-film':['Create a concise visual hook for social and product launch communication.','Used kinetic type, controlled pacing and product-focused compositions.'],
'landing-page-product-launch':['Balance brand expression with a clear conversion path.','Built a modular page rhythm with strong hierarchy and purposeful interaction.'],
'electrical-sld-commercial-building':['Present a complex electrical system in a readable technical format.','Applied disciplined notation, hierarchy and documentation structure.'],
'packaging-system-everyday-goods':['Keep multiple SKUs visually consistent while preserving hierarchy.','Developed a repeatable packaging grid, typography and information system.']
};
const contents=[
['How I Approach Amazon A+ Content','how-i-approach-amazon-a-plus-content','BLOG','Amazon / E-commerce','assets/demo-a-plus.svg','A practical look at turning product information into a clear visual story for Amazon A+ Content.'],
['Designing Listing Images That Communicate Fast','designing-listing-images-that-communicate-fast','ARTICLE','Amazon / E-commerce','assets/demo-listing.svg','Why listing images need a clear information hierarchy and how to avoid overcrowding product visuals.'],
['Creative Thinking, Technical Precision','creative-thinking-technical-precision','NOTE','Design','assets/demo-sld.svg','How an engineering mindset can influence the way a designer structures visual systems and technical information.'],
['From Product Information to Visual Story','from-product-information-to-visual-story','CASE STUDY','Design Process','assets/demo-brand.svg','A simple framework for turning specifications, features and product benefits into a structured visual narrative.']
];
for(const [title,slug,category,service,type,client,cover,gallery,featured,sliderEnabled,sliderTransition,sortOrder] of projects){const [challenge,approach]=bodies[slug as keyof typeof bodies];await db.project.upsert({where:{slug},create:{title,slug,category,service,type,client,year:2026,role:'Creative Designer',description:`Demo case study for ${title}.`,coverImage:cover,gallery:gallery.map((url,i)=>({url,alt:title,sortOrder:i})),challenge,approach,process:'Research → structure → visual direction → production → QA',deliverables:['Concept direction','Final visual system','Presentation-ready assets'],tools:['Figma','Photoshop','Illustrator'],featured,sliderEnabled,sliderTransition,sortOrder,status:'PUBLISHED',visibility:'PUBLIC'},update:{coverImage:cover,gallery:gallery.map((url,i)=>({url,alt:title,sortOrder:i})),featured,sliderEnabled,sliderTransition,sortOrder,status:'PUBLISHED',visibility:'PUBLIC'}})}
for(const [title,slug,type,category,cover,excerpt] of contents){await db.content.upsert({where:{slug},create:{title,slug,type,category,excerpt,body:`# ${title}\n\n${excerpt}\n\nGood design starts with clear information. I organize the product promise, supporting details and visual hierarchy before building the final creative system.`,coverImage:cover,tags:['design','portfolio','demo'],author:'Mahmudul Hassan',status:'PUBLISHED',featured:type==='BLOG',sortOrder:contents.findIndex(x=>x[1]===slug)+1,publishedAt:new Date()},update:{coverImage:cover,status:'PUBLISHED',publishedAt:new Date()}})}
console.log('Demo projects and content seeded.'); await db.$disconnect();
