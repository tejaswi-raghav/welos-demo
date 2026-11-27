/** Company cash/revenue model. It does not replace the product's customer bill engine. */
export function financialModel(a, scenarioName = 'base') {
  if (!a || !a.scenarios || !a.fx || !Array.isArray(a.markets) || a.markets.length !== 2 || a.markets.map(m => m.id).sort().join(',') !== 'india,uae') throw new TypeError('Expected UAE and India assumptions');
  const s = a.scenarios[scenarioName];
  if (!s) throw new RangeError('Unknown scenario');
  for (const k of ['uae', 'india', 'opex']) if (!Array.isArray(s[k]) || s[k].length !== 5) throw new TypeError('Expected five annual values for ' + k);
  if (!Array.isArray(a.capexUsd) || a.capexUsd.length !== 5) throw new TypeError('Expected five capex values');
  for (const m of a.markets) if (typeof m.currency !== 'string' || !/^[A-Z]{3}$/.test(m.currency)) throw new TypeError('Expected currency code');
  const pos = (x, key) => {
    if (!Number.isFinite(x) || x < 0) throw new RangeError(`Invalid ${key}`);
  };
  for (const k of ['openingCashUsd', 'arDays', 'inventoryDays', 'payableDays', 'vatFloatDays', 'taxRate', 'depreciationRate']) pos(a[k], k);
  for (const k of ['attach', 'churn']) if (!Number.isFinite(s[k]) || s[k] < 0 || s[k] > 1) throw new RangeError(`Invalid ${k}`);
  if (a.taxRate > 1 || a.depreciationRate > 1) throw new RangeError('Invalid tax/depreciation rate');
  let cash = a.openingCashUsd,
    priorWc = 0,
    cumulativeCapex = 0,
    installed = {},
    subscribers = {},
    minCash = cash;
  const rows = [];
  for (let y = 0; y < 5; y++) {
    let hardwareRevenue = 0,
      recurringRevenue = 0,
      serviceRevenue = 0,
      hardwareCogs = 0,
      recurringCogs = 0,
      serviceCogs = 0,
      acquisition = 0,
      arr = 0,
      units = 0,
      activeSubscribers = 0,
      workingCapital = 0;
    for (const m of a.markets) {
      for (const k of ['price', 'hardware', 'landed', 'installation', 'warrantyRate', 'cac', 'monthlyFee', 'monthlyCost', 'annualServiceFee', 'annualServiceCost', 'vatRate']) pos(m[k], k);
      if (m.warrantyRate > 1 || m.vatRate > 1) throw new RangeError('Invalid FX or rate');
      const fx = m.id === 'india' ? a.fx.inrPerUsd : a.fx.aedPerUsd;
      if (!Number.isFinite(fx) || fx <= 0) throw new RangeError('Invalid FX');
      const n = s[m.id]?.[y];
      pos(n, 'units');
      pos(s.opex[y], 'opex');
      pos(a.capexUsd[y], 'capex');
      const opening = subscribers[m.id] || 0,
        retained = opening * (1 - s.churn),
        additions = n * s.attach,
        closing = retained + additions;
      // Churn at start, new subscriptions mid-year. Service covers the same paid contracts.
      const average = retained + additions / 2;
      subscribers[m.id] = closing;
      installed[m.id] = (installed[m.id] || 0) + n;
      const hw = n * m.price / fx,
        sw = average * m.monthlyFee * 12 / fx,
        service = average * m.annualServiceFee / fx;
      const direct = n * (m.hardware + m.landed + m.installation + m.price * m.warrantyRate) / fx;
      hardwareRevenue += hw;
      recurringRevenue += sw;
      serviceRevenue += service;
      hardwareCogs += direct;
      recurringCogs += average * m.monthlyCost * 12 / fx;
      serviceCogs += average * m.annualServiceCost / fx;
      acquisition += n * m.cac / fx;
      arr += closing * m.monthlyFee * 12 / fx;
      activeSubscribers += closing;
      units += n;
      const purchases = n * (m.hardware + m.landed) / fx;
      workingCapital += (hw + sw + service) * a.arDays / 365 + purchases * (a.inventoryDays - a.payableDays) / 365 + (hw + sw + service) * m.vatRate * a.vatFloatDays / 365;
    }
    const revenue = hardwareRevenue + recurringRevenue + serviceRevenue,
      cogs = hardwareCogs + recurringCogs + serviceCogs,
      grossProfit = revenue - cogs;
    const ebitda = grossProfit - acquisition - s.opex[y];
    cumulativeCapex += a.capexUsd[y];
    const depreciation = cumulativeCapex * a.depreciationRate;
    const tax = Math.max(0, ebitda - depreciation) * a.taxRate;
    const deltaWc = workingCapital - priorWc;
    priorWc = workingCapital;
    const freeCashFlow = ebitda - tax - a.capexUsd[y] - deltaWc;
    cash += freeCashFlow;
    minCash = Math.min(minCash, cash);
    rows.push({
      year: y + 1,
      units,
      installed: Object.values(installed).reduce((v, n) => v + n, 0),
      activeSubscribers,
      hardwareRevenue,
      recurringRevenue,
      serviceRevenue,
      revenue,
      hardwareCogs,
      recurringCogs,
      serviceCogs,
      cogs,
      grossProfit,
      grossMargin: revenue ? grossProfit / revenue : 0,
      acquisition,
      opex: s.opex[y],
      ebitda,
      depreciation,
      tax,
      arr,
      workingCapital,
      deltaWc,
      capex: a.capexUsd[y],
      freeCashFlow,
      closingCash: cash,
      fundingRequired: Math.max(0, -minCash)
    });
  }
  return {
    scenario: scenarioName,
    currency: 'USD',
    rows,
    fundingRequired: Math.max(0, -minCash),
    basis: 'Assumptions only. No debt/equity inflows included. Fractional expected subscribers; annual timing convention. Corporate tax and indirect-tax floats are scenario inputs, not statutory advice.'
  };
}
export function valuationTargets(v) {
  for (const k of ['targetEquityUsd', 'hardwareRevenueMultiple', 'arrMultiple', 'ebitdaMultiple', 'strategicPremium']) if (!Number.isFinite(v[k]) || v[k] < 0) throw new RangeError(`Invalid ${k}`);
  if (!Number.isFinite(v.netDebtUsd) || !v.hardwareRevenueMultiple || !v.arrMultiple || !v.ebitdaMultiple) throw new RangeError('Invalid net debt or multiple');
  const targetEv = v.targetEquityUsd + v.netDebtUsd;
  if (targetEv <= 0) throw new RangeError('Target enterprise value must be positive');
  return {
    targetEv,
    hardwareRevenue: targetEv / v.hardwareRevenueMultiple,
    softwareArr: targetEv / v.arrMultiple,
    hybridHardwareRevenue: targetEv * .5 / v.hardwareRevenueMultiple,
    hybridArr: targetEv * .5 / v.arrMultiple,
    ebitda: targetEv / v.ebitdaMultiple,
    strategicStandaloneEv: targetEv / (1 + v.strategicPremium),
    basis: 'Target enterprise value = equity target + net debt. Hybrid allocates 50% EV to nonrecurring hardware and 50% to software ARR. Service excluded to avoid double counting. All multiples and acquisition premium are editable sensitivities.'
  };
}
