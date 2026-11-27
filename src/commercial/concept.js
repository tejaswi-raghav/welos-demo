export const EXCLUDED_KEYS=Object.freeze(['vawt-rotor','wind-generator','wind-brake','wind-mast','wind-rectifier','lifepo4-battery','hybrid-inverter','mppt','dc-bus','load-panel','filter-train','filter-header','filter-stage-1','filter-stage-2','filter-stage-3','filter-cap-1','filter-cap-2','filter-cap-3','first-flush','rain-gutter']);
export function prepareConceptModel(model,{lab=false}={}) {
 for(const key of EXCLUDED_KEYS)for(const object of model.KEY[key]||[])object.visible=false;
 if(lab)model.modules.slice(1).forEach(module=>module.visible=false);
 return model;
}
export function fleetVisibleCount(buildings,scale){return Math.min(Math.max(1,Number.isFinite(buildings)?Math.floor(buildings):1),scale==='single'?1:scale==='neighborhood'?4:12);}
