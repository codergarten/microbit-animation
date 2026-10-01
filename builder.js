/* Builder: draw 5x5, import MakeCode function, save custom, submit to GitHub.
   Loads BEFORE app.js so custom animations merge into ANIMATIONS. */
(function(){
"use strict";

// >>> SET THIS to enable one-click GitHub issues, e.g. "yourname/microbit-animations"
const GITHUB_REPO = "codergarten/microbit-animation"; // e.g. "rushabh/microbit-motion-library"

const LS_KEY = "microbit_custom_anims_v1";
const $ = (id)=>document.getElementById(id);

/* ---------- custom store: merge before gallery renders ---------- */
function loadCustom(){
  try { const raw = localStorage.getItem(LS_KEY); if(!raw) return [];
    const arr = JSON.parse(raw); return Array.isArray(arr) ? arr.filter(validStored) : [];
  } catch(e){ return []; }
}
function validStored(a){
  return a && typeof a.id==="string" && Array.isArray(a.frames) && a.frames.length>=1 && a.frames.length<=8 &&
    a.frames.every(f=>Array.isArray(f)&&f.length===5&&f.every(r=>typeof r==="string"&&/^[.#]{5}$/.test(r)));
}
function persistCustom(list){ localStorage.setItem(LS_KEY, JSON.stringify(list)); }

const customs = loadCustom();
if(typeof ANIMATIONS !== "undefined" && Array.isArray(ANIMATIONS)){
  customs.forEach(c=>{ if(!ANIMATIONS.some(a=>a.id===c.id)) ANIMATIONS.push(c); });
}

/* ---------- MakeCode parser: function -> frames ---------- */
function parseMakeCodeFunction(text){
  if(!text || !text.trim()) throw new Error("Paste a MakeCode function first.");
  const nameMatch = text.match(/function\s+([A-Za-z0-9_]+)/);
  const name = nameMatch ? nameMatch[1] : "";
  const pauseMatch = text.match(/basic\.pause\s*\(\s*(\d+)/);
  const speed = pauseMatch ? Math.min(2000, Math.max(50, parseInt(pauseMatch[1],10))) : 300;
  const frames = [];
  const re = /basic\.showLeds\s*\(\s*`([\s\S]*?)`\s*\)/g;
  let m;
  while((m = re.exec(text)) !== null){
    const rows = [];
    m[1].split("\n").forEach(line=>{
      const cells = [];
      for(const ch of line){
        if(ch==="#"||ch==="1"||ch==="*") cells.push("#");
        else if(ch==="."||ch==="0"||ch==="_"||ch==="-") cells.push(".");
      }
      if(cells.length===5) rows.push(cells.join(""));
      else if(cells.length>5) rows.push(cells.slice(0,5).join(""));
    });
    // keep exactly 5 rows (chunk if someone pasted multiple grids in one block)
    for(let i=0;i+5<=rows.length;i+=5) frames.push(rows.slice(i,i+5));
    if(rows.length>0 && rows.length<5 && rows.length>=1){
      // pad incomplete grid — reject instead to stay strict
    }
  }
  if(!frames.length) throw new Error("No basic.showLeds(`...`) 5x5 grids found. Copy the JavaScript function from MakeCode (not Blocks).");
  if(frames.length>24) throw new Error(`Found ${frames.length} frames — trim to 8 max for the library.`);
  return { name, speed, frames };
}

function slugify(name){
  const base = (name||"my-animation").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,32) || "my-animation";
  let id = base, n = 2;
  const taken = new Set((typeof ANIMATIONS!=="undefined"?ANIMATIONS:[]).map(a=>a.id));
  while(taken.has(id)) id = `${base}-${n++}`;
  return id;
}
function toTitle(name){
  const s = (name||"").replace(/[-_]+/g," ").trim();
  return s ? s.charAt(0).toUpperCase()+s.slice(1) : "My Animation";
}
function libraryEntry(a){
  const f = a.frames.map(fr=>`["${fr.join('","')}"]`).join(",\n");
  return `{id:"${a.id}",name:"${a.name}",cat:"${a.cat}",desc:"${a.desc}",speed:${a.speed},frames:[\n${f}\n]},`;
}

/* ---------- builder UI ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  const modal = $("builder"); if(!modal) return;
  const drawGrid = $("drawGrid"), strip = $("bStrip"), label = $("bFrameLabel"),
        err = $("bError"), codeEl = $("bCode");
  let frames = [[false,false,false,false,false],[false,true,false,true,false],[false,false,false,false,false],[true,true,true,true,true],[true,false,false,false,true]].map(r=>r.map(c=>c?"#":"."));
  // default: 2 frames (blink) so Play shows something
  frames = [
    [".....",".#.#.",".....","#####","#...#"],
    [".....",".....",".....","#####","#...#"],
  ];
  let idx = 0, playing = false, timer = null, paintVal = "#";

  // build 25 draw cells
  drawGrid.innerHTML = "";
  const cells = [];
  for(let r=0;r<5;r++) for(let c=0;c<5;c++){
    const b = document.createElement("button");
    b.dataset.r=r; b.dataset.c=c;
    b.onpointerdown = (e)=>{ e.preventDefault(); paintVal = frames[idx][r][c]==="#"?".":"#"; setCell(r,c,paintVal); b.setPointerCapture&&e.pointerId!==undefined&&(()=>{})(); };
    b.onpointerenter = (e)=>{ if(e.buttons) setCell(r,c,paintVal); };
    drawGrid.appendChild(b); cells.push(b);
  }
  function setCell(r,c,v){ frames[idx][r] = frames[idx][r].substring(0,c)+v+frames[idx][r].substring(c+1); renderDraw(); renderCode(); }
  function renderDraw(){
    let k=0;
    for(let r=0;r<5;r++) for(let c=0;c<5;c++) cells[k++].classList.toggle("on", frames[idx][r][c]==="#");
    label.textContent = `${idx+1} / ${frames.length}`;
    [...strip.children].forEach((b,i)=>b.classList.toggle("active", i===idx));
  }
  function renderStrip(){
    strip.innerHTML="";
    frames.forEach((_,i)=>{
      const b=document.createElement("button"); b.textContent=i+1;
      b.onclick=()=>{ stopPlay(); idx=i; renderDraw(); renderCode(); };
      strip.appendChild(b);
    });
    renderDraw();
  }
  function currentAnim(){
    return {
      id: slugify($("bName").value||"my-animation"),
      name: toTitle($("bName").value||"My Animation"),
      cat: $("bCat").value,
      desc: ($("bDesc").value||"Community submission").slice(0,80),
      speed: Math.min(2000,Math.max(50,parseInt($("bSpeed").value,10)||300)),
      frames: frames.map(f=>[...f]),
    };
  }
  function renderCode(){
    try{
      err.hidden = true;
      const a = currentAnim();
      codeEl.textContent = generateMicrobitFunction(a,{mode:"infinite",pause:a.speed});
    }catch(e){ err.textContent=e.message; err.hidden=false; }
  }
  function stopPlay(){ playing=false; $("bPlay").textContent="▶ Play"; clearInterval(timer); }
  function startPlay(){
    stopPlay(); playing=true; $("bPlay").textContent="⏸ Stop";
    const sp = Math.max(60, parseInt($("bSpeed").value,10)||300);
    timer=setInterval(()=>{ idx=(idx+1)%frames.length; renderDraw(); }, sp);
  }

  async function copyText(t){
    try{ await navigator.clipboard.writeText(t); return true; }
    catch(e){ const ta=document.createElement("textarea"); ta.value=t; document.body.appendChild(ta); ta.select(); try{return document.execCommand("copy");}catch(_){return false;}finally{ta.remove();} }
  }
  function toast(msg){
    const t=$("toast"); if(!t) return alert(msg);
    t.textContent=msg; t.hidden=false; clearTimeout(toast._t); toast._t=setTimeout(()=>t.hidden=true,2400);
  }

  // wire
  $("openBuilder").onclick = ()=>{ modal.hidden=false; document.body.style.overflow="hidden"; renderStrip(); renderCode(); };
  $("builderClose").onclick = ()=>{ modal.hidden=true; document.body.style.overflow=""; stopPlay(); };
  modal.addEventListener("click",e=>{ if(e.target===modal){ modal.hidden=true; document.body.style.overflow=""; stopPlay(); } });
  ["bName","bCat","bDesc","bSpeed"].forEach(id=>$(id).addEventListener("input",renderCode));
  $("bClear").onclick=()=>{ frames[idx]=[".....",".....",".....",".....","....."]; renderDraw(); renderCode(); };
  $("bFill").onclick=()=>{ frames[idx]=["#####","#####","#####","#####","#####"]; renderDraw(); renderCode(); };
  $("bInvert").onclick=()=>{ frames[idx]=frames[idx].map(r=>r.split("").map(c=>c==="#"?".":"#").join("")); renderDraw(); renderCode(); };
  $("bPrev").onclick=()=>{ stopPlay(); idx=(idx-1+frames.length)%frames.length; renderDraw(); renderCode(); };
  $("bNext").onclick=()=>{ stopPlay(); idx=(idx+1)%frames.length; renderDraw(); renderCode(); };
  $("bPlay").onclick=()=>{ playing?stopPlay():startPlay(); };
  if($("bSimA")) $("bSimA").onclick=()=>{ stopPlay(); idx=0; renderDraw(); renderCode(); startPlay(); };
  if($("bSimB")) $("bSimB").onclick=()=>{ stopPlay(); idx=(idx+1)%frames.length; renderDraw(); renderCode(); };
  $("bAdd").onclick=()=>{ if(frames.length>=8) return toast("Max 8 frames for submissions."); frames.splice(idx+1,0,[...frames[idx]]); idx++; renderStrip(); renderCode(); };
  $("bDup").onclick=()=>{ if(frames.length>=8) return toast("Max 8 frames."); frames.push([...frames[idx]]); idx=frames.length-1; renderStrip(); renderCode(); };
  $("bDel").onclick=()=>{ if(frames.length<=1) return toast("Keep at least 1 frame."); frames.splice(idx,1); idx=Math.max(0,idx-1); renderStrip(); renderCode(); };

  $("bParse").onclick=()=>{
    try{
      const r = parseMakeCodeFunction($("bImport").value);
      if(r.frames.length>8) throw new Error(`Parsed ${r.frames.length} frames — max 8. Delete some showLeds blocks first.`);
      frames = r.frames; idx = 0;
      if(r.name && !$("bName").value) $("bName").value = toTitle(r.name);
      if(r.speed) $("bSpeed").value = r.speed;
      renderStrip(); renderCode(); toast(`Parsed ${r.frames.length} frames ✓`);
    }catch(e){ err.textContent=e.message; err.hidden=false; }
  };
  $("bFromGallery").onclick=()=>{
    $("bImport").value =
`function Boom() {
    while (true) {
        basic.showLeds(\`
            . # . # .
            . # . # .
            . . # . .
            . # . # .
            . # . # .
            \`)
        basic.pause(300)
        basic.showLeds(\`
            # . . . #
            . # . # .
            . . # . .
            . # . # .
            # . . . #
            \`)
        basic.pause(300)
    }
}`;
    toast("Example loaded — hit Parse");
  };
  $("bCopyFn").onclick=async()=>{ await copyText(codeEl.textContent); toast("Function copied — paste into MakeCode ✓"); };
  $("bEntry").onclick=async()=>{ await copyText(libraryEntry(currentAnim())); toast("Library entry copied — paste into GitHub issue"); };
  $("bSave").onclick=()=>{
    try{
      const a = currentAnim();
      if(!a.name.trim()) throw new Error("Give it a name.");
      if(frames.length<1) throw new Error("Need at least 1 frame.");
      a.custom = true;
      const list = loadCustom();
      const i = list.findIndex(x=>x.id===a.id);
      if(i>=0) list[i]=a; else list.push(a);
      persistCustom(list);
      toast(`Saved "${a.name}" to My Creations ✓ reloading…`);
      setTimeout(()=>location.reload(), 700);
    }catch(e){ err.textContent=e.message; err.hidden=false; }
  };
  $("bDownload").onclick=()=>{
    const blob = new Blob([JSON.stringify(currentAnim(),null,2)],{type:"application/json"});
    const u = URL.createObjectURL(blob);
    const l = document.createElement("a"); l.href=u; l.download=(currentAnim().id||"microbit-anim")+".json"; l.click();
    setTimeout(()=>URL.revokeObjectURL(u),2000);
  };
  $("bGithub").onclick=async()=>{
    const a = currentAnim();
    const entry = libraryEntry(a);
    const title = encodeURIComponent(`New animation: ${a.name}`);
    const body = encodeURIComponent(
`## Community submission\n- Name: ${a.name}\n- Category: ${a.cat}\n- Speed: ${a.speed}ms\n- Frames: ${a.frames.length}\n- Description: ${a.desc}\n\nI confirm this is my own 5x5 art, family-friendly, \`#\`/\`.\` only.\n\n\`\`\`js\n${entry}\n\`\`\`\n`);
    await copyText(entry);
    if(!GITHUB_REPO){ toast("Entry copied! Set GITHUB_REPO in builder.js to enable one-click issues."); return; }
    window.open(`https://github.com/${GITHUB_REPO}/issues/new?title=${title}&body=${body}`,"_blank");
  };

  renderStrip(); renderCode();

  // expose parser for tests
  window._parseMakeCode = parseMakeCodeFunction;
  window._libraryEntry = libraryEntry;
});
})();
