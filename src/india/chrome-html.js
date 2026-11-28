// Header and footer for the India pages, plus the UAE ⇄ India market switch.
// The shared UAE chrome in src/ui is left as it was; vite.config.js composes the two.
export const INDIA_PAGES = ["india", "indiacities"];
const NAV = [["/", "Story"], ["/explorer.html", "Explorer"], ["/control.html", "Control OS"], ["/india.html", "Product", "india"], ["/india-cities.html", "Cities", "indiacities"]];

const MARKET_CSS = `<style>.market{display:inline-flex;padding:2px;border-radius:999px;box-shadow:inset 0 0 0 1px var(--line-2)}.market a{padding:5px 10px;border-radius:999px;font:500 11px/1.2 var(--f-mono);text-decoration:none;color:var(--muted)}.market a[aria-current]{background:var(--text);color:var(--on-text)}.loc-chip{display:inline-flex;align-items:center;gap:6px;max-width:160px;padding:6px 11px;border:1px solid var(--line-2);border-radius:999px;background:var(--surface);font-size:12.5px;white-space:nowrap}.loc-chip i{flex:none;width:7px;height:7px;border-radius:50%;background:var(--power)}.loc-chip span{overflow:hidden;text-overflow:ellipsis}@media(max-width:480px){.market-page{gap:8px}.market-page .head-right{gap:6px}.market a{padding:5px 7px;font-size:10.5px}.loc-chip{max-width:104px}.market-page .brand img{width:84px;height:auto}.market-page .signin-btn{padding:0 8px;white-space:nowrap}}@media(max-width:360px){.market-page.site-head{padding-inline:8px}.market-page .brand img{width:64px}.market-page .head-right{gap:4px}.market a{padding:5px 5px}}</style>`;

/** The market is always the visitor's choice; it is never inferred from where they are. */
export function marketSwitch(market) {
  return `${MARKET_CSS}<div class="market" role="group" aria-label="Market"><a href="/product.html"${market === "uae" ? ' aria-current="true"' : ""}>UAE</a><a href="/india.html"${market === "in" ? ' aria-current="true"' : ""}>India</a></div>`;
}

export function indiaHeaderHtml(page) {
  const nav = NAV.map(([href, label, id], i) => `<a href="${href}"${id === page ? ' aria-current="page"' : ""}><i>0${i + 1}</i>${label}</a>`).join("");
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-head market-page" id="site-head">
  <a class="brand" href="/" aria-label="WELOS home"><img class="wm-ink" src="/brand/welos-wordmark-ink.svg" alt="WELOS" width="164" height="15"><img class="wm-ivory" src="/brand/welos-wordmark-ivory.svg" alt="" width="164" height="15"></a>
  <nav class="nav" id="site-nav" aria-label="Primary">${nav}</nav>
  <div class="head-right">
    <button type="button" class="loc-chip" id="loc-chip" aria-label="Change city"><i aria-hidden="true"></i><span>Choose city</span></button>
    ${marketSwitch("in")}
    <button type="button" class="menu-btn" aria-controls="site-nav" aria-expanded="false" aria-label="Menu"><span></span></button>
  </div>
</header>`;
}

export function indiaFooterHtml() {
  const nav = NAV.map(([href, label]) => `<a href="${href}">${label}</a>`).join("") + `<a href="/product.html">UAE product</a>`;
  return `<footer class="site-foot">
  <div>
    <img src="/brand/welos-wordmark-ivory.svg" alt="WELOS" width="132" height="12" loading="lazy">
    <p>welOS India. Indicative planning figures for battery-free, grid-tied solar, computed from the published sources listed on these pages. Not an installer quotation, a subsidy approval or a deployed product. Final designs need a site survey, structural review and utility approval.</p>
  </div>
  <nav aria-label="Footer">${nav}</nav>
</footer>`;
}
