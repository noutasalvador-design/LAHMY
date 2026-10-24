let playlistTracks=[],currentPlaylistIndex=-1;const audio=document.querySelector('#audio'),progress=document.querySelector('#progress'),now=document.querySelector('#now'),length=document.querySelector('#length');const buttons=[document.querySelector('#play'),document.querySelector('#play2')];const time=s=>Number.isFinite(s)?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'0:00';function update(){buttons.forEach(b=>b.textContent=audio&&!audio.paused?'Ⅱ':'▶')}buttons.forEach(b=>b.addEventListener('click',async()=>{if(audio.paused){try{await audio.play()}catch(e){console.warn('Audio unavailable',e)}}else audio.pause();update()}));audio.addEventListener('timeupdate',()=>{now.textContent=time(audio.currentTime);if(audio.duration)progress.value=audio.currentTime/audio.duration*100});audio.addEventListener('loadedmetadata',()=>length.textContent=time(audio.duration));audio.addEventListener('play',update);audio.addEventListener('pause',update);audio.addEventListener('ended',update);progress.addEventListener('input',()=>{if(audio.duration)audio.currentTime=progress.value/100*audio.duration});document.querySelector('#vol').addEventListener('input',e=>audio.volume=+e.target.value);document.querySelector('#restart').addEventListener('click',()=>{if(currentPlaylistIndex>=0&&playlistTracks.length){currentPlaylistIndex=(currentPlaylistIndex-1+playlistTracks.length)%playlistTracks.length;audio.src=playlistTracks[currentPlaylistIndex].audio_url;audio.load();audio.play().catch(()=>{});}else audio.currentTime=0;});document.querySelector('#end').addEventListener('click',()=>{if(currentPlaylistIndex>=0&&playlistTracks.length){currentPlaylistIndex=(currentPlaylistIndex+1)%playlistTracks.length;audio.src=playlistTracks[currentPlaylistIndex].audio_url;audio.load();audio.play().catch(()=>{});}else{audio.currentTime=0;audio.play().catch(()=>{});}});
// The repository currently contains one confirmed audio track: restart/next/previous remain useful without inventing releases.

const contactForm=document.querySelector('#contact-form');if(contactForm){contactForm.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(contactForm);const name=String(fd.get('name')||'').trim();const email=String(fd.get('email')||'').trim();const message=String(fd.get('message')||'').trim();if(!name||!email||!message)return;const subject=encodeURIComponent('Demande depuis le site officiel LAHMY');const body=encodeURIComponent('Nom : '+name+'\nE-mail : '+email+'\n\nMessage :\n'+message);window.location.href='mailto:lahmymusic@gmail.com?subject='+subject+'&body='+body;});}let lang='fr';document.querySelector('#language').addEventListener('click',()=>{lang=lang==='fr'?'en':'fr';document.documentElement.lang=lang;document.querySelector('#language').textContent=lang==='fr'?'EN':'FR';document.querySelectorAll('[data-fr][data-en]').forEach(el=>{const value=el.dataset[lang];if(value.includes('<'))el.innerHTML=value;else el.textContent=value})});const nav=document.querySelector('#nav');document.querySelector('#menu').addEventListener('click',()=>nav.classList.toggle('open'));nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

/* Public catalogue: Neon API + Vercel Blob audio files. */
(async function loadCatalogue(){
 const list=document.querySelector('#release-list');
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let tracks=[],activeId=null,playCounted=false;
 const audioEl=document.querySelector('#audio');
 async function event(id,type){try{await fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({release_id:id,event_type:type})});}catch(e){console.warn('Statistique non enregistrée',e);}}
 try{
  const response=await fetch('/api/releases',{headers:{'Accept':'application/json'}});
  if(!response.ok)return;
  const data=await response.json();tracks=data.releases||[];playlistTracks=tracks;
  if(!tracks.length)return;
  list.innerHTML='<h3 class="release-title">SORTIES OFFICIELLES</h3>'+tracks.map((t,i)=>'<article class="release-item">'+(t.cover_url?'<img class="release-cover" src="'+esc(t.cover_url)+'" alt="Pochette de '+esc(t.title)+'" loading="lazy">':'<div class="release-cover release-placeholder">L.</div>')+'<div class="release-details"><strong>'+esc(t.title)+'</strong><small>'+esc(t.release_type)+' · '+esc(t.genre||'LAHMY')+(t.release_date?' · '+esc(t.release_date):'')+'</small>'+(t.description?'<p>'+esc(t.description)+'</p>':'')+'</div><div class="release-actions"><button type="button" data-play-track="'+i+'">▶ ÉCOUTER</button><a data-download-track="'+i+'" href="'+esc(t.audio_url)+'" download>TÉLÉCHARGER ↗</a></div></article>').join('');
  list.querySelectorAll('[data-play-track]').forEach(button=>button.addEventListener('click',async()=>{
   const track=tracks[Number(button.dataset.playTrack)];if(!track)return;
   activeId=track.id;currentPlaylistIndex=tracks.findIndex(t=>t.id===track.id);playCounted=false;audioEl.src=track.audio_url;audioEl.load();
   try{await audioEl.play();}catch(e){console.warn('Lecture audio indisponible',e);}
  }));
  list.querySelectorAll('[data-download-track]').forEach(link=>link.addEventListener('click',()=>{const t=tracks[Number(link.dataset.downloadTrack)];if(t)event(t.id,'download');}));
  audioEl.addEventListener('play',()=>{if(activeId&&!playCounted){playCounted=true;const current=tracks.find(t=>t.id===activeId);if(current)event(current.id,'play');}});
  audioEl.addEventListener('ended',async()=>{
   if(!activeId||!tracks.length)return;
   const index=tracks.findIndex(t=>t.id===activeId),nextIndex=(index+1)%tracks.length,next=tracks[nextIndex];
   if(next){currentPlaylistIndex=nextIndex;activeId=next.id;playCounted=false;audioEl.src=next.audio_url;audioEl.load();try{await audioEl.play();}catch(e){console.warn('Lecture suivante indisponible',e);}}
  });
 }catch(e){console.warn('Catalogue momentanément indisponible',e);}
})();

/* Editable biography and published media/news from Neon. */
(async function loadArtistContent(){
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 try{
  const response=await fetch('/api/content');
  if(response.ok){
   const data=(await response.json()).content||{};
   const heroPhoto=document.querySelector('.hero-photo .photo-frame img');
   const artistPhoto=document.querySelector('.artist-photo img');
    const musicCover=document.querySelector('.music-grid .cover img');
   if(heroPhoto&&typeof data.hero_photo_url==='string'&&/^https:\/\//i.test(data.hero_photo_url))heroPhoto.src=data.hero_photo_url;
   if(artistPhoto&&typeof data.artist_photo_url==='string'&&/^https:\/\//i.test(data.artist_photo_url))artistPhoto.src=data.artist_photo_url;
    if(musicCover&&typeof data.music_cover_url==='string'&&/^https:\/\//i.test(data.music_cover_url))musicCover.src=data.music_cover_url;
   const bio=document.querySelector('.bio-copy');
   if(bio){if(data.bio_fr){bio.dataset.fr=data.bio_fr;}if(data.bio_en){bio.dataset.en=data.bio_en;}bio.textContent=(typeof lang!=='undefined'&&lang==='en'&&data.bio_en)?data.bio_en:(data.bio_fr||bio.dataset.fr||bio.textContent);}
   if(typeof data.reels_json==='string'&&data.reels_json.trim()){try{const reels=JSON.parse(data.reels_json);if(Array.isArray(reels)&&reels.length){const grid=document.querySelector('.video-grid');if(grid){grid.innerHTML=reels.map((reel,i)=>{const url=String(reel.url||'');let embed='',watch=url;try{const u=new URL(url),host=u.hostname.toLowerCase().replace(/^www\\./,'');if(host==='youtube.com'||host==='m.youtube.com'||host==='youtu.be'){let id='';if(host==='youtu.be')id=u.pathname.split('/').filter(Boolean)[0]||'';else if(u.pathname.includes('/shorts/'))id=u.pathname.split('/shorts/')[1].split('/')[0];else if(u.pathname==='/watch')id=u.searchParams.get('v')||'';else if(u.pathname.includes('/embed/'))id=u.pathname.split('/embed/')[1].split('/')[0];if(id)embed='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id);}else if(host==='instagram.com'&&/\\/(reel|p|tv)\\//.test(u.pathname)){const parts=u.pathname.split('/').filter(Boolean),idx=parts.findIndex(x=>['reel','p','tv'].includes(x));if(parts[idx+1])embed='https://www.instagram.com/'+parts[idx]+'/'+encodeURIComponent(parts[idx+1])+'/embed';}else if(host==='tiktok.com'){const m=u.pathname.match(/\\/video\\/(\\d+)/);if(m)embed='https://www.tiktok.com/embed/v2/'+m[1];}}catch(e){}if(!embed)return '';const title=esc(reel.title||('LAHMY · REEL '+String(i+1).padStart(2,'0')));return '<article class=\"video-feature\"><div class=\"video-feature-copy\"><span class=\"video-kicker\">LAHMY · REEL / SHORT '+String(i+1).padStart(2,'0')+'</span><h3>'+title+'</h3><p>Retrouvez cette vidéo officielle de LAHMY.</p><a class=\"video-open\" href=\"'+esc(watch)+'\" target=\"_blank\" rel=\"noopener noreferrer\">OUVRIR LA VIDÉO ↗</a></div><div class=\"video-player-wrap\"><iframe src=\"'+embed+'\" title=\"'+title+'\" loading=\"lazy\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe></div></article>';}).filter(Boolean).join('');}}catch(e){console.warn('Liste Reels invalide',e);}}
  }
 }catch(e){console.warn('Biographie non chargée',e);}
 try{
  const response=await fetch('/api/media');if(!response.ok)return;
  const posts=(await response.json()).posts||[],root=document.querySelector('#media-list');if(!root||!posts.length)return;
  root.innerHTML=posts.map(p=>{
   let visual='';
   if(p.kind==='photo'&&p.media_url)visual='<img loading="lazy" src="'+esc(p.media_url)+'" alt="'+esc(p.title)+'">';
   else if(p.kind==='video'&&p.media_url)visual='<video controls preload="metadata" src="'+esc(p.media_url)+'"></video>';
   const label=p.kind==='news'?'ACTUALITÉ':p.kind==='event'?'ÉVÉNEMENT':p.kind==='video'?'VIDÉO':'PHOTO';
   return '<article class="media-card">'+visual+'<div class="media-card-copy"><small>'+label+'</small><h3>'+esc(p.title)+'</h3>'+(p.description?'<p>'+esc(p.description)+'</p>':'')+'</div></article>';
  }).join('');
 }catch(e){console.warn('Médias non chargés',e);}
})();

/* Thème mémorisé localement sur l'appareil, sans toucher aux contenus du site. */
(function(){
 const root=document.documentElement,button=document.querySelector('#theme-toggle');
 if(!button)return;
 let saved='dark';try{saved=localStorage.getItem('lahmy-theme')||'dark'}catch(e){}
 function apply(theme){const light=theme==='light';root.dataset.theme=light?'light':'dark';button.textContent=light?'☾':'☼';button.setAttribute('aria-label',light?'Activer le mode sombre':'Activer le mode clair');button.title=light?'Mode sombre':'Mode clair';}
 apply(saved);
 button.addEventListener('click',()=>{const next=root.dataset.theme==='light'?'dark':'light';apply(next);try{localStorage.setItem('lahmy-theme',next)}catch(e){}});
})();
