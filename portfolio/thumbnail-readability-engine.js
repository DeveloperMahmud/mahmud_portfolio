(()=>{
  'use strict';

  const MAX_BYTES=12*1024*1024;
  const MAX_DIMENSION=12000;
  const MAX_PIXELS=40_000_000;
  const PREVIEW_SIZES=Object.freeze([80,120,160]);
  const ALLOWED_TYPES=Object.freeze(['image/png','image/jpeg','image/webp']);

  const validateFile=file=>{
    if(!file||!ALLOWED_TYPES.includes(file.type))return'Use a PNG, JPEG or WebP image.';
    if(file.size>MAX_BYTES)return'This image is over the 12 MB local processing limit.';
    return'';
  };

  const validateDimensions=(width,height)=>{
    if(!Number.isFinite(width)||!Number.isFinite(height)||width<1||height<1)return'The image dimensions are invalid.';
    if(width>MAX_DIMENSION||height>MAX_DIMENSION)return'Image dimensions exceed the 12,000 px safety limit.';
    if(width*height>MAX_PIXELS)return'This image exceeds the 40-megapixel local processing limit.';
    return'';
  };

  const inspect=(imageData,sourceWidth,sourceHeight)=>{
    const {data,width,height}=imageData||{};
    if(!data||!width||!height)throw new Error('Pixel data is unavailable.');
    const luminance=new Float32Array(width*height);
    let sum=0;
    for(let pixel=0,index=0;pixel<data.length;pixel+=4,index+=1){
      const value=.2126*data[pixel]+.7152*data[pixel+1]+.0722*data[pixel+2];
      luminance[index]=value;
      sum+=value;
    }
    const mean=sum/luminance.length;
    let variance=0,edges=0,comparisons=0;
    for(let y=0;y<height;y+=1){
      for(let x=0;x<width;x+=1){
        const index=y*width+x;
        const difference=luminance[index]-mean;
        variance+=difference*difference;
        if(x+1<width){
          if(Math.abs(luminance[index]-luminance[index+1])>32)edges+=1;
          comparisons+=1;
        }
        if(y+1<height){
          if(Math.abs(luminance[index]-luminance[index+width])>32)edges+=1;
          comparisons+=1;
        }
      }
    }
    const luminanceSpread=Math.sqrt(variance/luminance.length);
    const edgeDensity=edges/Math.max(comparisons,1);
    return Object.freeze({
      width:sourceWidth,
      height:sourceHeight,
      luminanceSpread,
      edgeDensity,
      tonalLabel:luminanceSpread<28?'LOW':luminanceSpread<52?'MODERATE':'HIGH',
      detailLabel:edgeDensity<.08?'LOW':edgeDensity<.2?'MODERATE':'HIGH',
      previewFacts:PREVIEW_SIZES.map(size=>Object.freeze({
        size,
        scale:Math.min(size/sourceWidth,size/sourceHeight),
        requiresUpscaling:sourceWidth<size||sourceHeight<size
      }))
    });
  };

  const createReport=({name,analysis,selectedSize,checks,generatedAt=new Date().toISOString()})=>[
    'THUMBNAIL READABILITY REVIEW',
    `Generated locally: ${generatedAt}`,
    `Image: ${name}`,
    `Source dimensions: ${analysis.width} x ${analysis.height}px`,
    `Selected preview: ${selectedSize}px`,
    `Global luminance spread: ${analysis.luminanceSpread.toFixed(1)} (${analysis.tonalLabel})`,
    `Edge-density observation: ${(analysis.edgeDensity*100).toFixed(1)}% (${analysis.detailLabel})`,
    ...analysis.previewFacts.map(item=>`${item.size}px preview: ${item.requiresUpscaling?'requires upscaling':'downscales from source'} (${item.scale.toFixed(3)}x)`),
    '',
    `Human review completed: ${checks.filter(item=>item.checked).length} of ${checks.length}`,
    ...checks.map(item=>`${item.checked?'[x]':'[ ]'} ${item.label}`),
    '',
    'Method: luminance spread is the standard deviation of downsampled pixel luminance. Edge density is the share of adjacent sampled pixels whose luminance differs by more than 32.',
    'Limit: these whole-image observations do not run OCR, identify products, certify Amazon compliance, validate claims or predict performance.'
  ].join('\n');

  globalThis.ThumbnailReadabilityEngine=Object.freeze({
    MAX_BYTES,
    MAX_DIMENSION,
    MAX_PIXELS,
    PREVIEW_SIZES,
    validateFile,
    validateDimensions,
    inspect,
    createReport
  });
})();
