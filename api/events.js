const { db, send, admin, method } = require('./_lib');
module.exports = async function handler(req,res) {
  if (!method(req,res,['POST','GET'])) return;
  try {
    const sql=db();
    if (req.method==='POST') {
      const b=req.body||{};
      const id=String(b.release_id||'');
      const kind=String(b.event_type||'');
      if (!/^[0-9a-f-]{36}$/i.test(id) || !['play','download'].includes(kind)) return send(res,400,{error:'Événement invalide.'});
      await sql`insert into track_events(release_id,event_type) select id,${kind} from releases where id=${id} and published=true`;
      return send(res,201,{ok:true});
    }
    if (!(await admin(req))) return send(res,401,{error:'Connexion administrateur requise.'});
    const rows=await sql`select event_type,count(*)::int as total from track_events group by event_type`;
    const tracks=await sql`select r.id,r.title, count(e.id) filter(where e.event_type='play')::int as plays, count(e.id) filter(where e.event_type='download')::int as downloads from releases r left join track_events e on e.release_id=r.id group by r.id,r.title order by plays desc,downloads desc`;
    return send(res,200,{totals:rows,tracks});
  } catch(e) {
    console.error('LAHMY events:',e.message);
    return send(res,500,{error:'Statistiques indisponibles. Vérifiez la base Neon.'});
  }
};