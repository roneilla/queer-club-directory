import { Handler } from '@netlify/functions';
import { ObjectId } from 'mongodb';
import getConnection from './index.js';
import { adminAuth } from './adminAuth';
import { validateEvent, validSchedule } from '../shared/events';
const reply = (statusCode: number, body: object) => ({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(body)});
class EventError extends Error { constructor(public status: number,message: string) { super(message); } }
const projection = {recurrence:1,weekday:1,category:1,title:1,description:1,date:1,time:1,endDate:1,endTime:1,location:1,website:1,clubId:1,costType:1,price:1,promoCode:1,archived:1,status:1,updatedAt:1};
export const createEventHandler = (mode: 'public' | 'submit' | 'admin'): Handler => async request => {
 if (mode === 'admin') { const failure=adminAuth(request.headers); if(failure)return reply(failure.statusCode,{error:failure.error}); }
 const methods = mode === 'admin' ? ['GET','POST'] : mode === 'public' ? ['GET'] : ['POST'];
 if(!methods.includes(request.httpMethod))return reply(405,{error:'Method not allowed.'});
 try {
  let input: Record<string, unknown> = {};
  let details: ReturnType<typeof validateEvent> | undefined;
  let action = '';
  let id: ObjectId | undefined;
  let source = 'events';
  if(request.httpMethod==='POST') {
   if(!request.headers['content-type']?.toLowerCase().startsWith('application/json'))return reply(415,{error:'Expected JSON.'});
   if(!request.body || request.body.length>20000)return reply(400,{error:'Invalid request size.'});
   try { input=JSON.parse(request.body); } catch {return reply(400,{error:'Invalid JSON.'});}
   if(!input || typeof input!=='object' || Array.isArray(input))return reply(400,{error:'Invalid request.'});
   if(mode==='submit') {
    if(input.honeypot)return reply(200,{success:true});
    action='submit'; source='eventSubmissions';
   } else {
    action=String(input.action || '');
    if(!['create','save','approve','reject','archive','restore','remove'].includes(action))return reply(400,{error:'Invalid event action.'});
    source=input.source==='eventSubmissions'?'eventSubmissions':'events';
    if(input.source && !['events','eventSubmissions'].includes(String(input.source)))return reply(400,{error:'Invalid source.'});
    if(['approve','reject'].includes(action) && source!=='eventSubmissions')return reply(400,{error:'Only submissions can be reviewed.'});
    if(['create','archive','restore'].includes(action) && source!=='events')return reply(400,{error:'This action requires an event.'});
    if(action!=='create') {
     if(typeof input.id!=='string' || !/^[a-f0-9]{24}$/i.test(input.id))return reply(400,{error:'Invalid event ID.'});
     id=new ObjectId(input.id);
    }
   }
   if(['submit','create','save','approve'].includes(action)) {
    try { details=validateEvent(input.event); } catch(e) {return reply(400,{error:(e as Error).message});}
   }
  }
  const client=await getConnection(); const db=client.db(process.env.MONGODB_DATABASE);
  if(request.httpMethod==='GET') {
   const clubs=await db.collection('clubs').find({archived:{$ne:true}},{projection:{category:1,name:1,description:1,instagram:1,website:1}}).toArray();
   const events=await db.collection('events').find(mode==='public'?{archived:{$ne:true}}:{},{projection}).sort({date:1,time:1}).toArray();
   const hydrated=events.filter(e=>mode==='admin'||validSchedule({date:e.date||'',endDate:e.endDate||'',recurrence:e.recurrence,weekday:e.weekday})).map(e=>({...e,club:clubs.find(c=>String(c._id)===String(e.clubId))||null}));
   const submissions=mode==='admin'?await db.collection('eventSubmissions').find({},{projection}).sort({_id:-1}).toArray():undefined;
   return reply(200,{events:hydrated,clubs,...(submissions?{submissions}:{})});
  }
  if(details?.clubId) {
   const club=await db.collection('clubs').findOne({_id:new ObjectId(details.clubId),archived:{$ne:true}});
   if(!club)return reply(400,{error:'The selected club is unavailable. Choose another club or no linked club.'});
  }
  const collection=db.collection(source); const now=new Date().toISOString();
  if(action==='submit'||action==='create') {
   const result=await collection.insertOne({...details,archived:false,createdAt:now,updatedAt:now,...(action==='submit'?{status:'submitted'}:{})});
   return reply(201,{success:true,id:result.insertedId});
  }
  if(action==='approve') {
   const session=client.startSession();
   try { await session.withTransaction(async()=>{
    const submission=await collection.findOne({_id:id},{session});
    if(!submission)throw new EventError(404,'Submission not found.');
    if(submission.status==='approved')throw new EventError(409,'Already approved. Edit this event in the Events list.');
    const existing=await db.collection('events').findOne({_id:id},{session});
    if(existing)throw new EventError(409,'This event already exists. Edit it in the Events list.');
    await db.collection('events').insertOne({_id:id,...details,archived:false,createdAt:now,updatedAt:now},{session});
    await collection.updateOne({_id:id},{$set:{...details,status:'approved',updatedAt:now}},{session});
   }); } finally { await session.endSession(); }
  } else if(action==='remove') {
   const result=await collection.deleteOne({_id:id});
   if(!result.deletedCount)return reply(404,{error:'Entry not found.'});
  } else {
   const changes=action==='save'?details:action==='reject'?{status:'rejected'}:{archived:action==='archive'};
   const result=await collection.updateOne({_id:id},{$set:{...changes,updatedAt:now}});
   if(!result.matchedCount)return reply(404,{error:'Entry not found.'});
  }
  return reply(200,{success:true});
 } catch(e) {
  if(e instanceof EventError)return reply(e.status,{error:e.message});
  if((e as {code?:number}).code===11000)return reply(409,{error:'This event already exists. Refresh the list.'});
  return reply(500,{error:'Could not complete the event request. Please retry.'});
 }
};
