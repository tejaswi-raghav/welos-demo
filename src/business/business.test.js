import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { financialModel, valuationTargets } from './finance.js';
import { ROUTES, routeName } from './routes.js';
const read = n => JSON.parse(fs.readFileSync(`business/data/${n}.json`));
const initial = JSON.parse(fs.readFileSync('src/business/finance.fixture.json'));
test('Forecast reconciles revenue, gross profit, annual cash changes and funding gap across all scenarios', () => {
  for (const s of ['conservative', 'base', 'aggressive']) {
    const m = financialModel(initial, s);
    let cash = initial.openingCashUsd;
    for (const r of m.rows) {
      assert.equal(r.revenue, r.hardwareRevenue + r.recurringRevenue + r.serviceRevenue);
      assert.equal(r.grossProfit, r.revenue - r.cogs);
      assert.equal(r.ebitda, r.grossProfit - r.acquisition - r.opex);
      cash += r.freeCashFlow;
      assert.equal(r.closingCash, cash);
      assert(r.activeSubscribers <= r.installed);
    }
    assert.equal(m.fundingRequired, Math.max(0, ...m.rows.map(r => -r.closingCash)));
  }
});
test('Editable later-period price/volume/churn/FX/cash inputs affect the same build without changing original assumptions', () => {
  const a = structuredClone(initial),
    before = financialModel(a);
  a.scenarios.base.india[4] *= 2;
  assert(financialModel(a).rows[4].revenue > before.rows[4].revenue);
  assert.equal(financialModel(a).rows[0].revenue, before.rows[0].revenue);
  a.scenarios.base.churn = 1;
  assert(financialModel(a).rows[3].arr < before.rows[3].arr);
  const zero = structuredClone(initial);
  zero.openingCashUsd = 0;
  assert(Math.abs(financialModel(zero).fundingRequired - before.fundingRequired - initial.openingCashUsd) < 1e-7);
  a.fx.inrPerUsd = 0;
  assert.throws(() => financialModel(a));
  a.fx.inrPerUsd = 85;
  a.markets[0].price = '';
  assert.throws(() => financialModel(a));
});
test('Zero sales and full churn stay finite; VAT and working capital are cash uses rather than revenue', () => {
  const a = structuredClone(initial);
  for (const k of ['uae', 'india']) a.scenarios.base[k] = [0, 0, 0, 0, 0];
  const m = financialModel(a);
  assert(m.rows.every(r => r.revenue === 0 && r.grossMargin === 0 && r.arr === 0));
  const high = structuredClone(initial);
  high.arDays = 90;
  assert(financialModel(high).fundingRequired > financialModel(initial).fundingRequired);
});
test('Valuation target sensitivity uses distinct streams and converts equity to EV using net debt', () => {
  const t = valuationTargets(initial.valuation);
  assert.equal(t.hardwareRevenue, 100000000 / 1.5);
  assert.equal(t.hybridArr * 6 + t.hybridHardwareRevenue * 1.5, t.targetEv);
  assert.equal(valuationTargets({
    ...initial.valuation,
    netDebtUsd: 1000000
  }).targetEv, 101000000);
  assert.throws(() => valuationTargets({
    ...initial.valuation,
    arrMultiple: 0
  }));
});
test('Seven clean routes are exact and configured without swallowing showroom or API paths', () => {
  const config = JSON.parse(fs.readFileSync('vercel.json'));
  assert.equal(Object.keys(ROUTES).length, 7);
  for (const key of Object.keys(ROUTES)) {
    assert.equal(routeName(`/${key}/`), key);
    assert(config.rewrites.some(r => r.source === `/${key}` && r.destination === '/commercial.html'));
  }
  assert(!config.rewrites.some(r => ['/', '/api/:path*', '/(.*)'].includes(r.source)));
  assert.equal(routeName('/__proto__'), 'business');
});
test('Research references resolve; deadlines and customer/equity distinctions remain explicit', () => {
  const ids = new Set(read('sources').map(s => s.id));
  for (const row of [...read('markets'), ...read('incentives')]) {
    for (const id of row.sourceIds) assert(ids.has(id), `Missing ${id}`);
    assert(row.verifiedDate);
  }
  assert.match(read('incentives').find(i => i.id === 'sisfs').status, /Closed/);
  assert.equal(read('incentives').find(i => i.id === 'pm').type, 'Customer subsidy');
  assert.match(read('incentives').find(i => i.id === 'hub71').type, /Equity/);
});
test('BOM includes contingency and remains below budget without batteries/wind purchases', () => {
  const b = read('prototype');
  assert.equal(b.subtotalAed, b.items.reduce((v, i) => v + i.quantity * i.budgetUnitAed, 0));
  assert.equal(b.totalAed, b.subtotalAed + b.contingencyAed);
  assert(b.totalAed <= 10000);
  assert(!b.items.some(i => /battery|turbine/i.test(i.part)));
  assert(b.items.every(i => i.priceBasis && i.verifiedDate));
});
