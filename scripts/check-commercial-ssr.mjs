// Server-render all new pages to catch component crashes and broken resources.
// This is not a substitute for browser interaction or visual regression review.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
const server = await createServer({
  server: {
    middlewareMode: true,
    hmr: false
  },
  appType: 'custom'
});
try {
  const {
    App
  } = await server.ssrLoadModule('/src/commercial/main.jsx');
  const React = await import('react');
  const {
    renderToStaticMarkup
  } = await import('react-dom/server');
  const {
    ROUTES
  } = await server.ssrLoadModule('/src/commercial/routes.js');
  for (const path of Object.keys(ROUTES)) {
    const html = renderToStaticMarkup(React.createElement(App, {
      path: `/${path}`
    }));
    assert(html.includes('Commercial portal'));
    assert(html.includes('aria-current="page"'));
    assert(!html.includes('NaN'));
    assert(!html.includes('undefined'));
    for (const match of html.matchAll(/href="(\/resources\/[^\"]+)"/g)) assert(fs.existsSync('public' + match[1]), `Missing ${match[1]}`);
    console.log('Rendered and checked downloads:', path);
  }
} finally {
  await server.close();
}
