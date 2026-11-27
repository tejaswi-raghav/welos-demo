import { incentives } from './data.js';
export function findIncentives({country='India',region='',audience='residential',projectType='new-solar',companyStatus='unknown',nationality='unknown',query='',type='All'}={}) {
 if(!['India','UAE'].includes(country)||!['residential','commercial','developer','startup'].includes(audience))throw new TypeError('Invalid eligibility profile');
 return incentives.filter(p=>p.country===country&&p.audience.includes(audience)&&p.projectTypes.includes(projectType)&&(type==='All'||p.type===type)&&`${p.name} ${p.eligibility}`.toLowerCase().includes(query.toLowerCase())).map(p=>{
  const gaps=[];if(region&&!p.regions.includes(country)&&!p.regions.includes(region))gaps.push(`Requires ${p.regions.join(' or ')} location/relocation review`);
  if(audience==='startup'&&companyStatus!=='incorporated')gaps.push('Entity/incorporation requirements need confirmation');
  if(['khalifa','sme','nexus'].includes(p.id)&&nationality!=='uae')gaps.push('UAE national ownership/residency conditions not established');
  if(p.id==='pm')gaps.push('Residential consumer, module/vendor, roof rights and DISCOM approval must be verified');
  if(p.id==='elevate')gaps.push('Deeptech/IP evidence and current call terms required');
  const closed=/closed/i.test(p.status),status=closed?'Closed window':gaps.length?'Eligibility gaps':'Worth investigating';
  return {...p,gaps,matchStatus:status,eligible:false};
 }).sort((a,b)=>(/closed/i.test(a.status)?1:0)-(/closed/i.test(b.status)?1:0));
}
