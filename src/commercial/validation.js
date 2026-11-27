export function validateResearchRecord(record,sourceIds,{kind='market'}={}) {
 if(!record||typeof record!=='object'||Array.isArray(record))throw new TypeError('Research record required');
 if(typeof record.verifiedDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(record.verifiedDate)||!Number.isFinite(Date.parse(record.verifiedDate)))throw new TypeError('Verification date required');
 if(!Array.isArray(record.sourceIds)||!record.sourceIds.length||record.sourceIds.some(id=>!sourceIds.has(id)))throw new TypeError('Traceable sources required');
 if(!['UAE','India'].includes(record.country))throw new TypeError('Invalid country');
 if(kind==='market'){
  const c=record.coordinates;if(!Array.isArray(c)||c.length!==2||!c.every(Number.isFinite)||Math.abs(c[0])>90||Math.abs(c[1])>180)throw new TypeError('Invalid coordinates');
  if(!Number.isFinite(record.solarDailyKwhM2)||record.solarDailyKwhM2<=0||record.solarDailyKwhM2>9)throw new TypeError('Invalid solar assumption');
  for(const key of ['city','approvalPath','risk','solarBasis','partnersStatus','deploymentStatus'])if(typeof record[key]!=='string'||!record[key].trim())throw new TypeError(`Missing ${key}`);
 }else{
  for(const key of ['id','name','type','benefit','eligibility','incorporation','status','evidence','nextAction'])if(typeof record[key]!=='string'||!record[key].trim())throw new TypeError(`Missing ${key}`);
  if(record.deadline!==null&&(typeof record.deadline!=='string'||!Number.isFinite(Date.parse(record.deadline))))throw new TypeError('Invalid deadline');
  for(const key of ['audience','regions','projectTypes'])if(!Array.isArray(record[key])||!record[key].length)throw new TypeError(`Missing ${key}`);
 }
 return record;
}
