const { db, send, admin, method } = require('../_lib');
module.exports = async function handler(req,res) {
  if (!method(req,res,['GET','POST'])) return;
  try {
    const sql = db();
    if (req.method === 'GET') {
      const isAdmin = await admin(req);
      const rows = isAdmin
        ? await sql`select id,title,release_type,description,genre,release_date,audio_url,cover_url,track_number,published,created_at from releases order by track_number asc, created_at desc`
        : await sql`select id,title,release_type,description,genre,release_date,audio_url,cover_url,track_number,published,created_at from releases where published=true order by track_number asc, created_at desc`;
      return send(res,200,{releases:rows});
    }
    if (!(await admin(req))) return send(res,401,{error:'Connexion administrateur requise.'});
    const b=req.body||{};
    const title=String(b.title||'').trim();
    const audioUrl=String(b.audio_url||'').trim();
    if (!title || !audioUrl) return send(res,400,{error:'Le titre et le fichier audio sont obligatoires.'});
    if (!/^https:\/\//i.test(audioUrl)) return send(res,400,{error:'URL audio invalide.'});
    const rows=await sql`insert into releases(title,release_type,description,genre,release_date,audio_url,cover_url,track_number,published) values (${title},${['single','album','mixtape'].includes(b.release_type)?b.release_type:'single'},${String(b.description||'').slice(0,3000)},${String(b.genre||'').slice(0,100)},${b.release_date||null},${audioUrl},${b.cover_url||null},${Math.max(1,Number(b.track_number)||1)},${b.published===true}) returning id,title,release_type,published`;
    return send(res,201,{release:rows[0]});
  } catch(e) {
    console.error('LAHMY releases:',e.message);
    return send(res,500,{error:'Erreur catalogue. Vérifiez DATABASE_URL et exécutez schema.sql.'});
  }
};