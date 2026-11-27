import test from 'node:test';
import assert from 'node:assert/strict';
import {buildModel} from '../twin/model.js';
import {prepareConceptModel,EXCLUDED_KEYS,fleetVisibleCount} from './concept.js';
// CPU-only geometry construction. This is not a WebGL render or browser interaction.
const makeCanvas=()=>({width:512,height:512,getContext:()=>({fillRect(){},stroke(){},beginPath(){},moveTo(){},lineTo(){},createLinearGradient(){return{addColorStop(){}};}})});
test('Prototype adapter masks storage/wind/grid-inverter geometry on its own model without editing the original asset',()=>{
 const prior=globalThis.document;globalThis.document={createElement:makeCanvas};
 try {const concept=prepareConceptModel(buildModel(),{lab:true});for(const key of EXCLUDED_KEYS)for(const obj of concept.KEY[key]||[])assert.equal(obj.visible,false);assert.equal(concept.modules.filter(m=>m.visible).length,1);const original=buildModel();assert(original.KEY['lifepo4-battery'].every(o=>o.visible));assert(original.KEY['vawt-rotor'].every(o=>o.visible));assert.equal(original.modules.filter(m=>m.visible).length,6);}finally{globalThis.document=prior;}
});
test('Illustrative fleet count is capped and remains finite without pretending to render every proposed building',()=>{assert.equal(fleetVisibleCount(100,'portfolio'),12);assert.equal(fleetVisibleCount(4,'single'),1);assert.equal(fleetVisibleCount(2,'neighborhood'),2);assert.equal(fleetVisibleCount(NaN,'portfolio'),1);});
