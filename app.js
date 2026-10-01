/* Gallery app — renders ANIMATIONS, live 5x5 previews, copy MakeCode JS */
(function(){
  const grid = document.getElementById('gallery');
  const catsEl = document.getElementById('cats');
  const searchEl = document.getElementById('search');
  const speedEl = document.getElementById('speed');
  const speedVal = document.getElementById('speedVal');
  const pauseEl = document.getElementById('pause');
  const seg = document.getElementById('modeSeg');
  const statLine = document.getElementById('statLine');
  const countEl = document.getElementById('count');
  const toast = document.getElementById('toast');

  let activeCat = 'All';
  let mode = 'infinite';
  let speedFactor = 1;
  const timers = [];

  const baseCats = [...new Set(ANIMATIONS.map(a=>a.cat))];
  const hasCustom = ANIMATIONS.some(a=>a.custom);
  const CATS = ['All', ...(hasCustom?['My Creations']:[]), ...baseCats];

  function showToast(msg){
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(()=> toast.hidden = true, 2200);
  }

  async function copyText(t){
    try { await navigator.clipboard.writeText(t); return true; }
    catch(e){
      const ta = document.createElement('textarea');
      ta.value = t; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); return true; } catch(_){ return false; }
      finally { ta.remove(); }
    }
  }

  function pauseMs(anim){
    const v = parseInt(pauseEl.value, 10);
    if(!isNaN(v) && v>=50 && v<=2000) return v;
    return anim.speed || 300;
  }

  function renderCats(){
    const counts = {};
    ANIMATIONS.forEach(a=> counts[a.cat]=(counts[a.cat]||0)+1);
    const myCount = ANIMATIONS.filter(a=>a.custom).length;
    catsEl.innerHTML = '';
    CATS.forEach(c=>{
      const b = document.createElement('button');
      const n = c==='All' ? ANIMATIONS.length : c==='My Creations' ? myCount : (counts[c]||0);
      if(c==='My Creations' && myCount===0) return;
      b.innerHTML = `${c==='My Creations'?'★ My Creations':c}<span class="n">${n}</span>`;
      if(c===activeCat) b.classList.add('active');
      b.onclick = ()=>{ activeCat=c; renderCats(); renderGrid(); };
      catsEl.appendChild(b);
    });
    statLine.textContent = `${ANIMATIONS.length} animations • ${CATS.length-1} categories • click any card for code`;
    countEl.textContent = `${ANIMATIONS.length} animations total`;
  }

  function ledGrid(frame){
    const board = document.createElement('div');
    board.className = 'sim-board sim-card';
    const usb = document.createElement('div');
    usb.className = 'sim-usb';
    const row = document.createElement('div');
    row.className = 'sim-row';
    const bA = document.createElement('button');
    bA.className = 'sim-btn small'; bA.textContent = 'A'; bA.title = 'Button A (restart)';
    const screen = document.createElement('div');
    screen.className = 'sim-screen';
    const d = document.createElement('div');
    d.className = 'led';
    for(let r=0;r<5;r++) for(let c=0;c<5;c++){
      const i = document.createElement('i');
      if(frame[r][c]==='#') i.classList.add('on');
      d.appendChild(i);
    }
    screen.appendChild(d);
    const bB = document.createElement('button');
    bB.className = 'sim-btn small'; bB.textContent = 'B'; bB.title = 'Button B (next frame)';
    row.appendChild(bA); row.appendChild(screen); row.appendChild(bB);
    const logo = document.createElement('div');
    logo.className = 'sim-logo'; logo.textContent = 'micro:bit';
    const pins = document.createElement('div');
    pins.className = 'sim-pins';
    pins.innerHTML = '<span>0</span><span>1</span><span>2</span><span>3V</span><span>GND</span>';
    board.appendChild(usb); board.appendChild(row); board.appendChild(logo); board.appendChild(pins);
    // MakeCode-like: A restarts, B steps one frame
    bA.onclick = (e)=>{ e.stopPropagation(); const el = board.querySelector('.led'); if(el && el._restart) el._restart(); };
    bB.onclick = (e)=>{ e.stopPropagation(); const el = board.querySelector('.led'); if(el && el._step) el._step(); };
    board._led = d;
    return board;
  }

  function startPreview(boardEl, anim){
    const ledEl = boardEl.classList && boardEl.classList.contains('led') ? boardEl : boardEl.querySelector('.led');
    let idx = 0;
    const dots = [...ledEl.querySelectorAll('i')];
    function draw(){
      const f = anim.frames[idx % anim.frames.length];
      let k=0;
      for(let r=0;r<5;r++) for(let c=0;c<5;c++){
        dots[k++].classList.toggle('on', f[r][c]==='#');
      }
      idx++;
    }
    draw();
    const tick = ()=> draw();
    // base interval scaled by global speed factor
    const id = setInterval(tick, Math.max(60,(anim.speed||300))/speedFactor);
    timers.push(id);
    // store re-compute on speed change
    ledEl._anim = anim; ledEl._redraw = draw;
    ledEl._restart = ()=>{ idx = 0; draw(); };
    ledEl._step = ()=>{ draw(); };
    return id;
  }

  function refreshAllSpeeds(){
    timers.forEach(clearInterval); timers.length=0;
    document.querySelectorAll('.led').forEach(el=>{
      if(el._anim) startPreview(el, el._anim);
    });
  }

  function filtered(){
    const q = searchEl.value.trim().toLowerCase();
    return ANIMATIONS.filter(a=>{
      if(activeCat==='My Creations'){ if(!a.custom) return false; }
      else if(activeCat!=='All' && a.cat!==activeCat) return false;
      if(!q) return true;
      return (a.name+' '+a.desc+' '+a.id+' '+a.cat).toLowerCase().includes(q);
    });
  }

  function renderGrid(){
    timers.forEach(clearInterval); timers.length=0;
    grid.innerHTML='';
    const list = filtered();
    if(!list.length){
      const d=document.createElement('div'); d.className='empty';
      d.textContent='No animations found — try another search.';
      grid.appendChild(d); return;
    }
    list.forEach(anim=>{
      const card=document.createElement('div'); card.className='card';
      card.innerHTML=`<div class="card-top"><span class="cat">${anim.custom?'★ Yours • '+anim.cat:anim.cat}</span><span class="frames">${anim.frames.length} frames • ${anim.speed}ms</span></div>`;
      const led=ledGrid(anim.frames[0]);
      card.appendChild(led);
      const h=document.createElement('h3'); h.textContent=anim.name; card.appendChild(h);
      const p=document.createElement('p'); p.textContent=anim.desc; card.appendChild(p);
      const row=document.createElement('div'); row.className='card-actions';
      const b1=document.createElement('button'); b1.className='btn btn-copy'; b1.textContent='⧉ Copy function';
      b1.onclick=(e)=>{ e.stopPropagation(); doCopy(anim); };
      const b2=document.createElement('button'); b2.className='btn btn-view'; b2.textContent='View code';
      b2.onclick=(e)=>{ e.stopPropagation(); openModal(anim); };
      row.appendChild(b1); row.appendChild(b2); card.appendChild(row);
      card.onclick=()=>openModal(anim);
      grid.appendChild(card);
      startPreview(led, anim);
    });
  }

  function doCopy(anim){
    const code = generateMicrobitFunction(anim,{mode, pause:pauseMs(anim)});
    copyText(code).then(ok=> showToast(ok?`Copied ${funcNameFromId(anim.id)}()! Paste into MakeCode ✓`:'Copy failed — select code manually'));
  }

  /* ---- modal ---- */
  const modal=document.getElementById('modal');
  const bigLed=document.getElementById('bigLed');
  const mCat=document.getElementById('mCat'), mName=document.getElementById('mName'),
        mDesc=document.getElementById('mDesc'), mCode=document.getElementById('mCode'),
        mCopy=document.getElementById('mCopy'), frameLabel=document.getElementById('frameLabel'),
        frameStrip=document.getElementById('frameStrip'), playPause=document.getElementById('playPause');
  let cur=null, curIdx=0, playing=true, bigTimer=null;

  // build big led dots once
  bigLed.innerHTML='';
  for(let i=0;i<25;i++){ bigLed.appendChild(document.createElement('i')); }

  function drawBig(){
    if(!cur) return;
    const f=cur.frames[curIdx % cur.frames.length];
    const dots=[...bigLed.querySelectorAll('i')];
    let k=0;
    for(let r=0;r<5;r++) for(let c=0;c<5;c++) dots[k++].classList.toggle('on', f[r][c]==='#');
    frameLabel.textContent=`${(curIdx%cur.frames.length)+1} / ${cur.frames.length}`;
    [...frameStrip.children].forEach((b,i)=> b.classList.toggle('active', i===(curIdx%cur.frames.length)));
  }
  function restartBigTimer(){
    clearInterval(bigTimer);
    if(!playing) return;
    bigTimer=setInterval(()=>{ curIdx++; drawBig(); }, Math.max(60,(cur.speed||300))/speedFactor);
  }
  function refreshCode(){
    if(!cur) return;
    mCode.textContent = generateMicrobitFunction(cur,{mode, pause:pauseMs(cur)});
  }
  function openModal(anim){
    cur=anim; curIdx=0; playing=true; playPause.textContent='⏸ Pause';
    mCat.textContent=anim.cat; mName.textContent=anim.name;
    mDesc.textContent=`${anim.desc} • ${anim.frames.length} frames`;
    frameStrip.innerHTML='';
    anim.frames.forEach((_,i)=>{
      const b=document.createElement('button'); b.textContent=i+1;
      b.onclick=()=>{ curIdx=i; drawBig(); };
      frameStrip.appendChild(b);
    });
    refreshCode(); drawBig(); restartBigTimer();
    modal.hidden=false; document.body.style.overflow='hidden';
  }
  function closeModal(){ modal.hidden=true; document.body.style.overflow=''; clearInterval(bigTimer); cur=null; }

  document.getElementById('modalClose').onclick=closeModal;
  modal.addEventListener('click',e=>{ if(e.target===modal) closeModal(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape' && !modal.hidden) closeModal(); });
  playPause.onclick=()=>{ playing=!playing; playPause.textContent=playing?'⏸ Pause':'▶ Play'; restartBigTimer(); };
  document.getElementById('prevFrame').onclick=()=>{ curIdx=(curIdx-1+cur.frames.length)%cur.frames.length; drawBig(); };
  document.getElementById('nextFrame').onclick=()=>{ curIdx=(curIdx+1)%cur.frames.length; drawBig(); };
  mCopy.onclick=()=>{ if(cur) doCopy(cur); };
  // MakeCode simulator-style buttons
  const simA=document.getElementById('simA'), simB=document.getElementById('simB'),
        simStop=document.getElementById('simStop'), simRestart=document.getElementById('simRestart');
  if(simA) simA.onclick=()=>{ curIdx=0; drawBig(); if(!playing){ playing=true; playPause.textContent='⏸ Pause'; restartBigTimer(); } };
  if(simB) simB.onclick=()=>{ if(cur){ curIdx=(curIdx+1)%cur.frames.length; drawBig(); } };
  if(simStop) simStop.onclick=()=>{ playing=false; playPause.textContent='▶ Play'; clearInterval(bigTimer); };
  if(simRestart) simRestart.onclick=()=>{ curIdx=0; drawBig(); playing=true; playPause.textContent='⏸ Pause'; restartBigTimer(); };

  /* ---- controls ---- */
  searchEl.addEventListener('input', renderGrid);
  speedEl.addEventListener('input', ()=>{
    speedFactor=parseFloat(speedEl.value); speedVal.textContent=speedFactor+'×';
    refreshAllSpeeds(); if(cur) restartBigTimer();
  });
  pauseEl.addEventListener('input', ()=>{ if(cur) refreshCode(); });
  seg.querySelectorAll('button').forEach(b=> b.onclick=()=>{
    seg.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); mode=b.dataset.mode; if(cur) refreshCode();
  });

  renderCats(); renderGrid();
  // expose for debugging
  window._anims = ANIMATIONS;
})();
