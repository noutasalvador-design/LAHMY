(() => {
  const cfg = window.LAHMY_CONFIG || {};
  const configured = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_URL.includes("VOTRE-PROJET") && !cfg.SUPABASE_ANON_KEY.includes("VOTRE_CLE");
  const $ = s => document.querySelector(s);
  const status = (id, msg) => { const el=$(id); if(el) el.textContent=msg; };
  if (!configured || !window.supabase) {
    status('#setup-status','Supabase n’est pas encore configuré. Suivez le guide dans README.md ; aucune connexion admin ne sera simulée.');
    $('#login-form').addEventListener('submit',e=>{e.preventDefault();status('#login-status','Configuration manquante : connexion indisponible tant que Supabase n’est pas configuré.');});
    return;
  }
  const client=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
  const loginPanel=$('#login-panel'), dashboard=$('#dashboard'), warning=$('#setup-warning');
  const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function isAdmin(){const {data:{user}}=await client.auth.getUser();if(!user)return false;const {data,error}=await client.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();return !error&&!!data;}
  async function refresh(){
    const allowed=await isAdmin();loginPanel.classList.toggle('hidden',allowed);dashboard.classList.toggle('hidden',!allowed);warning.classList.toggle('hidden',true);
    if(!allowed)return;
    const {data:items,error}=await client.from('releases').select('*').order('created_at',{ascending:false});
    if(error){status('#catalog-status','Erreur catalogue : '+error.message);return;}
    $('#release-admin').innerHTML=items.length?items.map(r=>'<div class="release-row"><div><strong>'+escapeHtml(r.title)+'</strong><small>'+escapeHtml(r.release_type)+' · '+(r.published?'Publié':'Brouillon')+'</small></div><div class="actions"><button data-toggle="'+r.id+'" class="secondary">'+(r.published?'DÉPUBLIER':'PUBLIER')+'</button><button data-delete="'+r.id+'" class="secondary">SUPPRIMER</button></div></div>').join():'Aucune sortie enregistrée.';
    $('#release-admin').querySelectorAll('[data-toggle]').forEach(b=>b.addEventListener('click',async()=>{const r=items.find(x=>x.id===b.dataset.toggle);const {error}=await client.from('releases').update({published:!r.published}).eq('id',r.id);status('#catalog-status',error?error.message:'Statut mis à jour.');refresh();}));
    $('#release-admin').querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',async()=>{if(!confirm('Supprimer cette sortie du catalogue ?'))return;const r=items.find(x=>x.id===b.dataset.delete);await client.storage.from('lahmy-audio').remove([r.audio_path]);if(r.cover_path)await client.storage.from('lahmy-covers').remove([r.cover_path]);const {error}=await client.from('releases').delete().eq('id',r.id);status('#catalog-status',error?error.message:'Sortie supprimée.');refresh();}));
    const {data:events,error:statsError}=await client.from('track_events').select('release_id,event_type');
    if(statsError){$('#stats').textContent='Statistiques indisponibles : '+statsError.message;return;}
    const plays=events.filter(e=>e.event_type==='play').length,downloads=events.filter(e=>e.event_type==='download').length;
    $('#stats').textContent='Écoutes enregistrées : '+plays+' · Téléchargements enregistrés : '+downloads+' · Sorties : '+items.length;
  }
  $('#login-form').addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.currentTarget);status('#login-status','Connexion…');const {error}=await client.auth.signInWithPassword({email:f.get('email'),password:f.get('password')});if(error){status('#login-status','Connexion refusée : '+error.message);return;}status('#login-status','Connexion réussie.');await refresh();});
  $('#logout').addEventListener('click',async()=>{await client.auth.signOut();await refresh();});
  $('#release-form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,f=new FormData(form);const audio=f.get('audio'),cover=f.get('cover');if(!audio||!audio.size){status('#release-status','Sélectionnez un fichier audio.');return;}if(audio.size>50*1024*1024){status('#release-status','Le fichier audio dépasse la limite de 50 Mo de cette interface.');return;}status('#release-status','Téléversement en cours…');const clean=s=>String(s).normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-|-$/g,'').slice(0,100)||'fichier';const base=Date.now()+'-'+clean(audio.name);const {error:upErr}=await client.storage.from('lahmy-audio').upload(base,audio,{upsert:false,contentType:audio.type||'audio/mpeg'});if(upErr){status('#release-status','Échec du téléversement audio : '+upErr.message);return;}let coverPath=null;if(cover&&cover.size){if(cover.size>10*1024*1024){await client.storage.from('lahmy-audio').remove([base]);status('#release-status','La pochette dépasse la limite de 10 Mo.');return;}coverPath=Date.now()+'-'+clean(cover.name);const {error}=await client.storage.from('lahmy-covers').upload(coverPath,cover,{upsert:false,contentType:cover.type});if(error){await client.storage.from('lahmy-audio').remove([base]);status('#release-status','Échec de la pochette : '+error.message);return;}}
    const record={title:String(f.get('title')).trim(),release_type:f.get('release_type'),genre:String(f.get('genre')||''),release_date:f.get('release_date')||null,description:String(f.get('description')||''),audio_path:base,cover_path:coverPath,track_number:Number(f.get('track_number')||1),published:f.get('published')==='on'};
    const {error}=await client.from('releases').insert(record);if(error){await client.storage.from('lahmy-audio').remove([base]);if(coverPath)await client.storage.from('lahmy-covers').remove([coverPath]);status('#release-status','Enregistrement impossible : '+error.message);return;}form.reset();status('#release-status','Sortie enregistrée.');await refresh();
  });
  client.auth.onAuthStateChange(()=>setTimeout(refresh,0));refresh();
})();