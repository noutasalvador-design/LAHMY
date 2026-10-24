import { upload } from 'https://esm.sh/@vercel/blob/client';

const $ = s => document.querySelector(s);
const say = (id, message) => { const el=$(id); if(el) el.textContent=message; };
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(url, options={}) {
  const response=await fetch(url,{credentials:'same-origin',headers:{'Content-Type':'application/json',...(options.headers||{})},...options});
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.error||'Une erreur est survenue.');
  return data;
}
async function refresh() {
  try {
    const state=await api('/api/auth/me');
    $('#login-panel').classList.toggle('hidden',state.authenticated);
    $('#dashboard').classList.toggle('hidden',!state.authenticated);
    $('#setup-warning').classList.toggle('hidden',state.authenticated);
    if(!state.authenticated){say('#setup-status','Le serveur attend DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD_HASH, SESSION_SECRET et BLOB_READ_WRITE_TOKEN dans les variables Vercel.');return;}
    const {releases}=await api('/api/releases');
    $('#release-admin').innerHTML=releases.length?releases.map(r=>'<div class="release-row"><div><strong>'+esc(r.title)+'</strong><small>'+esc(r.release_type)+' · '+(r.published?'Publié':'Brouillon')+' · piste '+r.track_number+'</small></div><div><button type="button" data-pub="'+r.id+'">'+(r.published?'DÉPUBLIER':'PUBLIER')+'</button><button type="button" data-del="'+r.id+'">SUPPRIMER</button></div></div>').join(''):'Aucune sortie pour le moment.';
    $('#release-admin').querySelectorAll('[data-pub]').forEach(b=>b.addEventListener('click',async()=>{try{const r=releases.find(x=>x.id===b.dataset.pub);await api('/api/releases/'+r.id,{method:'PATCH',body:JSON.stringify({published:!r.published})});say('#catalog-status','Statut mis à jour.');await refresh();}catch(e){say('#catalog-status',e.message);}}));
    $('#release-admin').querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',async()=>{if(!confirm('Supprimer cette sortie ?'))return;try{await api('/api/releases/'+b.dataset.del,{method:'DELETE'});say('#catalog-status','Sortie supprimée.');await refresh();}catch(e){say('#catalog-status',e.message);}}));
    
    const contentData=await api('/api/content');
    const cf=$('#content-form');
    if(cf&&!cf.dataset.loaded){cf.elements.bio_fr.value=contentData.content.bio_fr||'';cf.elements.bio_en.value=contentData.content.bio_en||'';cf.dataset.loaded='1';}
    const mediaData=await api('/api/media');
    $('#media-admin').innerHTML=(mediaData.posts||[]).map(p=>'<div class="release-row"><div><strong>'+esc(p.title)+'</strong><small>'+esc(p.kind)+' · '+(p.published?'Publié':'Brouillon')+'</small></div><div><button type="button" data-media-pub="'+p.id+'">'+(p.published?'DÉPUBLIER':'PUBLIER')+'</button><button type="button" data-media-del="'+p.id+'">SUPPRIMER</button></div></div>').join('')||'Aucun contenu média.';
    $('#media-admin').querySelectorAll('[data-media-pub]').forEach(b=>b.addEventListener('click',async()=>{try{const p=mediaData.posts.find(x=>x.id===b.dataset.mediaPub);await api('/api/media/'+p.id,{method:'PATCH',body:JSON.stringify({published:!p.published})});await refresh();}catch(e){say('#media-status',e.message);}}));
    $('#media-admin').querySelectorAll('[data-media-del]').forEach(b=>b.addEventListener('click',async()=>{if(!confirm('Supprimer ce contenu ?'))return;try{await api('/api/media/'+b.dataset.mediaDel,{method:'DELETE'});say('#media-status','Contenu supprimé.');await refresh();}catch(e){say('#media-status',e.message);}}));
    const stats=await api('/api/events');
    const totals=Object.fromEntries((stats.totals||[]).map(x=>[x.event_type,x.total]));
    $('#stats').innerHTML='<p>Écoutes enregistrées : <strong>'+Number(totals.play||0)+'</strong></p><p>Téléchargements enregistrés : <strong>'+Number(totals.download||0)+'</strong></p>'+(stats.tracks||[]).map(t=>'<p>'+esc(t.title)+' — '+t.plays+' écoutes · '+t.downloads+' téléchargements</p>').join('');
  } catch(e) { say('#catalog-status',e.message); }
}
$('#login-form').addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.currentTarget);say('#login-status','Connexion…');try{await api('/api/auth/login',{method:'POST',body:JSON.stringify({email:f.get('email'),password:f.get('password')})});say('#login-status','Connexion réussie.');await refresh();}catch(err){say('#login-status',err.message);}});
$('#logout').addEventListener('click',async()=>{try{await api('/api/auth/logout',{method:'POST',body:'{}'});await refresh();}catch(e){say('#catalog-status',e.message);}});
$('#release-form').addEventListener('submit',async e=>{
  e.preventDefault();const form=e.currentTarget,f=new FormData(form);const audio=f.get('audio'),cover=f.get('cover');
  if(!audio||!audio.size){say('#release-status','Sélectionne un fichier audio.');return;}
  say('#release-status','Téléversement du morceau…');
  try{
    const audioBlob=await upload(Date.now()+'-'+audio.name.replace(/[^a-zA-Z0-9._-]/g,'-'),audio,{access:'public',handleUploadUrl:'/api/upload',clientPayload:JSON.stringify({kind:'audio'})});
    let coverUrl=null;
    if(cover&&cover.size){say('#release-status','Téléversement de la pochette…');const coverBlob=await upload(Date.now()+'-'+cover.name.replace(/[^a-zA-Z0-9._-]/g,'-'),cover,{access:'public',handleUploadUrl:'/api/upload',clientPayload:JSON.stringify({kind:'cover'})});coverUrl=coverBlob.url;}
    say('#release-status','Enregistrement dans Neon…');
    await api('/api/releases',{method:'POST',body:JSON.stringify({title:String(f.get('title')).trim(),release_type:f.get('release_type'),genre:f.get('genre'),release_date:f.get('release_date')||null,description:f.get('description'),audio_url:audioBlob.url,cover_url:coverUrl,track_number:Number(f.get('track_number')||1),published:f.get('published')==='on'})});
    form.reset();say('#release-status','Sortie enregistrée avec succès.');await refresh();
  }catch(err){say('#release-status','Échec : '+err.message);}
});
refresh();

$('#content-form').addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.currentTarget);say('#content-status','Enregistrement…');try{await api('/api/content',{method:'PATCH',body:JSON.stringify({bio_fr:f.get('bio_fr'),bio_en:f.get('bio_en')})});say('#content-status','Biographie mise à jour.');}catch(err){say('#content-status',err.message);}});
$('#media-form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,f=new FormData(form),file=f.get('media');let mediaUrl=String(f.get('media_url')||'').trim();try{if(file&&file.size){say('#media-status','Téléversement du média…');const blob=await upload(Date.now()+'-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'-'),file,{access:'public',handleUploadUrl:'/api/upload',clientPayload:JSON.stringify({kind:'media'})});mediaUrl=blob.url;}const kind=f.get('kind');if(kind!=='news'&&!mediaUrl)throw new Error('Ajoute un fichier ou une URL HTTPS.');say('#media-status','Enregistrement…');await api('/api/media',{method:'POST',body:JSON.stringify({title:f.get('title'),kind,description:f.get('description'),media_url:mediaUrl,published:f.get('published')==='on'})});form.reset();say('#media-status','Contenu ajouté.');await refresh();}catch(err){say('#media-status',err.message);}});
