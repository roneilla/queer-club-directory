import { build } from 'esbuild';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { writeFileSync, unlinkSync } from 'node:fs';
import { ObjectId } from 'mongodb';
const id = new ObjectId().toString();
const clubId = new ObjectId().toString();
let db, connections=0, failReview=false;
const reset=()=>{db={events:[],eventSubmissions:[],clubs:[{_id:clubId,name:'Music club'}]};};
const matches=(row,filter)=>Object.entries(filter).every(([key,value])=>value&&typeof value==='object'&&'$ne' in value?row[key]!==value.$ne:String(row[key])===String(value));
const session={async withTransaction(fn){const before=structuredClone(db);try{await fn();}catch(e){db=before;throw e;}},async endSession(){}};
globalThis.__eventsConnect=()=>{connections++;return {startSession:()=>session,db:()=>({collection:name=>({
 find:(filter={})=>{const cursor={sort:()=>cursor,toArray:async()=>db[name].filter(r=>matches(r,filter))};return cursor;},
 findOne:async filter=>db[name].find(r=>matches(r,filter)),
 insertOne:async row=>{const doc={...row,_id:String(row._id||new ObjectId())};if(db[name].some(r=>r._id===doc._id))throw Object.assign(new Error(),{code:11000});db[name].push(doc);return {insertedId:doc._id};},
 updateOne:async(filter,update)=>{if(failReview&&name==='eventSubmissions')throw new Error('failure');const row=db[name].find(r=>matches(r,filter));if(row)Object.assign(row,update.$set);return {matchedCount:row?1:0};},
 deleteOne:async filter=>{const i=db[name].findIndex(r=>matches(r,filter));if(i>=0)db[name].splice(i,1);return {deletedCount:i>=0?1:0};}
})})};};
const result=await build({entryPoints:['lib/eventHandler.ts','shared/events.ts'],outdir:'unused',bundle:true,platform:'node',format:'esm',packages:'external',write:false,plugins:[{name:'mock',setup(b){b.onResolve({filter:/^\.\/index\.js$/},()=>({path:'db',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export default async()=>globalThis.__eventsConnect();'}));}}]});
async function load(output,name){const file=new URL(`./.${name}-test-bundle.mjs`,import.meta.url);writeFileSync(file,output.text);const mod=await import(file.href);unlinkSync(file);return mod;}
const {createEventHandler}=await load(result.outputFiles.find(f=>f.path.endsWith('eventHandler.js')),'event-handler');
const {validateEvent,eventOnDay,eventInMonth}=await load(result.outputFiles.find(f=>f.path.endsWith('/events.js')),'event-model');
const valid={title:'Music night',description:'Live music',date:'2026-09-30',time:'19:00',endDate:'2026-10-01',endTime:'01:00',location:'Toronto',website:'https://example.com',clubId,costType:'free',price:null,promoCode:'HELLO'};
const admin=createEventHandler('admin'),publicRead=createEventHandler('public'),submit=createEventHandler('submit');
const key='k'.repeat(64);
const request=(handler,body,extra={})=>handler({httpMethod:body?'POST':'GET',headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:body?JSON.stringify(body):null,...extra});
test('date, cost, link and calendar validation',()=>{
 assert.equal(validateEvent(valid).promoCode,'HELLO');
 assert.equal(validateEvent({...valid,costType:'pwyc',price:999}).price,null);
 assert.equal(validateEvent({...valid,costType:'other',price:12.50}).price,12.5);
 for(const change of [{date:'2026-02-30'},{time:'25:00'},{endDate:'2026-09-29'},{endDate:'',endTime:'18:00'},{costType:'other',price:null},{costType:'other',price:-1},{costType:'other',price:1.001},{costType:'other',price:'20'},{website:'javascript:alert(1)'},{clubId:'bad'}])assert.throws(()=>validateEvent({...valid,...change}));
 assert.equal(eventOnDay(valid,'2026-10-01'),true);assert.equal(eventOnDay(valid,'2026-10-02'),false);
 assert.equal(eventInMonth(valid,'2026-10'),true);assert.equal(eventInMonth(valid,'2026-11'),false);
 assert.equal(eventOnDay({...valid,date:'2028-02-29',endDate:''},'2028-02-29'),true);
});
test('public moderation, admin lifecycle, repeat approval, archive and rollback',async()=>{
 reset();delete process.env.ADMIN_ACCESS_KEY;
 assert.equal((await request(admin)).statusCode,503);process.env.ADMIN_ACCESS_KEY=key;
 assert.equal((await request(admin,null,{headers:{}})).statusCode,401);assert.equal(connections,0);
 assert.equal((await request(admin,{action:'save',id:'bad',event:valid})).statusCode,400);
 assert.equal((await request(publicRead,{event:valid})).statusCode,405);
 assert.equal((await request(submit,null)).statusCode,405);
 assert.equal((await request(submit,{event:{...valid,clubId:new ObjectId().toString()}})).statusCode,400);
 assert.equal((await request(submit,{event:{...valid,status:'approved',archived:true,_id:id},source:'events',action:'create'},{headers:{'content-type':'application/json'}})).statusCode,201);
 assert.equal(db.events.length,0);assert.equal(db.eventSubmissions[0].status,'submitted');assert.equal(db.eventSubmissions[0].archived,false);
 const submission=db.eventSubmissions[0];
 assert.equal(JSON.parse((await request(publicRead)).body).events.length,0);
 failReview=true;
 assert.equal((await request(admin,{action:'approve',source:'eventSubmissions',id:submission._id,event:valid})).statusCode,500);
 assert.equal(db.events.length,0);assert.equal(db.eventSubmissions[0].status,'submitted');failReview=false;
 assert.equal((await request(admin,{action:'approve',source:'eventSubmissions',id:submission._id,event:valid})).statusCode,200);
 assert.equal(db.events.length,1);assert.equal(db.eventSubmissions[0].status,'approved');
 assert.equal((await request(admin,{action:'approve',source:'eventSubmissions',id:submission._id,event:valid})).statusCode,409);
 let published=JSON.parse((await request(publicRead)).body);assert.equal(published.events[0].club.name,'Music club');assert.equal(published.submissions,undefined);
 assert.equal((await request(admin,{action:'archive',id:submission._id})).statusCode,200);
 assert.equal(JSON.parse((await request(publicRead)).body).events.length,0);
 assert.equal(JSON.parse((await request(admin)).body).events.length,1);
 assert.equal((await request(admin,{action:'save',id:submission._id,event:{...valid,title:'Changed'}})).statusCode,200);
 assert.equal(db.events[0].archived,true);assert.equal(db.events[0].title,'Changed');
 assert.equal((await request(admin,{action:'restore',id:submission._id})).statusCode,200);
 assert.equal(JSON.parse((await request(publicRead)).body).events.length,1);
 assert.equal((await request(admin,{action:'remove',id:submission._id})).statusCode,200);assert.equal(db.events.length,0);
 assert.equal((await request(admin,{action:'remove',id:submission._id})).statusCode,404);
 assert.equal((await request(admin,{action:'create',event:valid})).statusCode,201);
 assert.equal((await request(admin,{action:'reject',source:'eventSubmissions',id:submission._id})).statusCode,200);
 assert.equal(db.eventSubmissions[0].status,'rejected');assert.equal(db.events.length,1);
 delete process.env.ADMIN_ACCESS_KEY;
});

test('weekly schedules match weekdays, optional bounds and DST without changing local time',()=>{
 const recurring={...valid,recurrence:'weekly',weekday:2,date:'',endDate:'',endTime:'21:00'};
 const parsed=validateEvent(recurring);
 assert.equal(parsed.recurrence,'weekly');assert.equal(parsed.time,'19:00');
 assert.equal(eventOnDay(parsed,'2026-03-03'),true);
 assert.equal(eventOnDay(parsed,'2026-03-10'),true);
 assert.equal(eventOnDay(parsed,'2026-03-11'),false);
 assert.equal(eventInMonth(parsed,'2026-03'),true);
 assert.equal(eventOnDay({...parsed,date:'2026-03-10',endDate:'2026-03-17'},'2026-03-03'),false);
 assert.equal(eventOnDay({...parsed,date:'2026-03-10',endDate:'2026-03-17'},'2026-03-10'),true);
 assert.equal(eventOnDay({...parsed,date:'2026-03-10',endDate:'2026-03-17'},'2026-03-17'),true);
 assert.equal(eventOnDay({...parsed,date:'2026-03-10',endDate:'2026-03-17'},'2026-03-24'),false);
 assert.equal(eventInMonth({...parsed,date:'2026-04-01'},'2026-03'),false);
 assert.equal(eventOnDay({...parsed,weekday:0},'2026-03-08'),true);
 for(const change of [{weekday:null},{weekday:7},{weekday:'2'},{weekday:1.5},{date:'2026-02-30'},{date:'2026-04-01',endDate:'2026-03-01'},{endTime:'18:00'},{recurrence:'daily'}]) assert.throws(()=>validateEvent({...recurring,...change}));
 const once=validateEvent({...valid,weekday:2,recurrence:'once'});assert.equal(once.weekday,null);
});
test('public API returns undated weekly events and admin edits can change recurrence',async()=>{
 reset();process.env.ADMIN_ACCESS_KEY=key;
 const recurring={...valid,recurrence:'weekly',weekday:2,date:'',endDate:'',endTime:''};
 assert.equal((await request(admin,{action:'create',event:recurring})).statusCode,201);
 const record=db.events[0];
 let rows=JSON.parse((await request(publicRead)).body).events;
 assert.equal(rows.length,1);assert.equal(rows[0].weekday,2);assert.equal(rows[0].recurrence,'weekly');
 assert.equal((await request(admin,{action:'save',id:record._id,event:{...valid,recurrence:'once'}})).statusCode,200);
 rows=JSON.parse((await request(publicRead)).body).events;
 assert.equal(rows[0].weekday,null);assert.equal(rows[0].recurrence,'once');
 delete process.env.ADMIN_ACCESS_KEY;
});
