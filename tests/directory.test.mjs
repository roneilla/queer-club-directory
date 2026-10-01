import { build } from 'esbuild';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { writeFileSync, unlinkSync } from 'node:fs';
let connections=0, writes=0, update, query, conflict=false, matchedCount=1;
globalThis.__directoryConnect=()=>{connections++;return {db:()=>({collection:name=>{assert.equal(name,'clubs');return {
 find:()=>({sort:()=>({toArray:async()=>[{_id:'123456789012345678901234',name:'Existing'}]})}),
 updateOne:async(q,u,options)=>{assert.equal(options,undefined);if(conflict)throw Object.assign(new Error(),{code:11000});writes++;query=q;update=u;return {matchedCount};}
};}})};};
const output=await build({entryPoints:['netlify/functions/adminClubs/adminClubs.ts'],bundle:true,platform:'node',format:'esm',packages:'external',write:false,plugins:[{name:'mock',setup(b){b.onResolve({filter:/lib\/index\.js$/},()=>({path:'db',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export default async()=>globalThis.__directoryConnect();'}));}}]});
const file=new URL('./.directory-test-bundle.mjs',import.meta.url);writeFileSync(file,output.outputFiles[0].text);const {handler}=await import(file.href);unlinkSync(file);
const key='x'.repeat(64),id='123456789012345678901234';
const club={name:'Edited',description:'',category:'arts',instagram:'example',website:'https://example.com',subcategories:[{name:'Music'},{name:'Music'}],archived:true,updatedAt:'2000-01-01',dateAdded:'2000-01-01',_id:'untrusted',status:'untrusted'};
const request=(overrides={})=>handler({httpMethod:'POST',headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify({id,club}),...overrides});
test('directory read/update authorization, validation, field whitelist and conflicts',async()=>{
 delete process.env.ADMIN_ACCESS_KEY;assert.equal((await request()).statusCode,503);
 process.env.ADMIN_ACCESS_KEY=key;assert.equal((await request({headers:{}})).statusCode,401);assert.equal(connections,0);
 assert.equal((await request({httpMethod:'DELETE'})).statusCode,405);
 assert.equal((await request({body:'{'})).statusCode,400);
 assert.equal((await request({body:JSON.stringify({id:'invalid',club})})).statusCode,400);
 assert.equal((await request({body:JSON.stringify({id,club:{...club,website:'javascript:alert(1)'}})})).statusCode,400);
 assert.equal((await request({body:JSON.stringify({id,club:{...club,subcategories:[{name:{$gt:''}}]}})})).statusCode,400);
 assert.equal(writes,0);
 assert.equal((await request({httpMethod:'GET'})).statusCode,200);
 assert.equal((await request()).statusCode,200);assert.equal(String(query._id),id);
 assert.equal(update.$set.dateAdded,undefined);assert.equal(update.$set._id,undefined);assert.equal(update.$set.status,undefined);assert.equal(update.$set.description,'');
 assert.deepEqual(update.$set.subcategories,[{name:'Music'}]);
 assert.equal(update.$set.archived,undefined);
 assert.ok(Date.parse(update.$set.updatedAt) > Date.parse('2000-01-01'));
 assert.equal((await request({body:JSON.stringify({id,action:'archive'})})).statusCode,200);
 assert.equal(update.$set.archived,true);
 assert.deepEqual(Object.keys(update.$set).sort(),['archived','updatedAt']);
 assert.equal((await request({body:JSON.stringify({id,action:'restore'})})).statusCode,200);
 assert.equal(update.$set.archived,false);
 assert.equal((await request({body:JSON.stringify({id,action:'delete'})})).statusCode,400);
 matchedCount=0;assert.equal((await request()).statusCode,404);
 conflict=true;assert.equal((await request()).statusCode,409);
 delete process.env.ADMIN_ACCESS_KEY;
});
