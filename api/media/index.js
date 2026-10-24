const { db, send, admin, method } = require('../_lib');
module.exports = async function handler(req,res){
 if(!method(req,res,['GET','POST']))return;
 try{
  const sql=db();
  if(req.method==='GET'){
   const isAdmin=await admin(req);
   const rows=isAdmin?await sql`select id,kind,title,description,media_url,published,created_at from media_posts order by created_at desc`:await sql`select id,kind,title,description,media_url,published,created_at from media_posts where published=true order by created_at desc`;
   return send(res,200,{posts:rows});
  }
  if(!(await admin(req)))return send(res,401,{error:'Connexion administrateur requise.'});
  const b=req.body||{},kind=['photo','video','news','event'].includes(b.kind)?b.kind:'photo',title=String(b.title||'').trim(),url=String(b.media_url||'').trim();
  if(!title)return send(res,400,{error:'Le titre est obligatoire.'});
  if(kind!=='news'&&!/^https:\/\//i.test(url))return send(res,400,{error:'Téléversez un média ou indiquez une URL HTTPS.'});
  const rows=await sql`insert into media_posts(kind,title,description,media_url,published) values(${kind},${title.slice(0,180)},${String(b.description||'').slice(0,3000)},${url},${b.published===true}) returning id,title,kind,published`;
  return send(res,201,{post:rows[0]});
 }catch(e){console.error('LAHMY media:',e.message);return send(res,500,{error:'Impossible d’enregistrer ce contenu.'});}
};