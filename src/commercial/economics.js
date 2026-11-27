import { sizeGen1 } from '../gen1/config.js';
import { annualEconomics } from '../site/economics.js';
import { VAT,REGIONS } from '../site/regions.js';
import { markets } from './data.js';
const bounded=(v,min,max,label)=>{if(!Number.isFinite(v)||v<min||v>max)throw new RangeError(`Invalid ${label}`);return v;};
export const CATEGORIES=Object.freeze({villa:{tier:'S',label:'Villa / home'},residential:{tier:'M',label:'Residential building'},commercial:{tier:'L',label:'Commercial building'}});
export const DEFAULT_SCENARIO=Object.freeze({city:'Hyderabad',category:'villa',roofM2:60,loadKwhDay:30,solarDailyKwhM2:5,unitRate:8,indiaInstalledPerKw:55000,maintenanceRate:.015,replacementYear:12,replacementShare:.15,exportApproved:false,configuration:'core-gen1'});
export function customerScenario(input={}) {
 const a={...DEFAULT_SCENARIO,...input},market=markets.find(m=>m.city===a.city);
 if(!market||!Object.hasOwn(CATEGORIES,a.category))throw new TypeError('Unknown city or building category');
 bounded(a.roofM2,1,100000,'roof');bounded(a.loadKwhDay,1,100000,'load');bounded(a.solarDailyKwhM2,.5,9,'solar resource');bounded(a.unitRate,.01,100,'unit rate');bounded(a.indiaInstalledPerKw,1000,500000,'installed cost');bounded(a.maintenanceRate,0,.2,'maintenance');bounded(a.replacementShare,0,1,'replacement');bounded(a.replacementYear,1,25,'replacement year');
 if(!Number.isInteger(a.replacementYear))throw new RangeError('Replacement year must be a whole year');
 if(!['core-gen1','core-gen1-cleaning'].includes(a.configuration))throw new TypeError('Unknown configuration');
 const cleaning=a.configuration==='core-gen1-cleaning';
 const region=REGIONS.find(r=>r.name===a.city),utilityId=region?.utility||'dewa';
 const climate={...(region?.climate||{windMs:2,rainMmYear:700,tempC:27,humidityPct:60}),solarDailyKwhM2:a.solarDailyKwhM2,monthly:market.country==='India'?Array(12).fill(a.solarDailyKwhM2):region?.climate.monthly};
 const base=sizeGen1({climate,tierId:CATEGORIES[a.category].tier,utilityId,inputs:{roofM2:a.roofM2,loadKwhDay:a.loadKwhDay},cleaning,exportApproved:a.exportApproved===true&&a.city==='Dubai'});
 const solar=base.components.find(c=>c.id==='solar'),kwp=solar.metrics.pvKwp;
 let economics,installedCost,currency,basis;
 if(market.country==='India') {
  // Reuse existing monthly bill engine. It adds its UAE VAT constant, so normalize
  // the input slab to return the user's all-in INR/kWh rate exactly. This is NOT
  // an Indian VAT/GST assumption. No export credit or subsidy is inferred.
  const utility={id:'india-scenario',name:'User-entered all-in tariff',basis:'monthly',slabs:[[Infinity,a.unitRate/(1+VAT)]],fuelSurcharge:0,netMetering:'unverified'};
  economics=annualEconomics({pvMonthly:base.monthly.map(m=>m.pv),loadMonthly:base.monthly.map(m=>m.load*(a.loadKwhDay*365/base.monthly.reduce((sum,row)=>sum+row.load,0))),utility,tierId:CATEGORIES[a.category].tier,batteryKwh:0});
  installedCost=kwp*a.indiaInstalledPerKw+(cleaning?30000:0);currency='INR';
  basis='User-entered all-in tariff and installed cost assumptions. No export credit, customer subsidy or fixed-charge saving. Actual DISCOM bill and EPC quote required. India GST is not modeled. Flat monthly solar resource and the existing load profile are planning proxies, not site weather/load measurements.';
 } else {
  economics={saving:base.totals.annualSavingsAed,billBefore:base.totals.billBeforeAed,billAfter:base.totals.billAfterAed,months:base.monthly};
  installedCost=base.totals.totalAed;currency='AED';basis=base.economicsBasis+' Uses approved UAE regional tariff assumptions; verify the actual account.';
 }
 const annualMaintenance=installedCost*a.maintenanceRate,annualNet= economics.saving-annualMaintenance;
 const rows=Array.from({length:25},(_,index)=>{const year=index+1,saving=economics.saving*.995**index,replacement=year===a.replacementYear?installedCost*a.replacementShare:0;return {year,saving,maintenance:annualMaintenance,replacement,net:saving-annualMaintenance-replacement};});
 let cumulative=-installedCost,paybackYears=null;for(const row of rows){const before=cumulative;cumulative+=row.net;row.cumulative=cumulative;if(paybackYears===null&&cumulative>=0&&row.net>0)paybackYears=row.year-1+(-before)/row.net;}
 return {input:a,market,currency,installedCost,kwp,modules:solar.metrics.modules,annualGeneration:base.totals.energyKwhYear,billBefore:economics.billBefore,billAfter:economics.billAfter,grossSavings:economics.saving,annualMaintenance,annualNet,paybackYears,rows,basis,exportCredit:market.country==='UAE'&&a.city==='Dubai'&&a.exportApproved===true,storageKwh:0,backupHours:0,scope:'Indicative full rooftop solar-system capex, separate from laboratory BOM and company forecasts. No engineering approval.'};
}
export function developerScenario({buildings=4,stages=2,...input}={}) {
 bounded(buildings,1,1000,'building count');bounded(stages,1,10,'stages');if(!Number.isInteger(buildings)||!Number.isInteger(stages))throw new RangeError('Counts must be whole numbers');
 const site=customerScenario(input);
 return {site,buildings,stages,installedCost:site.installedCost*buildings,annualGeneration:site.annualGeneration*buildings,annualNet:site.annualNet*buildings,annualMaintenance:site.annualMaintenance*buildings,kwp:site.kwp*buildings,paybackYears:site.paybackYears,schedule:Array.from({length:Math.min(stages,buildings)},(_,i)=>({stage:i+1,buildings:Math.floor(buildings/Math.min(stages,buildings))+(i<buildings%Math.min(stages,buildings)?1:0)})),basis:'Identical buildings, linear aggregation. No bulk discount, shared grid connection, cross-meter credit or professional design approval assumed. Site-by-site approval and roof/load surveys remain required.'};
}
export function inquiryDraft(raw) {
 if(!raw||typeof raw!=='object')throw new TypeError('Inquiry object required');
 const {organization='',email='',message=''}=raw;
 for(const [key,value]of Object.entries({organization,email,message}))if(typeof value!=='string'||value.length>(key==='message'?2000:150))throw new TypeError(`Invalid ${key}`);
 if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new TypeError('Invalid email');
 return {schemaVersion:1,status:'Local inquiry draft · not sent',organization:organization.trim(),email:email.trim(),message:message.trim(),consentToTransmit:false};
}

export function loadFromMonthlyBill({city='Hyderabad',monthlyBill=0,unitRate=8}={}) {
 bounded(monthlyBill,0,10000000,'monthly bill');const market=markets.find(m=>m.city===city);if(!market)throw new TypeError('Unknown city');
 if(market.country==='India'){bounded(unitRate,.01,100,'unit rate');return monthlyBill/unitRate/30;}
 const region=REGIONS.find(r=>r.name===city),utility=UTILITIES[region?.utility||'dewa'];let lo=0,hi=10000000;for(let i=0;i<60;i++){const mid=(lo+hi)/2;if(monthlyBillFn(mid,utility,{days:30})>monthlyBill)hi=mid;else lo=mid;}return(lo+hi)/2/30;
}
import { monthlyBill as monthlyBillFn, UTILITIES } from '../site/economics.js';
