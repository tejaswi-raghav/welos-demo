import markets from '../business/data/markets.json' with {type:'json'};
import incentives from '../business/data/incentives.json' with {type:'json'};
import sources from '../business/data/sources.json' with {type:'json'};
// Curated public records only. No investor data, user submission or arbitrary file lookup.
export default function handler(req,res){
 res.setHeader('Cache-Control','public, max-age=300, s-maxage=3600');
 if(req.method!=='GET'&&req.method!=='HEAD'){res.setHeader('Allow','GET, HEAD');return res.status(405).json({error:'Read-only endpoint'});}
 const resource=req.query?.resource||'markets';
 if(!['markets','incentives','sources'].includes(resource))return res.status(400).json({error:'Unknown public resource'});
 if(req.method==='HEAD'){res.status(200);return res.end();}
 const data={markets,incentives,sources}[resource];
 return res.status(200).json({schemaVersion:1,resource,verifiedDate:'2026-11-27',provenance:'Curated research, not a live program-status or eligibility service',data});
}
