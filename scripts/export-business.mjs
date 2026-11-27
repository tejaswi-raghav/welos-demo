import fs from 'node:fs';
import path from 'node:path';
import { financialModel, valuationTargets } from '../src/business/finance.js';
const read = n => JSON.parse(fs.readFileSync(`business/data/${n}.json`));
const a = read('finance-assumptions');
const csv = rows => rows.map(r => r.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n') + '\n';
const cases = ['conservative', 'base', 'aggressive'];
const forecast = cases.flatMap(s => financialModel(a, s).rows.map(r => ({
  scenario: s,
  ...r
})));
fs.writeFileSync('business/finance/FIVE_YEAR_MODEL.csv', csv([Object.keys(forecast[0]), ...forecast.map(Object.values)]));
fs.writeFileSync('business/finance/VALUATION_SCENARIOS.json', JSON.stringify(valuationTargets(a.valuation), null, 2) + '\n');
const unit = a.markets.map(m => ({
  market: m.id,
  currency: m.currency,
  price: m.price,
  hardware: m.hardware,
  landed: m.landed,
  installation: m.installation,
  warranty: m.price * m.warrantyRate,
  grossProfit: m.price - m.hardware - m.landed - m.installation - m.price * m.warrantyRate,
  cac: m.cac,
  monthlyFee: m.monthlyFee,
  monthlyDelivery: m.monthlyCost,
  annualServiceFee: m.annualServiceFee,
  annualServiceCost: m.annualServiceCost
}));
fs.writeFileSync('business/finance/UNIT_ECONOMICS.csv', csv([Object.keys(unit[0]), ...unit.map(Object.values)]));
const programs = read('incentives');
fs.writeFileSync('business/funding/INCENTIVES.csv', csv([Object.keys(programs[0]), ...programs.map(r => Object.values(r).map(v => Array.isArray(v) ? v.join('; ') : v))]));
// One canonical research tree, copied at build/export time so the portal offers real downloads.
for (const folder of ['business', 'hardware/gen1']) {
  for (const p of fs.readdirSync(folder, {
    recursive: true
  })) {
    const file = path.join(folder, p);
    if (!fs.statSync(file).isFile()) continue;
    const dest = path.join('public/resources', file);
    fs.mkdirSync(path.dirname(dest), {
      recursive: true
    });
    fs.copyFileSync(file, dest);
  }
}
console.log('Exported all three scenarios, unit economics, valuation sensitivities and research downloads.');
