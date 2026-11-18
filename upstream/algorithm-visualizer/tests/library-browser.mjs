import {chromium} from '@playwright/test';import assert from 'node:assert/strict';
import {mkdtemp,mkdir,rm,writeFile} from 'node:fs/promises';import path from 'node:path';import os from 'node:os';
import {adtCategories,operations} from '../src/study/adtReference.mjs';
const temp=await mkdtemp(path.join(os.tmpdir(),'ds-library-'));process.env.DS_DATA_DIR=temp;
const {server}=await import('../study-server/server.mjs');await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'msedge',headless:true}),context=await browser.newContext({viewport:{width:1480,height:1000}});
await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:base});
const page=await context.newPage(),errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
await mkdir('../../artifacts',{recursive:true});
try{
  await page.goto(base+'/#/library');await page.locator('.adt-category').first().waitFor();
  assert.equal(await page.locator('.adt-category').count(),6);assert.equal(await page.locator('.adt-library pre').count(),0);
  await page.screenshot({path:'../../artifacts/adt-library-light.png',fullPage:true});checks.push('six clickable ADT categories without a header-code dump');
  await page.getByRole('link',{name:'查看顺序栈接口',exact:true}).focus();await page.keyboard.press('Enter');
  await page.getByRole('heading',{name:'顺序栈',exact:true}).waitFor();assert.equal(await page.locator('.adt-operation').count(),8);
  assert.equal(await page.locator('.adt-operation details[open]').count(),0);checks.push('keyboard category navigation opens collapsed interface cards');
  const pop=page.locator('#api-Pop');await pop.locator('.adt-usage>summary').click();
  await pop.getByText('接收元素的有效 int 变量地址，传 &value；仅在返回 OK 时读取。',{exact:true}).waitFor();
  assert.equal(await pop.locator('.adt-implementation').getAttribute('open'),null);
  await pop.getByRole('button',{name:'复制 Pop 调用示例'}).click();
  await pop.getByRole('status').waitFor();assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,'\n'),operations.Pop.example);
  checks.push('parameter direction, safe output contract and copyable example');
  await pop.locator('.adt-implementation>summary').click();assert.ok((await pop.locator('.adt-implementation code').textContent()).includes('s->data'));checks.push('only selected implementation expands');
  await page.getByRole('textbox',{name:'搜索当前 ADT 接口'}).fill('Pop');assert.equal(await page.locator('.adt-operation').count(),1);
  await page.getByRole('textbox',{name:'搜索当前 ADT 接口'}).fill('不存在');await page.getByRole('button',{name:'清空搜索',exact:true}).click();assert.equal(await page.locator('.adt-operation').count(),8);checks.push('interface search and empty-state recovery');
  await page.goBack();await page.getByRole('heading',{name:'ADT 接口库',exact:true}).waitFor();checks.push('browser back returns to category overview');
  for(const category of adtCategories){
    await page.goto(base+'/#/library/'+category.id);await page.getByRole('heading',{name:category.title,exact:true}).waitFor();
    assert.equal(await page.locator('.adt-operation').count(),category.functions.length);
    for(const name of category.functions){assert.ok((await page.locator('#api-'+name+' .adt-signature').textContent()).includes(name+'('));}
  }
  checks.push('all six categories expose all 49 storage-specific operation cards');
  await page.goto(base+'/#/library/linked-queue');await page.getByRole('heading',{name:'链队列',exact:true}).waitFor();
  const head=page.locator('#api-GetHead');await head.locator('.adt-usage>summary').click();await head.locator('.adt-implementation>summary').click();
  assert.ok((await head.locator('.adt-implementation code').textContent()).includes('q->front->data'));
  assert.ok(!(await head.locator('.adt-implementation code').textContent()).includes('q->data['));
  await page.reload();await page.getByRole('heading',{name:'链队列',exact:true}).waitFor();checks.push('linked source matches storage selection and deep link survives reload');
  await page.goto(base+'/#/settings');await page.getByRole('combobox',{name:'显示模式'}).selectOption('dark');await page.getByRole('combobox',{name:'阅读字号'}).selectOption('18');
  await page.goto(base+'/#/library');await page.locator('.adt-category').first().waitFor();await page.screenshot({path:'../../artifacts/adt-library-dark.png',fullPage:true});
  await page.getByRole('link',{name:'查看带头结点单链表接口',exact:true}).click();await page.locator('#api-ListDelete .adt-usage>summary').click();
  await page.setViewportSize({width:1280,height:900});assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  await page.screenshot({path:'../../artifacts/adt-cards-dark.png',fullPage:true});checks.push('dark theme and 18px cards fit a 1280px viewport');
  await page.goto(base+'/#/library/missing');await page.getByText('未找到这个 ADT 板块。',{exact:true}).waitFor();await page.getByRole('link',{name:'返回接口库'}).click();await page.locator('.adt-category').first().waitFor();checks.push('invalid category offers a working return link');
  assert.deepEqual(errors,[]);await writeFile('../../artifacts/adt-browser.json',JSON.stringify({passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors},null,2));
}catch(error){await page.screenshot({path:'../../artifacts/adt-browser-failure.png',fullPage:true});await writeFile('../../artifacts/adt-browser.json',JSON.stringify({passed:false,checks,errors,error:error.message},null,2));throw error;}
finally{await browser.close();await new Promise(r=>server.close(r));const target=path.resolve(temp);if(target.startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(target).startsWith('ds-library-'))await rm(target,{recursive:true,force:true,maxRetries:3,retryDelay:100});}
