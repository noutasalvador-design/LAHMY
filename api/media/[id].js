const { db, send, admin, method } = require('../_lib');
const { del } = require('@vercel/blob');
module.exports = async function handler(req,res){
 if(!method(req,res,['PATCH','DELETE']))return;
 if(!(await admin(req)))return send(res,401,{error:'Connexion administrateur requise.'});
 const id=String(req.query.id||'');if(!/^[0-9a-f-]{36}$/i.test(id))return send(res,400,{error:'Identifiant invalide.'});
 try{
  const sql=db();
  if(req.method==='DELETE'){
   const found=await sql`select media_url from media_posts where id=${id}`;
   if(!found.length)return send(res,404,{error:'Contenu introuvable.'});
   if(found[0].media_url){try{await del(found[0].media_url);}catch(e){console.warn('Blob cleanup:',e.message);}}
   await sql`delete from media_posts where id=${id}`;return send(res,200,{ok:true});
  }
  const b=req.body||{};if(typeof b.published!=='boolean')return send(res,400,{error:'Statut de publication invalide.'});
  const rows=await sql`update media_posts set published=${b.published} where id=${id} returning id,published`;
  if(!rows.length)return send(res,404,{error:'Contenu introuvable.'});return send(res,200,{post:rows[0]});
 }catch(e){console.error('LAHMY media update:',e.message);return send(res,500,{error:'Modification impossible.'});}
};