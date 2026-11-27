// Shared page chrome, injected at build time by the Vite plugin in vite.config.js so every
// page ships the same static header (no layout flash, stable view transitions).
export const PAGES = [
  { id: "home", href: "/", label: "Story", n: "01" },
  { id: "explorer", href: "/explorer.html", label: "Explorer", n: "02" },
  { id: "control", href: "/control.html", label: "Control OS", n: "03" },
  { id: "product", href: "/product.html", label: "Product", n: "04" },
];

export const headTags = `
<meta name="theme-color" content="#fff5e6">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="icon" href="/favicon.png" type="image/png" sizes="64x64">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">`;

export function headerHtml(page) {
  const nav = PAGES.map((p) => `<a href="${p.href}"${p.id === page ? ' aria-current="page"' : ""}><i>${p.n}</i>${p.label}</a>`).join("");
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-head" id="site-head">
  <a class="brand" href="/" aria-label="WELOS home"><img class="wm-ink" src="/brand/welos-wordmark-ink.svg" alt="WELOS" width="164" height="15"><img class="wm-ivory" src="/brand/welos-wordmark-ivory.svg" alt="" width="164" height="15"></a>
  <nav class="nav" id="site-nav" aria-label="Primary">${nav}</nav>
  <div class="head-right">
    <span class="sim-chip" title="Every value on this site comes from a deterministic simulation of a concept reference unit">Simulated · concept unit</span>
    <button type="button" class="ai-btn" data-ai-open><i aria-hidden="true"></i><span>WELOS AI</span></button>
    <a class="signin-btn" href="/signin.html">Sign in</a>
    <button type="button" class="menu-btn" aria-controls="site-nav" aria-expanded="false" aria-label="Menu"><span></span></button>
  </div>
</header>`;
}

export function footerHtml() {
  const nav = PAGES.map((p) => `<a href="${p.href}">${p.label}</a>`).join("");
  return `<footer class="site-foot">
  <div>
    <img src="/brand/welos-wordmark-ivory.svg" alt="WELOS" width="132" height="12" loading="lazy">
    <p>WELOS · Dubai, UAE. Concept hardware: the model, controller and simulations on this site describe a reference design, not a deployed product. Every number is computed by the open control engine or the sizing engine in this repository. Final designs need a site survey, structural review and local approvals.</p>
  </div>
  <nav aria-label="Footer">${nav}<a href="#" data-ai-open>WELOS AI</a><a href="/business">Explore welOS Business ↗</a></nav>
</footer>`;
}
