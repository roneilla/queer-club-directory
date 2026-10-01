import { build } from 'esbuild';
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
const output = await build({entryPoints:['lib/clubValidation.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {validateClub} = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`);
test('club requires at least one usable contact field for publication and directory edits', () => {
 const base = {name:'Club',description:'Description',category:'arts'};
 for (const requireDescription of [true,false]) {
  for (const contact of [{}, {instagram:' ',website:' '}, {instagram:'@',website:''}, {instagram:'@ ',website:' '}]) {
   assert.throws(()=>validateClub({...base,...contact},requireDescription),/Instagram handle or a website/);
  }
  assert.equal(validateClub({...base,instagram:'@club'},requireDescription).instagram,'club');
  assert.equal(validateClub({...base,website:'https://example.com'},requireDescription).website,'https://example.com');
  assert.equal(validateClub({...base,instagram:'club',website:'https://example.com'},requireDescription).instagram,'club');
 }
});

test('Instagram accepts handles and rejects profile URLs', () => {
 const base = {name:'Run It Back: Free Queer Movies',description:'Free year-round screening series hosted by Inside Out.',category:'entertainment',website:'https://insideout.ca/initiatives/run-it-back/'};
 for (const instagram of ['insideoutfestival', '@InsideOutFestival']) {
  assert.equal(validateClub({...base,instagram}).instagram,'insideoutfestival');
 }
 for (const instagram of ['https://www.instagram.com/insideoutfestival/', 'www.instagram.com/insideoutfestival/', 'instagram.com/insideoutfestival', 'https://example.com/insideoutfestival', 'https://instagram.com.evil.test/insideoutfestival', 'https://instagram.com/p/post123/', 'https://instagram.com/reel/123/', 'https://instagram.com/', 'x'.repeat(31)]) {
  assert.throws(()=>validateClub({...base,instagram}),/Instagram/);
 }
});
