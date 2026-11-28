import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { headerHtml, footerHtml, headTags } from "./src/ui/chrome-html.js";
import { INDIA_PAGES, indiaHeaderHtml, indiaFooterHtml, marketSwitch } from "./src/india/chrome-html.js";

// India pages get their own header and footer. The UAE product page gains only the market switch.
function pageHeader(page) {
  if (INDIA_PAGES.includes(page)) return indiaHeaderHtml(page);
  const html = headerHtml(page);
  if (page !== "product") return html;
  return html.replace('class="site-head"', 'class="site-head market-page"').replace('<button type="button" class="ai-btn"', `${marketSwitch("uae")}<button type="button" class="ai-btn"`);
}

// Serves the Vercel functions in /api during `npm run dev`, so location search,
// climate lookup and the AI advisor work locally exactly as they do on Vercel.
function vercelApi() {
  return {
    name: "welos-vercel-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        let url;
        try { url = new URL(req.url, "http://localhost"); } catch { return next(); }
        const match = url.pathname.match(/^\/api\/([a-z-]+)$/);
        const file = match && resolve(__dirname, "api", `${match[1]}.js`);
        if (!file || !existsSync(file)) return next();
        let raw = "";
        for await (const chunk of req) raw += chunk;
        req.query = Object.fromEntries(url.searchParams);
        try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = raw; }
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (data) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(data)); return res; };
        try {
          const { default: handler } = await import(`${pathToFileURL(file).href}?t=${Date.now()}`);
          await handler(req, res);
        } catch (error) {
          server.config.logger.error(error.stack || String(error));
          if (!res.headersSent) res.status(500).json({ error: "Local API error." });
        }
      });
    },
  };
}

// Injects the shared head tags, header and footer into every page: <html data-page="…">.
function welosChrome() {
  return {
    name: "welos-chrome",
    transformIndexHtml(html) {
      const page = html.match(/<html[^>]*data-page="([a-z]+)"/)?.[1] || "";
      return html.replace("<!--head-->", headTags).replace("<!--header-->", pageHeader(page)).replace("<!--footer-->", INDIA_PAGES.includes(page) ? indiaFooterHtml() : footerHtml());
    },
  };
}

function commercialRewrite(req, _res, next) {
  if (/^\/(business|prototype|markets|partners|incentives|investors|enterprise)\/?(?:\?|$)/.test(req.url || "")) req.url = "/commercial.html";
  next();
}

export default defineConfig({
  plugins: [react(), vercelApi(), welosChrome(), {
    name: "welos-commercial-routes",
    configureServer(server) {
      server.middlewares.use(commercialRewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(commercialRewrite);
    },
  }],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: { manualChunks: { three: ["three"], react: ["react", "react-dom"] } },
      input: {
        landing: resolve(__dirname, "index.html"),
        commercial: resolve(__dirname, "commercial.html"),
        explorer: resolve(__dirname, "explorer.html"),
        control: resolve(__dirname, "control.html"),
        product: resolve(__dirname, "product.html"),
        india: resolve(__dirname, "india.html"),
        indiaCities: resolve(__dirname, "india-cities.html"),
        signin: resolve(__dirname, "signin.html"),
        os: resolve(__dirname, "os.html"),
      },
    },
  },
});
