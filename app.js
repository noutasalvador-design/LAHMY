const audio=document.querySelector('#audio'),progress=document.querySelector('#progress'),now=document.querySelector('#now'),length=document.querySelector('#length');const buttons=[document.querySelector('#play'),document.querySelector('#play2')];const time=s=>Number.isFinite(s)?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'0:00';function update(){buttons.forEach(b=>b.textContent=audio&&!audio.paused?'Ⅱ':'▶')}buttons.forEach(b=>b.addEventListener('click',async()=>{if(audio.paused){try{await audio.play()}catch(e){console.warn('Audio unavailable',e)}}else audio.pause();update()}));audio.addEventListener('timeupdate',()=>{now.textContent=time(audio.currentTime);if(audio.duration)progress.value=audio.currentTime/audio.duration*100});audio.addEventListener('loadedmetadata',()=>length.textContent=time(audio.duration));audio.addEventListener('play',update);audio.addEventListener('pause',update);audio.addEventListener('ended',update);progress.addEventListener('input',()=>{if(audio.duration)audio.currentTime=progress.value/100*audio.duration});document.querySelector('#vol').addEventListener('input',e=>audio.volume=+e.target.value);document.querySelector('#restart').addEventListener('click',()=>audio.currentTime=0);document.querySelector('#end').addEventListener('click',()=>{audio.currentTime=0;audio.play().catch(()=>{});});
// The repository currently contains one confirmed audio track: restart/next/previous remain useful without inventing releases.
audio.addEventListener('ended',()=>{audio.currentTime=0;});
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
  const data=await response.json();tracks=data.releases||[];
  if(!tracks.length)return;
  list.innerHTML='<h3 class="release-title">SORTIES OFFICIELLES</h3>'+tracks.map((t,i)=>'<article class="release-item">'+(t.cover_url?'<img class="release-cover" src="'+esc(t.cover_url)+'" alt="Pochette de '+esc(t.title)+'" loading="lazy">':'<div class="release-cover release-placeholder">L.</div>')+'<div class="release-details"><strong>'+esc(t.title)+'</strong><small>'+esc(t.release_type)+' · '+esc(t.genre||'LAHMY')+(t.release_date?' · '+esc(t.release_date):'')+'</small>'+(t.description?'<p>'+esc(t.description)+'</p>':'')+'</div><div class="release-actions"><button type="button" data-play-track="'+i+'">▶ ÉCOUTER</button><a data-download-track="'+i+'" href="'+esc(t.audio_url)+'" download>TÉLÉCHARGER ↗</a></div></article>').join('');
  list.querySelectorAll('[data-play-track]').forEach(button=>button.addEventListener('click',async()=>{
   const track=tracks[Number(button.dataset.playTrack)];if(!track)return;
   activeId=track.id;playCounted=false;audioEl.src=track.audio_url;audioEl.load();
   try{await audioEl.play();}catch(e){console.warn('Lecture audio indisponible',e);}
  }));
  list.querySelectorAll('[data-download-track]').forEach(link=>link.addEventListener('click',()=>{const t=tracks[Number(link.dataset.downloadTrack)];if(t)event(t.id,'download');}));
  audioEl.addEventListener('play',()=>{if(activeId&&!playCounted){playCounted=true;const current=tracks.find(t=>t.id===activeId);if(current)event(current.id,'play');}});
  audioEl.addEventListener('ended',async()=>{
   if(!activeId||!tracks.length)return;
   const index=tracks.findIndex(t=>t.id===activeId),next=tracks[(index+1)%tracks.length];
   if(next){activeId=next.id;playCounted=false;audioEl.src=next.audio_url;audioEl.load();try{await audioEl.play();}catch(e){console.warn('Lecture suivante indisponible',e);}}
  });
 }catch(e){console.warn('Catalogue momentanément indisponible',e);}
})();
