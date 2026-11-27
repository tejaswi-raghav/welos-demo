import test from 'node:test';
import assert from 'node:assert/strict';
import handler from './commercial-research.js';
function call(method,query={}){const res={headers:{},code:200,setHeader(k,v){this.headers[k]=v;},status(v){this.code=v;return this;},json(v){this.body=v;return this;},end(){this.ended=true;}};handler({method,query},res);return res;}
test('Commercial research endpoint exposes dated allowlisted public data only',()=>{for(const resource of ['markets','incentives','sources']){const r=call('GET',{resource});assert.equal(r.code,200);assert.equal(r.body.resource,resource);assert(r.body.data.length);assert.equal(r.body.verifiedDate,'2026-11-27');assert(!JSON.stringify(r.body).includes('openingCashUsd'));}});
test('Commercial research endpoint rejects writes and arbitrary/private lookups',()=>{assert.equal(call('POST').code,405);assert.equal(call('GET',{resource:'../finance-assumptions'}).code,400);assert.equal(call('GET',{resource:'__proto__'}).code,400);assert.equal(call('HEAD').ended,true);});
