import { build } from 'esbuild';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
const output=await build({entryPoints:['src/eventDisplay.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {calendarDays,eventCategory}=await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`);
test('calendar fills complete weeks, handles leap days and year boundaries',()=>{
 const june=calendarDays('2024-06');assert.equal(june[0],'2024-05-26');assert.equal(june.at(-1),'2024-07-06');assert.equal(june.length,42);
 const feb=calendarDays('2028-02');assert.ok(feb.includes('2028-02-29'));assert.equal(feb.length%7,0);
 assert.ok(calendarDays('2027-01').includes('2026-12-31'));
 assert.equal(eventCategory({category:'arts',club:{category:'sports'}}),'arts');
 assert.equal(eventCategory({club:{category:'sports'}}),'sports');
 assert.equal(eventCategory({}),'');
});
