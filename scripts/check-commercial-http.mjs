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
    for (const route of ['business','prototype','markets','partners','incentives','investors','enterprise']) {
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
    const ppt = await request(`http://127.0.0.1:${port}/resources/business/investors/WELOS_INVESTOR_PITCH.pptx`);
    assert.equal(ppt.status, 200);
    assert.deepEqual(Buffer.from(await ppt.arrayBuffer()), fs.readFileSync('public/resources/business/investors/WELOS_INVESTOR_PITCH.pptx'));
    console.log(`HTTP routes passed on ${port}: seven commercial, six original, slash/query variants and byte-exact PPTX download`);
  }
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
