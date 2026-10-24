const { db, send, admin, method } = require('../_lib');
module.exports = async function handler(req,res) {
  if (!method(req,res,['PATCH','DELETE'])) return;
  if (!(await admin(req))) return send(res,401,{error:'Connexion administrateur requise.'});
  const id=String(req.query.id||'');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return send(res,400,{error:'Identifiant invalide.'});
  try {
    const sql=db();
    if (req.method==='DELETE') {
      await sql`delete from releases where id=${id}`;
      return send(res,200,{ok:true});
    }
    const b=req.body||{};
    const rows=await sql`update releases set title=coalesce(${b.title===undefined?null:String(b.title).trim()},title), release_type=coalesce(${['single','album','mixtape'].includes(b.release_type)?b.release_type:null},release_type), description=coalesce(${b.description===undefined?null:String(b.description).slice(0,3000)},description), genre=coalesce(${b.genre===undefined?null:String(b.genre).slice(0,100)},genre), published=coalesce(${typeof b.published==='boolean'?b.published:null},published), track_number=coalesce(${Number.isFinite(Number(b.track_number))&&b.track_number!==undefined?Math.max(1,Number(b.track_number)):null},track_number) where id=${id} returning id,published`;
    if (!rows.length) return send(res,404,{error:'Sortie introuvable.'});
    return send(res,200,{release:rows[0]});
  } catch(e) {
    console.error('LAHMY release update:',e.message);
    return send(res,500,{error:'Modification impossible.'});
  }
};