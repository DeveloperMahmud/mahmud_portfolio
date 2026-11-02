import {expect,test} from '@playwright/test';

for(const route of ['/','/hire.html','/studio.html','/creative-lab.html','/creative-tool.html','/widget-qa.html']){
  test(`${route} loads without horizontal overflow`,async({page})=>{
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(route,{waitUntil:'domcontentloaded'});
    await expect(page.locator('body')).toBeVisible();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    expect(errors).toEqual([]);
  });
}
