import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {customerScenario,developerScenario,loadFromMonthlyBill,inquiryDraft} from './economics.js';
import {prototypeBudget,groupBudget,GROUPS,prototype,markets,incentives,sourceById} from './data.js';
import {findIncentives} from './eligibility.js';
import {ROUTES,ALIASES,routeName} from './routes.js';
import {geometryPath,project} from './map.js';
import {monthlyBill,UTILITIES} from '../site/economics.js';

test('BOM groups form an exact partition; cleaning removal changes cost without cutting safety/calibration',()=>{
 const all=GROUPS.flatMap(g=>g.items);assert.equal(new Set(all).size,all.length);assert.deepEqual(new Set(all),new Set(prototype.items.map(i=>i.id)));
 const full=prototypeBudget(),light=prototypeBudget({cleaning:false});assert.equal(full.total,prototype.totalAed);assert(full.total<=10000);assert.equal(full.subtotal-light.subtotal,groupBudget('cleaning'));assert.equal(groupBudget('cleaning',{cleaning:false}),0);assert(light.items.some(i=>i.id==='SAFE01'));assert(light.items.some(i=>i.id==='CAL01'));
});
test('Battery-free customer economics remain finite for every city and category with no inferred export credit',()=>{
 for(const m of markets)for(const category of ['villa','residential','commercial']){const r=customerScenario({city:m.city,category,solarDailyKwhM2:m.solarDailyKwhM2});assert(r.installedCost>0&&r.annualGeneration>0);assert.equal(r.storageKwh,0);assert.equal(r.backupHours,0);assert.equal(r.exportCredit,false);assert.equal(r.currency,m.country==='India'?'INR':'AED');assert.equal(r.rows.length,25);assert(r.rows.every(y=>Object.values(y).every(Number.isFinite)));}
 assert.equal(customerScenario({city:'Abu Dhabi',exportApproved:true}).exportCredit,false);assert.equal(customerScenario({city:'Dubai',exportApproved:true}).exportCredit,true);
});
test('India uses entered inclusive tariff without adding UAE VAT or unapproved export/subsidy credit',()=>{
 const low=customerScenario({unitRate:4}),high=customerScenario({unitRate:8});assert(Math.abs(high.billBefore-30*365*8)<1e-7);assert(Math.abs(high.grossSavings-low.grossSavings*2)<1e-7);assert.equal(high.installedCost,low.installedCost);assert.match(high.basis,/GST is not modeled/);
});
test('Cash payback accounts for annual maintenance, degradation and explicit replacement, and can be absent',()=>{
 const a=customerScenario(),b=customerScenario({maintenanceRate:.2});assert(b.annualNet<a.annualNet);let cash=-a.installedCost;for(const r of a.rows){cash+=r.net;assert.equal(r.cumulative,cash);}assert(a.rows[11].replacement>0);assert.equal(a.rows[0].replacement,0);assert.equal(customerScenario({unitRate:.01,maintenanceRate:.2}).paybackYears,null);
});
test('Roof/load/location/category/price boundaries reject invalid input rather than showing NaN',()=>{
 for(const v of [{roofM2:0},{roofM2:Infinity},{loadKwhDay:NaN},{unitRate:''},{maintenanceRate:-1},{category:'__proto__'},{city:'unknown'},{configuration:'battery'},{replacementYear:26},{replacementYear:12.5}])assert.throws(()=>customerScenario(v));
});
test('Developer proposals aggregate exactly and allocate every building to a stage without invented discounts',()=>{
 const r=developerScenario({buildings:7,stages:3});assert.equal(r.installedCost,r.site.installedCost*7);assert.equal(r.annualGeneration,r.site.annualGeneration*7);assert.equal(r.annualNet,r.site.annualNet*7);assert.equal(r.schedule.reduce((s,p)=>s+p.buildings,0),7);assert.equal(r.paybackYears,r.site.paybackYears);assert.equal(developerScenario({buildings:2,stages:9}).schedule.length,2);assert.throws(()=>developerScenario({buildings:2.5}));assert.throws(()=>developerScenario({stages:0}));
});
test('Bill-to-consumption inversion uses actual engine slabs for UAE and explicit flat India rate',()=>{
 assert.equal(loadFromMonthlyBill({monthlyBill:2400,unitRate:8}),10);const daily=150,bill=monthlyBill(daily*30,UTILITIES.dewa);assert(Math.abs(loadFromMonthlyBill({city:'Dubai',monthlyBill:bill})-daily)<1e-6);assert.throws(()=>loadFromMonthlyBill({monthlyBill:-1}));
});
test('Eligibility journey distinguishes applicant/project/funding type, expired windows and missing facts',()=>{
 const residential=findIncentives();assert(residential.some(p=>p.id==='pm'));assert(!residential.some(p=>p.id==='sisfs'));const startup=findIncentives({audience:'startup',projectType:'company'});assert(startup.some(p=>p.id==='sisfs'&&p.matchStatus==='Closed window'));assert(startup.every(p=>p.eligible===false));const uae=findIncentives({country:'UAE',audience:'startup',projectType:'company',region:'Dubai'});assert(uae.find(p=>p.id==='khalifa').gaps.length);assert(uae.some(p=>p.id==='fta-freezone'&&p.type==='Tax incentive'));assert(findIncentives({country:'India',audience:'commercial',projectType:'manufacturing'}).some(p=>p.id==='mnre-pli'));assert.throws(()=>findIncentives({audience:'not-a-person-type'}));
});
test('Research records have coordinates, sources, dated evidence and explicit unverified partner/deployment status',()=>{
 for(const m of markets){assert(m.coordinates.length===2&&m.coordinates.every(Number.isFinite));assert(m.sourceIds.every(id=>sourceById[id]));assert.match(m.partnersStatus,/No contracted/);assert.match(m.deploymentStatus,/Scenario/);}
 for(const p of incentives){assert(p.sourceIds.every(id=>sourceById[id]));assert(p.verifiedDate&&p.status&&p.audience.length&&p.projectTypes.length);}
});
test('Map projection and geographic polygons are deterministic and finite',()=>{
 assert.deepEqual(project([39,42]),[0,0]);assert.equal(geometryPath({type:'Polygon',coordinates:[[[42,39],[43,39],[43,38],[42,39]]]}),'M0.00,0.00 L14.00,0.00 L14.00,14.00 L0.00,0.00Z');
});
test('Commercial routes and legacy aliases resolve exactly without modifying protected routes',()=>{
 const config=JSON.parse(fs.readFileSync('vercel.json'));for(const key of [...Object.keys(ROUTES),...Object.keys(ALIASES)]){assert(config.rewrites.some(r=>r.source===`/${key}`));assert(Object.hasOwn(ROUTES,routeName('/'+key)));}assert.equal(routeName('/investors'),'company');assert.equal(routeName('/markets'),'network');assert.equal(routeName('/__proto__'),'business');
});
test('Inquiry draft validates fields and remains explicitly unsent with no implicit consent',()=>{
 const draft=inquiryDraft({organization:' Example ',email:'a@example.org',message:'Survey'});assert.equal(draft.organization,'Example');assert.equal(draft.consentToTransmit,false);assert.match(draft.status,/not sent/);assert.throws(()=>inquiryDraft({email:'invalid'}));assert.throws(()=>inquiryDraft({message:'a'.repeat(2001)}));assert.throws(()=>inquiryDraft({organization:{}}));
});
test('Private investor/company documents are absent from current public resources and commercial imports',()=>{
 for(const p of ['public/resources/business/investors/WELOS_INVESTOR_PITCH.pptx','public/resources/business/data/finance-assumptions.json','business/data/finance-assumptions.json','business/investors/WELOS_INVESTOR_PITCH.pptx'])assert(!fs.existsSync(p),p);
 const main=fs.readFileSync('src/commercial/main.jsx','utf8');assert(!main.includes('finance-assumptions'));assert(!main.includes('Akhil'));assert(!main.includes('BITS Pilani'));assert(!fs.readFileSync('scripts/export-business.mjs','utf8').includes('for (const folder'));
});

import {validateResearchRecord} from './validation.js';
test('External record contracts reject missing provenance, invalid location and malformed deadlines',()=>{const ids=new Set(Object.keys(sourceById));for(const row of markets)validateResearchRecord(row,ids);for(const row of incentives)validateResearchRecord(row,ids,{kind:'incentive'});assert.throws(()=>validateResearchRecord({...markets[0],sourceIds:['missing']},ids));assert.throws(()=>validateResearchRecord({...markets[0],coordinates:[100,0]},ids));assert.throws(()=>validateResearchRecord({...incentives[0],deadline:'tomorrow'},ids,{kind:'incentive'}));});

import {proposalHtml} from './proposal.js';
test('Printable proposal is readable, scoped and escapes user text without sending an inquiry',()=>{const html=proposalHtml(developerScenario(),'<script>alert(1)</script>','2026-11-27T00:00:00Z');assert(html.includes('Per-building assumptions'));assert(html.includes('Deployment stages'));assert(!html.includes('<script>'));assert(html.includes('&lt;script&gt;'));assert(html.includes('No inquiry was sent'));});

import {headerHtml,footerHtml} from '../ui/chrome-html.js';
test('Commercial entry uses one footer link and does not add main-navbar items',()=>{assert.equal((footerHtml().match(/Explore welOS Business/g)||[]).length,1);assert(!headerHtml('home').includes('href="/business"'));});
