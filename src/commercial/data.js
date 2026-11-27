import prototype from '../../business/data/prototype.json' with { type: 'json' };
import markets from '../../business/data/markets.json' with { type: 'json' };
import incentives from '../../business/data/incentives.json' with { type: 'json' };
import sources from '../../business/data/sources.json' with { type: 'json' };
export {prototype,markets,incentives,sources};
export const sourceById=Object.fromEntries(sources.map(s=>[s.id,s]));
export const GROUPS=Object.freeze([
 {id:'solar',name:'Solar',code:'01',items:['PV01','LOAD01'],parts:['pv-array','canopy'],description:'A small test module sends power into a guarded DC electronic load. No battery or grid export.',status:'Design only · electrical ratings and calibration pending'},
 {id:'controller',name:'Controller',code:'02',items:['MCU01','PSU01','IO01','SAFE01','ENC01'],parts:['controller-pcb','enclosure','protection','communications'],description:'ESP32-S3, isolated interfaces and independent stop-chain protection. Auxiliary SELV power is separate from measured PV.',status:'Design only · pin map, drivers and firmware port pending'},
 {id:'sensors',name:'Sensors',code:'03',items:['PWR01','RAD01','TEMP01'],parts:['energy-meter','soiling-sensor'],description:'Power, solar reference and temperature. Vendor specifications need reference calibration.',status:'Not calibrated · no physical readings'},
 {id:'cleaning',name:'Cleaning',code:'04',items:['FLOW01','PUMP01','VALVE01','WATER01','LEVEL01'],parts:['water-pump','cleaning-manifold','water-tank','water-sensors'],description:'Optional supervised non-potable rinse with level and flow monitoring. A normally closed valve and independent interlocks stop the pump.',status:'Not tested · containment and flow validation pending',optional:true},
 {id:'enabling',name:'Build & validation',code:'05',items:['MECH01','CAL01','ENG01','LOG01'],parts:['backplate','base-slab'],description:'Frame, calibration reference, engineering review and logistics stay in the budget.',status:'Supplier quotes and engineering sign-off pending'},
]);
export function prototypeBudget({cleaning=true}={}) {
 const selected=prototype.items.filter(i=>cleaning||!GROUPS.find(g=>g.id==='cleaning').items.includes(i.id));
 const subtotal=selected.reduce((sum,i)=>sum+i.budgetTotalAed,0),contingency=Math.round(subtotal*prototype.contingencyRate*100)/100;
 return {items:selected,subtotal,contingency,total:subtotal+contingency,headroom:prototype.capAed-subtotal-contingency};
}
export function groupBudget(id,{cleaning=true}={}) {const g=GROUPS.find(g=>g.id===id);return !g||g.optional&&!cleaning?0:prototype.items.filter(i=>g.items.includes(i.id)).reduce((s,i)=>s+i.budgetTotalAed,0);}
