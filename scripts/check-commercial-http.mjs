import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer, preview } from 'vite';
const dev=await createServer({server:{host:'127.0.0.1',port:5181,strictPort:true}});
await dev.listen();
const prod=await preview({preview:{host:'127.0.0.1',port:4181,strictPort:true}});
try {
 for(const port of [5181,4181]) {
  for(const route of ['business','prototype','markets','partners','incentives','investors','enterprise'])for(const suffix of ['', '/', '?review=1']) {
   const r=await fetch(`http://127.0.0.1:${port}/${route}${suffix}`);assert.equal(r.status,200);assert((await r.text()).includes('commercial-root'));
  }
  for(const route of ['','explorer.html','control.html','product.html','signin.html','os.html']) {
   const r=await fetch(`http://127.0.0.1:${port}/${route}`);assert.equal(r.status,200);assert(!(await r.text()).includes('commercial-root'));
  }
  const ppt=await fetch(`http://127.0.0.1:${port}/resources/business/investors/WELOS_INVESTOR_PITCH.pptx`);assert.equal(ppt.status,200);assert.deepEqual(Buffer.from(await ppt.arrayBuffer()),fs.readFileSync('public/resources/business/investors/WELOS_INVESTOR_PITCH.pptx'));
  console.log(`HTTP routes passed on ${port}: seven commercial, six original, slash/query variants and PPTX download`);
 }
} finally {await dev.close();await new Promise(resolve=>prod.httpServer.close(resolve));}
