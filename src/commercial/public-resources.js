// Product/research material only. Never add private company or investor artifacts here.
export const PUBLIC_RESOURCES=Object.freeze([
 'business/data/sources.json','business/data/incentives.json',
 'business/data/markets.json','business/data/prototype.json',
 'hardware/gen1/BOM.csv','hardware/gen1/PRODUCT_REQUIREMENTS.md',
 'hardware/gen1/TEST_PLAN.md','hardware/gen1/TELEMETRY_CONTRACT.md',
 'hardware/gen1/REGULATORY_GAPS.md',
]);
export const PUBLIC_RESOURCE_URLS=new Set(PUBLIC_RESOURCES.map(path=>'/resources/'+path));
