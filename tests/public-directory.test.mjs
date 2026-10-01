import { build } from 'esbuild';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { writeFileSync, unlinkSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
async function compile(entry, name, plugins = []) {
 const result=await build({entryPoints:[entry],bundle:true,platform:'node',format:'esm',packages:'external',write:false,jsx:'automatic',plugins});
 const file=new URL(`./.${name}-bundle.mjs`,import.meta.url);writeFileSync(file,result.outputFiles[0].text);
 const mod=await import(file.href);unlinkSync(file);return mod;
}
const {default:Highlight}=await compile('src/components/SearchHighlight.tsx','highlight');
test('search highlights accents, case, multiple matches and treats markup as text',()=>{
 const html=renderToStaticMarkup(createElement(Highlight,{text:'Café CAFÉ music',query:'cafe music'}));
 assert.equal((html.match(/<mark /g)||[]).length,3);
 assert.ok(html.includes('Café</mark>'));
 assert.equal(renderToStaticMarkup(createElement(Highlight,{text:'<script>test</script>',query:'test'})).includes('<script>'),false);
 assert.equal(renderToStaticMarkup(createElement(Highlight,{text:'Unchanged',query:''})),'Unchanged');
});
let filter;
globalThis.__publicDb={db:()=>({collection:()=>({find:q=>{filter=q;return {toArray:async()=>[{name:'Visible'}]};}})})};
const {handler}=await compile('netlify/functions/getClubs/getClubs.ts','public-clubs',[{name:'mock',setup(b){b.onResolve({filter:/^\.\.\/\.\.\/\.\.\/lib$/},()=>({path:'db',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export default async()=>globalThis.__publicDb;'}));}}]);
test('public directory excludes archived records at the database query',async()=>{
 const response=await handler({});assert.equal(response.statusCode,200);
 assert.deepEqual(filter,{archived:{$ne:true}});
 assert.equal(response.headers['Cache-Control'],'no-store');
});
