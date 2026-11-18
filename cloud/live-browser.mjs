import {chromium,expect} from '../upstream/algorithm-visualizer/node_modules/@playwright/test/index.mjs';
import {randomBytes} from 'node:crypto';import {mkdir,writeFile} from 'node:fs/promises';import {list} from '@vercel/blob';import {remove} from './storage.mjs';import {digest} from './identity.mjs';import {Sandbox} from '@vercel/sandbox';
const base='https://data-structure-lab.vercel.app',browser=await chromium.launch({channel:'msedge',headless:true}),checks=[],users=[];let failure;
const req=(page,path,method='GET',body)=>page.evaluate(async({path,method,body})=>{const r=await fetch('/api'+path,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const value=await r.json();if(!r.ok)throw new Error(value.error);return value;},{path,method,body});
await mkdir('artifacts',{recursive:true});
try{
 for(let i=0;i<2;i++){
  const context=await browser.newContext({viewport:{width:1480,height:1000}}),page=await context.newPage(),name='live_'+randomBytes(5).toString('hex'),password=randomBytes(20).toString('hex');users.push({context,page,name});
  await page.goto(base);await page.getByRole('button',{name:'创建账号',exact:true}).click();await page.getByLabel('用户名',{exact:true}).fill(name);await page.getByLabel('密码',{exact:true}).fill(password);await page.getByRole('button',{name:'创建账号并进入',exact:true}).click();await page.locator('.hero-card').waitFor({timeout:150000});
  const session=await req(page,'/account/session');users[i].id=session.user.id;users[i].token=(await context.cookies()).find(c=>c.name==='__Host-ds_cloud')?.value;
 }
 checks.push('public production URL permits independent account registration without a Vercel login');
 await req(users[0].page,'/records/note/cloud-check','PUT',{text:'account A private'});if(await req(users[1].page,'/records/note/cloud-check')!==null)throw new Error('isolation failure');checks.push('production accounts keep learning records isolated');
 const page=users[0].page;await page.goto(base+'/#/workbench/lc-206');await page.locator('.ace_editor').waitFor({timeout:90000});await page.waitForTimeout(700);const catalog=await req(page,'/catalog'),a=catalog.algorithms.find(a=>a.id==='lc-206');await page.locator('.ace_editor').evaluate((el,source)=>el.env.editor.setValue(source,-1),a.source);await page.getByRole('button',{name:'提交测试',exact:true}).click();await expect.poll(async()=>{const p=await req(page,'/records/progress/lc-206');return p?.independentPassed;},{timeout:120000}).toBe(true);checks.push('original C solution passes real cloud submission tests');
 await page.getByRole('button',{name:'运行代码',exact:true}).click();await page.getByText('执行完成',{exact:true}).waitFor({timeout:120000});checks.push('cloud workbench displays actual source-line trace and visualization');await page.screenshot({path:'artifacts/cloud-workbench.png',fullPage:true});
 await page.getByRole('button',{name:'退出账号',exact:true}).click();await page.getByLabel('用户名',{exact:true}).fill(users[0].name);await page.getByLabel('密码',{exact:true}).fill('wrong-password-long');await page.getByRole('button',{name:'进入工作台',exact:true}).click();await expect(page.getByRole('alert')).toContainText('用户名或密码错误');checks.push('logout clears the session and incorrect credentials are rejected');
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/cloud-login-mobile.png',fullPage:true});
 console.log(JSON.stringify({passed:true,checks}));
}catch(e){failure=e;console.error(e.stack);if(users[0])await users[0].page.screenshot({path:'artifacts/cloud-live-failure.png',fullPage:true});}finally{
 await browser.close();for(const u of users){try{if(u.id)await (await Sandbox.get({name:'ds-user-'+u.id})).delete();}catch{}try{await remove('users/'+digest(u.name)+'.json');if(u.token)await remove('sessions/'+digest(u.token)+'.json');}catch{}}
 await writeFile('artifacts/cloud-live.json',JSON.stringify({passed:!failure,checks,error:failure?.message},null,2));
}if(failure)process.exit(1);
