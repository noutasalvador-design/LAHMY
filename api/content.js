const { db, send, admin, method } = require('./_lib');
module.exports = async function handler(req,res) {
 if(!method(req,res,['GET','PATCH']))return;
 try{
  const sql=db();
  if(req.method==='GET'){
   const rows=await sql`select key,value from site_content`;
   return send(res,200,{content:Object.fromEntries(rows.map(r=>[r.key,r.value]))});
  }
  if(!(await admin(req)))return send(res,401,{error:'Connexion administrateur requise.'});
  const b=req.body||{},allowed=['bio_fr','bio_en','news_fr','news_en','hero_photo_url','artist_photo_url'];
  const saved={};
  for(const key of allowed){if(typeof b[key]==='string'){const value=b[key].slice(0,5000);await sql`insert into site_content(key,value,updated_at) values(${key},${value},now()) on conflict(key) do update set value=excluded.value,updated_at=now()`;saved[key]=value;}}
  return send(res,200,{ok:true,content:saved});
 }catch(e){console.error('LAHMY content:',e.message);return send(res,500,{error:'Impossible de sauvegarder le contenu.'});}
};