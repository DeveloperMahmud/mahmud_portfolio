(()=>{
  'use strict';

  const MAX_BYTES=12*1024*1024;
  const MAX_PIXELS=40_000_000;
  const ALLOWED_TYPES=Object.freeze(['image/png','image/jpeg','image/webp']);
  const normalizeHex=value=>/^#[0-9a-f]{6}$/i.test(String(value||''))?String(value).toUpperCase():null;
  const hexToRgb=value=>{
    const hex=normalizeHex(value);
    if(!hex)return null;
    return{r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)};
  };
  const channel=value=>{const normalized=value/255;return normalized<=.04045?normalized/12.92:((normalized+.055)/1.055)**2.4};
  const luminance=color=>.2126*channel(color.r)+.7152*channel(color.g)+.0722*channel(color.b);
  const contrastRatio=(foreground,background)=>{
    const foregroundColor=hexToRgb(foreground),backgroundColor=hexToRgb(background);
    if(!foregroundColor||!backgroundColor)throw new Error('Use complete six-digit hex colors.');
    const values=[luminance(foregroundColor),luminance(backgroundColor)].sort((a,b)=>b-a);
    return(values[0]+.05)/(values[1]+.05);
  };
  const assess=({foreground,background,fontSize=16,fontWeight=400})=>{
    const ratio=contrastRatio(foreground,background);
    const size=Number(fontSize),weight=Number(fontWeight);
    const large=size>=24||(size>=18.66&&weight>=700);
    return Object.freeze({ratio,large,aaThreshold:large?3:4.5,aaaThreshold:large?4.5:7,passesAA:ratio>=(large?3:4.5),passesAAA:ratio>=(large?4.5:7)});
  };
  const validateImage=(file,width,height)=>{
    if(!file||!ALLOWED_TYPES.includes(file.type))return'Use a PNG, JPEG or WebP image.';
    if(file.size>MAX_BYTES)return'This image is over the 12 MB local processing limit.';
    if(width&&height&&width*height>MAX_PIXELS)return'This image exceeds the 40-megapixel local processing limit.';
    return'';
  };
  const rgbToHex=(r,g,b)=>`#${[r,g,b].map(value=>Math.max(0,Math.min(255,Math.round(value))).toString(16).padStart(2,'0')).join('')}`.toUpperCase();
  const samplePixel=(imageData,x,y)=>{
    const safeX=Math.max(0,Math.min(imageData.width-1,Math.floor(x))),safeY=Math.max(0,Math.min(imageData.height-1,Math.floor(y))),index=(safeY*imageData.width+safeX)*4;
    return rgbToHex(imageData.data[index],imageData.data[index+1],imageData.data[index+2]);
  };
  const createReport=({foreground,background,fontSize,fontWeight,previewScale,assessment,samplingNote})=>[
    'TEXT CONTRAST REVIEW',
    `Generated locally: ${new Date().toISOString()}`,
    `Foreground: ${foreground}`,
    `Background: ${background}`,
    `Contrast ratio: ${assessment.ratio.toFixed(2)}:1`,
    `Text: ${fontSize}px / weight ${fontWeight} / ${assessment.large?'large-text threshold':'normal-text threshold'}`,
    `WCAG AA color-contrast threshold (${assessment.aaThreshold}:1): ${assessment.passesAA?'met':'not met'}`,
    `WCAG AAA color-contrast threshold (${assessment.aaaThreshold}:1): ${assessment.passesAAA?'met':'not met'}`,
    `Preview scale: ${previewScale}%`,
    `Color source: ${samplingNote||'manual color inputs'}`,
    '',
    'Limit: this color-pair calculation does not run OCR, locate text, evaluate typography or certify a flattened image or complete interface. Sample representative pixels and perform human review.'
  ].join('\n');

  globalThis.ContrastAnalyzerEngine=Object.freeze({MAX_BYTES,MAX_PIXELS,normalizeHex,contrastRatio,assess,validateImage,samplePixel,createReport});
})();
