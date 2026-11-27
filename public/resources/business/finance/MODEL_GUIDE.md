# Editable financial model

## Usage and scope

Edit `business/data/finance-assumptions.json`, then run `npm run export:business` to regenerate `FIVE_YEAR_MODEL.csv`, `UNIT_ECONOMICS.csv` and `VALUATION_SCENARIOS.json`. All three cases use the same tested `src/business/finance.js` as the /investors browser tool. CSVs are calculated snapshots; the JSON and browser controls are the editable model. Download browser JSON to save edits, then import it through Advanced assumptions to resume. No XLSX engine or cached spreadsheet values are implied.

Scope is a proposed retrofit monitoring kit, including installation coordination. It excludes new PV modules, roof canopy, grid inverter and EPC project costs. The lab BOM is a development cost; the old solar-system estimate is a separate site-capex model. Initial UAE price AED3,200 ex-tax; India INR45,000 ex-tax. All kit prices, COGS, CAC, churn, attach, fees, delivery costs, OPEX, tax and cash-timing assumptions are unvalidated. Get three supplier/EPC quotes and test paid pilots before a price commitment.

## Formula definitions

For each market and year:

- Hardware revenue = new installed units × kit price / local currency per USD. Installation is included in price and direct COGS, not counted as a second revenue stream.
- Direct COGS = units × (hardware + landed costs + installation + price × warranty reserve rate) / FX.
- Retained subscribers = opening subscribers × (1 − annual churn).
- New subscribers = new units × attach. Exit subscribers = retained + new.
- Average paid subscribers = retained + 0.5 × new, assuming new sales midyear and churn at year start.
- Monitoring revenue = average paid subscribers × monthly fee ×12 / FX. Exit software ARR uses exit subscribers and excludes service revenue.
- Service revenue/cost use the same paid contract population × annual fee/cost. These are bundled contracts in this first model. No duplicate standalone service attach is assumed.
- Gross profit = hardware + monitoring + service revenue − corresponding direct costs.
- EBITDA = gross profit − new units × CAC / FX − fixed OPEX. Fixed OPEX covers team/R&D/admin/insurance not already in direct installation or service COGS.
- Depreciation = cumulative capex × depreciation-rate assumption over the five-year horizon. Tax = max(0, EBITDA − depreciation) × effective-tax input. Loss carryforward, country thresholds and transfer pricing are not modeled.
- Working capital = revenue × receivable days/365 + material purchases × (inventory days − payable days)/365 + revenue × indirect-tax rate × tax float days/365.
- Free cash flow = EBITDA − tax − capex − change in working capital. Indirect taxes are cash floats, not revenue. Warranty reserve is treated as a current cash cost, conservatively.
- Cash before financing = opening cash + cumulative free cash flow. Incremental funding need = maximum negative closing balance across years. Debt/equity inflows and financing charges are excluded so the gap stays visible.

Fractional subscribers are expected-case values, not a customer count claim. Annual timing obscures intra-year cash troughs; build monthly treasury forecasts before raising/ordering inventory. Capex year 1 USD5,000 includes the approximately USD2,330 lab plan plus tools/integration access; do not add the lab BOM again. Initial cash assumes founder-reported AED10k received/unrestricted, USD/AED3.6725. Set opening cash to zero until confirmed. INR/USD85 is a budget assumption, not a current exchange-rate quotation.

## Scenarios and decisions

Conservative: slow EPC sales, low attach, high churn. Base: one beachhead followed by controlled expansion. Aggressive: large partner throughput that requires capacity and working capital not yet secured. None is a forecast commitment. Funding need is scenario output, not a fundraising ask already validated. Hardware sell-through is constrained by EPC throughput; recurring growth requires renewals. The case selector changes drivers within one build.

Useful sensitivities: halve volume; raise COGS/CAC by 25%; reduce attach; increase churn; stretch AR to90 days; set opening cash to zero; vary INR settlement FX and tax assumptions. Validate against paid invoices and retention cohorts before investor claims. Model excludes grants, debt/equity proceeds, interest, detailed depreciation vintages, statutory tax rulings and loan amortization. No financing offer exists.


Sources checked 2026-11-27:

- [CBUAE exchange rates](https://centralbank.ae/en/forex-eibor/exchange-rates/)
