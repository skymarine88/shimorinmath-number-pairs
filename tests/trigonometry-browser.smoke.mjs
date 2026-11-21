import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';

const origin=process.env.TEST_ORIGIN || 'http://127.0.0.1:8765';
const root=origin+'/trigonometry/';
const screenshots='artifacts/trigonometry';
mkdirSync(screenshots,{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[];
async function usePage(width,height,path){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(path+': '+e.message));
  const response=await page.goto(root+path,{waitUntil:'networkidle'});
  assert.ok(response?.ok(),path+' returned '+response?.status());
  return page;
}
async function assertLight(page,canvasSelector=null){
  const style=await page.evaluate(()=>getComputedStyle(document.body).backgroundColor);
  assert.equal(style,'rgb(255, 255, 255)');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert.ok(overflow<=2,'Page has '+overflow+'px horizontal overflow');
  if(canvasSelector){
    const bg=await page.locator(canvasSelector).evaluate(el=>getComputedStyle(el).backgroundColor);
    assert.equal(bg,'rgb(251, 252, 253)');
  }
}
try{
  for(const size of [{width:1365,height:900,label:'desktop'},{width:390,height:844,label:'mobile'}]){
    const landing=await usePage(size.width,size.height,'');
    assert.equal(await landing.locator('a.trig-topic').count(),2);
    assert.ok(await landing.getByRole('heading',{name:'Тригонометрия',exact:true}).count());
    assert.equal(await landing.getByText('Разработчик:',{exact:false}).count(),0);
    await assertLight(landing);
    await landing.screenshot({path:screenshots+'/landing-'+size.label+'.png',fullPage:true});
    await landing.close();

    const circle=await usePage(size.width,size.height,'unit-circle.html');
    await assertLight(circle,'#cv');
    assert.equal(await circle.locator('.copyright').count(),0);
    await circle.locator('#btnModeMem').click();
    await circle.locator('#task').waitFor({state:'visible'});
    assert.ok((await circle.locator('#prompt').textContent())?.length>0);
    await circle.screenshot({path:screenshots+'/circle-'+size.label+'.png',fullPage:true});
    await circle.locator('#btnModeExam').click();
    await circle.locator('#examFrame').waitFor({state:'attached'});
    const frame=circle.frameLocator('#examFrame');
    await frame.locator('#btnStart').waitFor({state:'visible'});
    await frame.locator('#examTypeSel').selectOption('time');
    await frame.locator('#btnStart').click();
    assert.notEqual(await frame.locator('#timer').textContent(),'—');
    const examBackground=await frame.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor);
    const examCanvas=await frame.locator('#cv').evaluate(el=>getComputedStyle(el).backgroundColor);
    assert.equal(examBackground,'rgb(255, 255, 255)','Embedded assessment has a dark background');
    assert.equal(examCanvas,'rgb(251, 252, 253)','Embedded assessment canvas is not light');
    await frame.locator('.wrap').screenshot({path:screenshots+'/exam-'+size.label+'.png',animations:'disabled'});
    await circle.locator('#btnExamClose').click();
    assert.equal(await circle.locator('#examOverlay').getAttribute('aria-hidden'),'true');
    await circle.close();

    const reduction=await usePage(size.width,size.height,'reduction.html');
    await assertLight(reduction,'.svgwrap svg');
    assert.equal(await reduction.getByText('Разработчик:',{exact:false}).count(),0);
    assert.equal(await reduction.locator('.confetti').count(),0);
    assert.ok((await reduction.locator('#formula').textContent())?.length>1);
    await reduction.screenshot({path:screenshots+'/reduction-'+size.label+'.png',fullPage:true});
    await reduction.locator('#theoryBtn').click();
    assert.equal(await reduction.locator('#theoryOverlay').getAttribute('aria-hidden'),'false');
    await reduction.locator('#closeTheory').click();
    await reduction.locator('#modeSelect').selectOption('hard');
    assert.equal(await reduction.locator('body').getAttribute('class')?.then(x=>x.includes('hardMode')),true);
    await reduction.close();
  }
  assert.deepEqual(errors,[],'Uncaught browser exceptions');
  console.log('Trigonometry UI smoke: navigation, modes, timers, light canvases, mobile layouts PASS');
} finally {
  await browser.close();
}
