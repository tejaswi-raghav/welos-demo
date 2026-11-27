export const ROUTES = Object.freeze({ business:'Explore', prototype:'Prototype Lab', economics:'Energy Economics', developers:'Developer Studio', network:'welOS Network', incentives:'Incentive Finder', company:'Company' });
export const ALIASES = Object.freeze({ markets:'network', partners:'developers', investors:'company', enterprise:'developers', build:'economics' });
export function routeName(path) { const key=path.replace(/^\/+|\/+$/g,'');return Object.hasOwn(ROUTES,key)?key:Object.hasOwn(ALIASES,key)?ALIASES[key]:'business'; }
