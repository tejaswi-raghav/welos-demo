import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer, preview } from 'vite';

// Bound both requests and runner lifetime. Keep-alive clients must not hold the
// preview server open after assertions, including on Node 22 in GitHub Actions.
const deadline = setTimeout(() => {
  console.error('Commercial HTTP verification exceeded 90 seconds');
  process.exit(1);
}, 90000);
const request = url => fetch(url, {
  headers: { Connection: 'close' },
  signal: AbortSignal.timeout(15000),
});
let dev, prod;
try {
  console.log('Starting isolated development server');
  dev = await createServer({ server: { host: '127.0.0.1', port: 5181, strictPort: true } });
  await dev.listen();
  console.log('Starting built production preview');
  prod = await preview({ preview: { host: '127.0.0.1', port: 4181, strictPort: true } });
  for (const port of [5181, 4181]) {
    for (const route of ['business','prototype','economics','developers','network','incentives','company','markets','partners','investors','enterprise','build']) {
      for (const suffix of ['', '/', '?review=1']) {
        const r = await request(`http://127.0.0.1:${port}/${route}${suffix}`);
        assert.equal(r.status, 200);
        assert((await r.text()).includes('commercial-root'));
      }
    }
    for (const route of ['','explorer.html','control.html','product.html','signin.html','os.html']) {
      const r = await request(`http://127.0.0.1:${port}/${route}`);
      assert.equal(r.status, 200);
      assert(!(await r.text()).includes('commercial-root'));
    }
    for (const resource of ['business/investors/WELOS_INVESTOR_PITCH.pptx','business/data/finance-assumptions.json']) {
      const r = await request(`http://127.0.0.1:${port}/resources/${resource}`);
      assert.equal(r.status, 404, 'Private resource must not be served');
    }
    console.log(`HTTP routes passed on ${port}: commercial/legacy routes and private resources denied`);
  }
  const research = await request('http://127.0.0.1:5181/api/commercial-research?resource=incentives');
  assert.equal(research.status, 200);
  const payload = await research.json();
  assert.equal(payload.schemaVersion, 1);
  assert(payload.data.some(program => program.id === 'pm'));
  console.log('Public research endpoint returned dated, allowlisted data');
} finally {
  console.log('Closing verification servers');
  dev?.httpServer?.closeAllConnections();
  if (dev) await dev.close();
  if (prod) {
    prod.httpServer.closeAllConnections();
    await new Promise((resolve, reject) => prod.httpServer.close(error => error ? reject(error) : resolve()));
  }
  clearTimeout(deadline);
}
