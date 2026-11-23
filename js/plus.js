// Hive Scribe flagship additions (2026-11-19):
//  - approximate word study for the Septuagint, Targum, Vulgate and Textus Receptus fill (never presented as an exact parse)
//  - shareable deep links (#gen.1.2?wit=tg&word=H7307, #conn/john.1.1), back/forward, Copy link
//  - command palette (Ctrl/Cmd+K): references, Strong's numbers, Hebrew/Greek lemmas, English phrase search
//  - read-aloud with the browser's Web Speech API (feature-detected)
// Loaded before the main script; everything here runs only after the main script has defined its globals.
(function(){
'use strict';
const HSP = window.HSP = {};
const E = s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// ===================== normalizers =====================
const gnorm = w => String(w||'').normalize('NFD').replace(/\p{M}/gu,'').replace(/[^\p{L}]/gu,'').toLowerCase().replace(/ς/g,'σ');
const FIN = {'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ'};
const hcons = w => [...String(w||'')].filter(ch=>ch>='\u05d0'&&ch<='\u05ea').map(ch=>FIN[ch]||ch).join('');
const lnorm = w => String(w||'').toLowerCase().replace(/æ/g,'ae').replace(/œ/g,'oe').normalize('NFD').replace(/\p{M}/gu,'').replace(/[^a-z]/g,'').replace(/j/g,'i').replace(/v/g,'u');
HSP.gnorm=gnorm; HSP.hcons=hcons; HSP.lnorm=lnorm;

// ===================== lazy morph data =====================
const MD = {};
function morph(name){ if(!MD[name]) MD[name]=getJSON(`morph/${name}.json.gz`).catch(e=>{ delete MD[name]; throw e; }); return MD[name]; }
async function lex(L){ return LEXF[L] || lexFile(L); }
const strongNum = k => { const m=/^([HG])0*(\d+)/.exec(k||''); return m?m[1]+m[2]:''; };

// ---------- Greek ----------
const G_WEND = ['ησομενος','ομενοις','ομενους','ομενων','ομενος','ομενον','ομενην','ομενης','ομενοι','ομενη','ομενα','θησεται','θησονται','θησομαι','θησαν','θεντες','θεισα','θεντος','θεις','θεν','θη','θηναι','σαμενος','σαντες','σαντος','σασα','σαμεν','σατε','σασιν','σουσιν','σουσι','σονται','σεται','σομαι','σεις','σει','σομεν','σετε','σας','σαν','σαι','σα','σω','σιν','ουσιν','ουσι','ουσα','ουσης','οντος','οντες','οντας','οντων','οντι','οντα','ονται','εσθαι','εσθε','ομεθα','ομαι','εται','ετο','οντο','ηται','ωνται','ωσιν','ωσι','ειν','ειτε','ετε','ομεν','ουμεν','ουσαι','οις','αις','ους','ων','ας','ης','ου','ον','ος','οι','αι','ην','ες','ει','ευς','εως','εις','εσι','υς','υν','ιν','ις','ω','α','η','ε','ι','ν','ο'];
const G_LEND = ['ομαι','ευω','εω','αω','οω','υμι','ημι','ωμι','μι','ω','ος','ον','ης','ας','ευς','ις','υς','ων','ηρ','ωρ','ορ','αξ','ιξ','ηξ','ψ','ξ','η','α','ι','υ'];
const G_PRE = [['προσ','προσ'],['περι','περι'],['προ','προ'],['απ','απο'],['αφ','απο'],['επ','επι'],['εφ','επι'],['κατ','κατα'],['καθ','κατα'],['μετ','μετα'],['μεθ','μετα'],['παρ','παρα'],['δι','δια'],['αν','ανα'],['εν','εν'],['εμ','εν'],['εκ','εκ'],['εξ','εκ'],['συν','συν'],['συμ','συν'],['συ','συν'],['υπ','υπο'],['υφ','υπο'],['αντ','αντι'],['ανθ','αντι']];
let G_STEM=null, G_LEMMA=null;
function gStems(n){ const out=new Set([n]); for(const e of G_LEND){ if(n.length-e.length>=2 && n.endsWith(e)) out.add(n.slice(0,-e.length)); } return out; }
function buildG(L){
  if(G_STEM) return; G_STEM=new Map(); G_LEMMA=new Map();
  for(const [k,e] of Object.entries(L)){ const n=gnorm(e[0]); if(!n) continue;
    (G_LEMMA.get(n)||G_LEMMA.set(n,[]).get(n)).push(k);
    for(const s of gStems(n)) (G_STEM.get(s)||G_STEM.set(s,[]).get(s)).push(k); }
  const occ=k=>(L[k]&&L[k][5])||0;
  for(const m of [G_STEM,G_LEMMA]) for(const [s,ks] of m) ks.sort((a,b)=>occ(b)-occ(a));
}
function gWordStems(n){
  const out=[]; const add=(s,how)=>{ if(s.length>=3 && !out.some(o=>o.s===s)) out.push({s,how}); };
  const bases=[n]; for(const e of G_WEND){ if(n.length-e.length>=3 && n.endsWith(e)) bases.push(n.slice(0,-e.length)); }
  for(const b of bases){
    add(b,'ending');
    if(/^[εη]/.test(b)){ add(b.slice(1),'augment'); if(b[0]==='η'){ add('α'+b.slice(1),'augment'); add('ε'+b.slice(1),'augment'); } }
    for(const [p,full] of G_PRE){ if(b.startsWith(p) && b.length>p.length+2){ const rest=b.slice(p.length);
      if(rest[0]==='ε'){ add(full+rest.slice(1),'augment'); } add(full+rest,'prefix'); } }
  }
  return out;
}
async function greekApprox(word){
  const [gf,L]=await Promise.all([morph('gform'),lex('G')]); buildG(L);
  const n=gnorm(word); if(!n) return null;
  if(gf[n]) return {keys:gf[n].split('|'), conf:'high', how:'This exact spelling is tagged in the Greek New Testament data (SBLGNT/TAGNT, RP2018); the word here is matched by spelling only.'};
  if(G_LEMMA.has(n)) return {keys:G_LEMMA.get(n).slice(0,3), conf:'medium', how:'The word is spelled like the dictionary form of this lexicon entry.'};
  for(const c of gWordStems(n)){ const hit=G_STEM.get(c.s); if(hit) return {keys:hit.slice(0,3), conf:'low', how:c.how==='augment'?'Stem guess: the ending and the augment were stripped, and the rest compared with lexicon headwords.':c.how==='prefix'?'Stem guess: the ending was stripped, a shortened prefix restored, and the rest compared with lexicon headwords.':'Stem guess: the ending was stripped and the rest compared with lexicon headwords.'}; }
  return {keys:[], conf:'none', how:'No lexicon headword could be matched to this spelling.'};
}

// ---------- Hebrew / Aramaic ----------
let H_CONS=null, H_SKEL=null;
const skel = c => c.length>2 ? c[0]+c.slice(1,-1).replace(/[וי]/g,'')+c.slice(-1) : c;
function buildH(L){
  if(H_CONS) return; H_CONS={H:new Map(),A:new Map()}; H_SKEL={H:new Map(),A:new Map()};
  for(const [k,e] of Object.entries(L)){ const t=String(e[2]||'').split(':')[0]; if(!/^(H|A|N)$/.test(t)) continue; const c=hcons(e[0]); if(c.length<2) continue;
    const g=t==='A'?'A':'H'; (H_CONS[g].get(c)||H_CONS[g].set(c,[]).get(c)).push(k); const s=skel(c); (H_SKEL[g].get(s)||H_SKEL[g].set(s,[]).get(s)).push(k); }
  const occ=k=>(L[k]&&L[k][5])||0, prop=k=>String((L[k]||[])[2]||'').startsWith('N')?1:0;
  for(const o of [H_CONS,H_SKEL]) for(const g of ['H','A']) for(const [c,ks] of o[g]) ks.sort((a,b)=>prop(a)-prop(b)||occ(b)-occ(a));
}
const H_PFX='ודבלכמהש';
const H_SFX=['יהון','יכון','ותא','יתא','הון','כון','נא','יא','ין','ון','תא','יה','הי','וי','וה','הא','א','ה','י','ך','ת','ו','ם','ן'];
async function hebApprox(word, aram){
  const [hf,L]=await Promise.all([morph('hform'),lex('H')]); buildH(L);
  const c=hcons(word); if(!c) return null;
  const pick=ks=>ks.split('|');
  if(hf[c]) return {keys:pick(hf[c]), conf:'high', how:'This exact consonantal spelling is tagged in the Hebrew Bible data (STEPBible TAHOT); the word here is matched by spelling only.'};
  const vs=[{s:c,p:''}];
  for(let k=1;k<=3&&k<c.length-1;k++){ const p=c.slice(0,k); if([...p].every(ch=>H_PFX.includes(ch))) vs.push({s:c.slice(k),p}); else break; }
  for(const x of vs.slice(1)){ const h=hf['~'+x.s]||hf[x.s]; if(h) return {keys:pick(h), conf:'medium', how:`Prefix ${x.p.split('').join('+')} removed; the rest is spelled like a form tagged in the Hebrew Bible data (TAHOT).`}; }
  const order=aram?['A','H']:['H','A'];
  const lemma=(s)=>{ for(const g of order){ const ks=H_CONS[g].get(s); if(ks) return ks; } return null; };
  for(const x of vs){ const ks=lemma(x.s); if(ks) return {keys:ks.slice(0,3), conf:'medium', how:`${x.p?'Prefix '+x.p.split('').join('+')+' removed; the':'The'} letters match the dictionary form of this lexicon entry.`}; }
  for(const x of vs){ for(const sf of H_SFX){ if(x.s.length-sf.length<2 || !x.s.endsWith(sf)) continue; const s=x.s.slice(0,-sf.length);
    const h=hf['~'+s]||hf[s]; if(h) return {keys:pick(h), conf:'low', how:`Stem guess: ${x.p?'prefix '+x.p.split('').join('+')+' and ':''}ending -${sf} removed; the rest is spelled like a tagged Hebrew Bible form.`};
    const ks=lemma(s); if(ks) return {keys:ks.slice(0,3), conf:'low', how:`Stem guess: ${x.p?'prefix '+x.p.split('').join('+')+' and ':''}ending -${sf} removed; the rest matches a lexicon headword.`}; } }
  for(const x of vs){ for(const sf of ['',...H_SFX]){ if(x.s.length-sf.length<2 || (sf&&!x.s.endsWith(sf))) continue; const s=skel(sf?x.s.slice(0,-sf.length):x.s);
    for(const g of order){ const ks=H_SKEL[g].get(s); if(ks) return {keys:ks.slice(0,3), conf:'low', how:'Loose guess: vowel letters (ו, י) ignored when comparing with lexicon headwords.'}; } } }
  return {keys:[], conf:'none', how:'No lexicon headword could be matched to this spelling.'};
}

// ---------- Latin (William Whitaker's WORDS data) ----------
let LAT=null;
async function latData(){
  if(LAT) return LAT; const d=await morph('lat');
  const stem=new Map(); d.e.forEach((e,ei)=>e[0].forEach((s,si)=>{ if(s) (stem.get(s)||stem.set(s,[]).get(s)).push([ei,si+1]); }));
  const uniq=new Map(); d.u.forEach(u=>(uniq.get(u[0])||uniq.set(u[0],[]).get(u[0])).push(u));
  const byEnd=new Map(); d.i.forEach(x=>(byEnd.get(x[3])||byEnd.set(x[3],[]).get(x[3])).push(x));
  LAT={e:d.e, stem, uniq, byEnd, ends:[...byEnd.keys()].sort((a,b)=>b.length-a.length)}; return LAT;
}
const FREQ={A:6,B:5,C:4,D:3,E:2,F:1};
// the irregular verb "to be" is built into WORDS' program code rather than its data files, so its common forms are listed here
const SUM={sum:'present, active, indicative, 1st person, singular',es:'present, active, indicative, 2nd person, singular',est:'present, active, indicative, 3rd person, singular',sumus:'present, active, indicative, 1st person, plural',estis:'present, active, indicative, 2nd person, plural',sunt:'present, active, indicative, 3rd person, plural',eram:'imperfect, active, indicative, 1st person, singular',eras:'imperfect, active, indicative, 2nd person, singular',erat:'imperfect, active, indicative, 3rd person, singular',eramus:'imperfect, active, indicative, 1st person, plural',eratis:'imperfect, active, indicative, 2nd person, plural',erant:'imperfect, active, indicative, 3rd person, plural',ero:'future, active, indicative, 1st person, singular',eris:'future, active, indicative, 2nd person, singular',erit:'future, active, indicative, 3rd person, singular',erimus:'future, active, indicative, 1st person, plural',eritis:'future, active, indicative, 2nd person, plural',erunt:'future, active, indicative, 3rd person, plural',sim:'present, active, subjunctive, 1st person, singular',sis:'present, active, subjunctive, 2nd person, singular',sit:'present, active, subjunctive, 3rd person, singular',simus:'present, active, subjunctive, 1st person, plural',sint:'present, active, subjunctive, 3rd person, plural',essem:'imperfect, active, subjunctive, 1st person, singular',esset:'imperfect, active, subjunctive, 3rd person, singular',essent:'imperfect, active, subjunctive, 3rd person, plural',esse:'present, active, infinitive',esto:'future, active, imperative, 2nd/3rd person, singular',este:'present, active, imperative, 2nd person, plural',fui:'perfect, active, indicative, 1st person, singular',fuit:'perfect, active, indicative, 3rd person, singular',fuimus:'perfect, active, indicative, 1st person, plural',fuerunt:'perfect, active, indicative, 3rd person, plural',fuerat:'pluperfect, active, indicative, 3rd person, singular',fuerant:'pluperfect, active, indicative, 3rd person, plural',fuerit:'future perfect / perfect subjunctive, 3rd person, singular',fuisset:'pluperfect, active, subjunctive, 3rd person, singular',fore:'future, active, infinitive',futurus:'future, active, participle'};
const LPOS={N:'noun',V:'verb',ADJ:'adjective',ADV:'adverb',PREP:'preposition',CONJ:'conjunction',INTERJ:'interjection',PRON:'pronoun',NUM:'numeral',PACK:'pronoun',VPAR:'participle',SUPINE:'supine'};
const LCASE={NOM:'nominative',GEN:'genitive',DAT:'dative',ACC:'accusative',ABL:'ablative',VOC:'vocative',LOC:'locative'};
const LWORD={S:'singular',P:'plural',M:'masculine',F:'feminine',N:'neuter',C:'',X:'',PRES:'present',IMPF:'imperfect',FUT:'future',PERF:'perfect',PLUP:'pluperfect',FUTP:'future perfect',ACTIVE:'active',PASSIVE:'passive',IND:'indicative',SUB:'subjunctive',IMP:'imperative',INF:'infinitive',PPL:'participle',POS:'',COMP:'comparative',SUPER:'superlative',1:'1st person',2:'2nd person',3:'3rd person',0:''};
function latParse(pos, feats){ return [LPOS[pos]||pos, ...String(feats||'').split(/\s+/).map(t=>LCASE[t]||LWORD[t]||'')].filter(Boolean).join(', '); }
const vDisp = s => String(s).replace(/(^|[aeiou])u(?=[aeiou])/g,'$1v');
function latHead(e){ return latHead0(e).split(/(,\s*)/).map(vDisp).join(''); }
function latHead0(e){
  const [s,pos,cls]=e; const [a,b,c,d]=s; const k=String(cls||'').split(' ');
  if(pos==='V' && k[0]==='3' && k[1]==='2' && a) return `${a}o, ${b}re${c?', '+c+'i':''}${d?', '+d+'us':''}`;
  if(pos==='V'){ const inf={1:'are',2:'ere',3:'ere',4:'ire'}[k[0]]; if(inf&&a) return `${a}${k[0]==='2'?'eo':(k[0]==='3'&&k[1]==='4')||k[0]==='4'?'io':'o'}, ${b}${inf}${c?', '+c+'i':''}${d?', '+d+'us':''}`; }
  if(pos==='N'){ const m={'1':[a+'a',b+'ae'],'2':[a+(k[1]==='2'?'um':'us'),b+'i'],'3':[a,b+'is'],'4':[a+(k[1]==='2'?'u':'us'),b+'us'],'5':[a+'es',b+'ei']}[k[0]]; if(m&&a) return m.join(', '); }
  if(pos==='ADJ' && k[0]==='1' && a) return `${a}us, ${b}a, ${b}um`;
  if(pos==='ADJ' && k[0]==='3' && a){ if(k[1]==='2') return `${a}is, ${b}e`; if(k[1]==='1') return `${a}, ${b}is`; if(k[1]==='3') return `${a}, ${b}is, ${b}e`; }
  return s.filter(Boolean).map((x,i)=>i===0&&!s[1]?x:x+'-').join(', ');
}
async function latinApprox(word){
  const D=await latData(); let n=lnorm(word); if(!n) return null;
  const tries=[n]; for(const t of ['que','ne','ue']) if(n.length>t.length+2 && n.endsWith(t)) tries.push(n.slice(0,-t.length));
  const res=new Map();
  const add=(ei,parse,score,ps)=>{ const r=res.get(ei)||{ei,parses:new Map(),score:0}; r.parses.set(parse,Math.max(r.parses.get(parse)||0,ps)); r.score=Math.max(r.score,score); res.set(ei,r); };
  const uq=[];
  for(const w of tries){
    (D.uniq.get(w)||[]).forEach(u=>uq.push(u));
    for(const end of D.ends){ if(!w.endsWith(end) || w.length-end.length<1) continue; const st=w.slice(0,w.length-end.length);
      const cands=D.stem.get(st); if(!cands) continue;
      for(const inf of D.byEnd.get(end)){ const [ipos,icls,istem,,feats,ifr]=inf; const ps=(FREQ[ifr]||0);
        for(const [ei,si] of cands){ const e=D.e[ei]; if(si!==istem) continue;
          const epos=e[1]; if(!(ipos===epos || ((ipos==='VPAR'||ipos==='SUPINE')&&epos==='V') || (ipos==='PRON'&&epos==='PACK'))) continue;
          const ic=icls.split(' '), ec=String(e[2]).split(' ');
          if(icls && /^\d/.test(ec[0]||'')){ if(ic[0]!=='0' && ic[0]!==ec[0]) continue; if(ic[1] && ic[1]!=='0' && ic[1]!==ec[1]) continue; }
          add(ei, latParse(ipos,feats), (FREQ[e[3]]||0)*2+ps+(w===n?1:0), ps); } } } }
  const list=[...res.values()].sort((a,b)=>b.score-a.score).slice(0,4).map(r=>({head:latHead(D.e[r.ei]), pos:LPOS[D.e[r.ei][1]]||D.e[r.ei][1], mean:D.e[r.ei][4], parses:(()=>{ const ps=[...r.parses].sort((a,b)=>b[1]-a[1]); const top=ps[0]?ps[0][1]:0; return ps.filter(x=>x[1]>=top-2).slice(0,3).map(x=>x[0]); })()}));
  const u=uq.slice(0,2).map(x=>({head:x[0], pos:'irregular form', mean:x[2], parses:[latParse(x[1].split(' ')[0], x[1].split(' ').slice(3).join(' '))]}));
  const sm=tries.map(w=>SUM[w]).find(Boolean); if(sm) u.unshift({head:'sum, esse, fui, futurus', pos:'verb (irregular)', mean:'be; exist; (also used to form perfect passive tenses);', parses:[sm]});
  const all=u.concat(list);
  return {lat:all, conf: all.length===0?'none':all.length===1?'medium':'low', how: all.length?'Ending analysis with the stems and endings of William Whitaker’s WORDS. Several readings may fit; context decides.':'No stem and ending in Whitaker’s WORDS fits this spelling.'};
}

HSP.approx = async function(witId, word){
  if(witId==='lxx'||witId==='tr') return greekApprox(word);
  if(witId==='tg') return hebApprox(word, true);
  if(witId==='vul') return latinApprox(word);
  return null;
};
const CONF={high:['High','approx-high'],medium:['Medium','approx-med'],low:['Low','approx-low'],none:['No match','approx-none']};
function approxHTML(witId, word, r){
  if(!r) return '<div class="wp-muted">Nothing to match.</div>';
  const [cl,cc]=CONF[r.conf]||CONF.none;
  let h=`<div class="approx-head"><span class="approx-tag">Approximate match</span> <span class="approx-conf ${cc}">Confidence: ${cl}</span></div><p class="approx-how">${E(r.how)}</p>`;
  if(r.lat){
    h+=r.lat.map(x=>`<div class="approx-ent"><div class="wp-row"><div class="wp-lbl">Entry</div><div class="wp-val"><b class="wp-lat">${E(x.head)}</b> · ${E(x.pos)}</div></div>`+
      wpRow('Could be', x.parses.map(E).join('<br>'))+wpRow('Meaning', E(x.mean))+`</div>`).join('');
    h+=`<p class="approx-note">Not an exact parse: the Vulgate here is untagged text. Latin stems, endings and meanings from William Whitaker’s WORDS.</p>`;
    return h;
  }
  const L=witId==='tg'?'H':'G', lx=LEXF[L]||{};
  h+=r.keys.map((k,ix)=>{ const e=lx[k]; if(!e) return ''; const cls=L==='H'?'wp-heb':'wp-grk';
    return `<div class="approx-ent">${wpRow(ix?'Or':'Lemma',`<span class="${cls}">${E(L==='H'?view(e[0],'heb'):e[0])}</span> <i>${E(e[1])}</i> · ${E(e[3])}${String(e[2]).startsWith('A:')?' <span class="wp-src">Aramaic</span>':''}`)}`+
      wpRow("Strong's", `${strongLink(k, strongNum(k), 'wp-strong')}${k!==strongNum(k)?` <span class="wp-src">extended ${E(k)}</span>`:''}`)+
      (ix===0&&e[4]?`<div class="wp-def"><div class="wp-lbl">Brief lexicon <span class="wp-src">STEPBible ${L==='H'?'TBESH':'TBESG'}</span></div><p>${E(e[4])}</p></div>`:'')+`</div>`; }).join('');
  h+=`<p class="approx-note">Not an exact parse: ${witId==='tg'?'the Aramaic Targum':witId==='tr'?'this Textus Receptus verse':'the Septuagint'} text here has no word tagging, so this entry is a spelling-based guess. Check it against the context.</p>`;
  return h;
}
HSP.approxSectionHTML = function(wit, d, v, i, n){
  return `<div class="wp-grid">${wpRow('Position',`word ${i+1} of ${n}`)}${wpRow('Where',E(witRefNote(wit.id,v)||refName(state.book,state.ch,v)))}</div>`+
    `<div class="wp-sec approx" id="wpApprox"><div class="wp-muted">Looking for a matching lexicon entry…</div></div>`;
};
HSP.fillApprox = async function(seqOk, wit, d){
  const el=()=>document.getElementById('wpApprox');
  try{ const r=await HSP.approx(wit.id, d.w); if(!seqOk()||!el()) return; el().innerHTML=approxHTML(wit.id,d.w,r); HSP.lastApprox={w:d.w,r}; }
  catch(e){ if(seqOk()&&el()) el().innerHTML=`<div class="wp-muted">Word-matching data not available${navigator.onLine===false?' offline yet':''}.</div>`; }
};

// find the word a link points to: Strong's key (exact or approximate match) or a spelling; i = position hint
HSP.findWord = async function(witId, v, want, iHint){
  const ws=verseWords(witId, v); if(!ws||!ws.length) return null;
  if(iHint!=null && ws[iHint] && !want) return iHint;
  const isKey=/^[HG]\d+[A-Za-z]?$/i.test(want||'');
  const L=isKey?want[0].toUpperCase():null;
  let wantLemma='';
  if(isKey){ try{ const lx=await lex(L); const rk=await resolveStrong(want.toUpperCase()); const e=lx[rk]; wantLemma=e?(L==='H'?hcons(e[0]):gnorm(e[0])):''; }catch(e){} }
  const wantForm = isKey?'':(/[\u0590-\u05ff]/.test(want)?hcons(want):/[\u0370-\u03ff\u1f00-\u1fff]/.test(want)?gnorm(want):lnorm(want));
  const keyHit = keys => keys.some(k=>{ if(strongNum(k)===strongNum(want)) return true; const lx=LEXF[k[0]]; const e=lx&&lx[k]; return !!(e&&wantLemma&&(k[0]==='H'?hcons(e[0]):gnorm(e[0]))===wantLemma); });
  const order=[...ws.keys()]; if(iHint!=null && ws[iHint]){ order.splice(order.indexOf(iHint),1); order.unshift(iHint); }
  for(const i of order){ const d=ws[i];
    if(d.raw && (witId==='heb'||isGkWit(witId)||d.fill==='byz')){ const k=wpKeyOf(d.raw, d.fill==='byz'?'byz':witId)||''; if(isKey? keyHit([k]) : (gnorm(d.w)===wantForm||hcons(d.w)===wantForm)) return i; continue; }
    if(!isKey){ const f=/[\u0590-\u05ff]/.test(d.w)?hcons(d.w):/[\u0370-\u03ff\u1f00-\u1fff]/.test(d.w)?gnorm(d.w):lnorm(d.w); if(f===wantForm) return i; continue; }
    try{ const r=await HSP.approx(d.fill||witId, d.w); if(r&&r.keys&&keyHit(r.keys)) return i; }catch(e){}
  }
  return iHint!=null && ws[iHint] ? iHint : null;
};
HSP.wordKeyFor = async function(witId, d){
  if(d.raw && (witId==='heb'||isGkWit(witId)||d.fill==='byz')) return wpKeyOf(d.raw, d.fill==='byz'?'byz':witId);
  try{ const r=await HSP.approx(d.fill||witId, d.w); return r&&r.keys&&r.keys[0]||null; }catch(e){ return null; }
};

// ===================== read aloud (Web Speech API) =====================
const TTS_LANG={he:['he','iw'],arc:['he','iw'],grc:['el'],la:['la','it'],en:['en']};
const TTS_NAME={he:'Hebrew',arc:'Hebrew (used for Aramaic)',grc:'Greek',la:'Latin (or Italian)',en:'English'};
HSP.ttsSupported = ()=> 'speechSynthesis' in window && typeof SpeechSynthesisUtterance!=='undefined';
function pickVoice(kind){
  if(!HSP.ttsSupported()) return null; const vs=speechSynthesis.getVoices()||[];
  for(const p of TTS_LANG[kind]||[]){ const v=vs.find(x=>String(x.lang||'').toLowerCase().replace('_','-').startsWith(p)); if(v) return v; }
  return null;
}
function ttsText(text, kind){
  let s=String(text||'');
  if(kind==='he'||kind==='arc') s=s.replace(/[\u0591-\u05AF\u05BD\u05C0\u05C3\u05C6]/g,'').replace(/\u05BE/g,' ');
  if(kind==='grc') s=s.normalize('NFD').replace(/[\u0313\u0314\u0342\u0345\u0300]/g,'').normalize('NFC');
  return s.replace(/[\u2E00-\u2E0F\u27E6\u27E7⸂⸃]/g,'');
}
HSP.speak = function(text, kind, btn){
  const say=(msg)=>{ const n=btn&&btn.parentElement&&btn.parentElement.querySelector('.say-note'); if(n){ n.textContent=msg; n.hidden=!msg; } else if(msg) backupToast(msg); };
  if(!HSP.ttsSupported()){ say('Read-aloud is not supported in this browser.'); return; }
  const go=()=>{
    const v=pickVoice(kind);
    if(!v){ say(`No ${TTS_NAME[kind]||''} voice is installed on this device. You can add one in your system's speech or language settings.`); return; }
    speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(ttsText(text,kind)); u.voice=v; u.lang=v.lang; u.rate=kind==='en'?1:.8;
    if(btn){ btn.classList.add('speaking'); u.onend=u.onerror=()=>btn.classList.remove('speaking'); }
    speechSynthesis.speak(u); say(kind==='la'&&!/^la/i.test(v.lang)?'Using an Italian voice for the Latin (no Latin voice on this device).':kind==='arc'?'Using a Hebrew voice for the Aramaic.':'');
  };
  if(!(speechSynthesis.getVoices()||[]).length){ let done=false; const f=()=>{ if(done) return; done=true; go(); }; speechSynthesis.addEventListener('voiceschanged',f,{once:true}); setTimeout(f,700); } else go();
};
HSP.sayBtn = (text, kind, label) => HSP.ttsSupported() ? `<button type="button" class="saybtn" data-say="${E(text)}" data-kind="${kind}" aria-label="${E(label||'Listen')}" title="${E(label||'Listen')} (device voice: modern pronunciation, not cantillation)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg><span>Listen</span></button><span class="say-note" hidden></span>` : '';
document.addEventListener('click',e=>{ const b=e.target.closest('[data-say]'); if(!b) return; e.preventDefault(); e.stopPropagation(); HSP.speak(b.dataset.say, b.dataset.kind, b); }, true);
HSP.kindOf = cls => cls==='grk'?'grc':cls==='lat'?'la':cls==='arc'?'arc':'he';

// ===================== deep links =====================
const TABHASH={read:'',conn:'conn',poly:'poly',lex:'lex',study:'study',about:'about'};
let applying=0;
const slug = b => String(b||'').toLowerCase();
function bookFromSlug(s){ s=String(s||'').toLowerCase(); return (BOOKS.find(b=>b.id.toLowerCase()===s)||{}).id || HSP.resolveBook(s); }
HSP.focus=null;   // {v, i, key}
HSP.hashFor = function(){
  const t=state.tab; const base=`${slug(state.book)}.${state.ch}`;
  if(t==='lex'){ return '#lex'+(typeof lexOpen!=='undefined'&&lexOpen?'/'+lexOpen:''); }
  if(t==='study'){ return '#study'+(typeof STUDY!=='undefined'&&STUDY&&STUDY.id?'/'+STUDY.id:''); }
  if(t==='about') return '#about';
  if(t==='conn'||t==='poly'){ const v=t==='conn'&&state.xVerse&&state.xVerse!=='all'?state.xVerse:(HSP.focus&&HSP.focus.v); return `#${t}/${base}${v?'.'+v:''}`; }
  const f=HSP.focus, ws=wpState;
  const v=ws?ws.v:(f&&f.v); let h='#'+base+(v?'.'+v:'');
  const q=[]; if(state.wit && (v || state.wit!==defaultWit(state.book,state.ch))) q.push('wit='+state.wit);
  if(ws){ if(ws.key) q.push('word='+encodeURIComponent(ws.key)); q.push('i='+ws.i); }
  return h+(q.length?'?'+q.join('&'):'');
};
HSP.sync = function(mode){
  if(applying || !window.__restored) return;
  const h=HSP.hashFor(); if(location.hash===h) return;
  try{ history[mode==='push'?'pushState':'replaceState'](null,'',h); }catch(e){}
};
HSP.parse = function(hash){
  let h=decodeURIComponent(String(hash||'').replace(/^#/,'')); if(!h) return null;
  let q=''; const qi=h.indexOf('?'); if(qi>=0){ q=h.slice(qi+1); h=h.slice(0,qi); }
  const P=new URLSearchParams(q); let tab='read', rest=h;
  const m=/^(conn|poly|lex|study|about)(?:\/(.*))?$/i.exec(h); if(m){ tab=m[1].toLowerCase(); rest=m[2]||''; }
  const r={tab, wit:P.get('wit'), word:P.get('word'), i:P.has('i')?+P.get('i'):null, q:P.get('q')};
  if(tab==='lex'){ r.key=rest||null; return r; }
  if(tab==='study'){ r.study=rest||null; return r; }
  if(tab==='about') return r;
  if(!rest) return tab==='read'?null:r;
  const mm=/^(.+?)[.\s:](\d+)(?:[.:](\d+[a-z]?))?$/i.exec(rest); if(!mm) return null;
  const b=bookFromSlug(mm[1]); if(!b||!BOOK[b]) return null;
  r.b=b; r.c=Math.max(1,Math.min(+mm[2],BOOK[b].ch.length)); r.v=mm[3]||null;
  return r;
};
HSP.apply = async function(r, opts){
  opts=opts||{}; if(!r) return false; applying++;
  try{
    if(r.tab==='lex'){ if(r.key) await openConcordance(r.key); else showTab('lex'); return true; }
    if(r.tab==='study'){ showTab('study'); if(r.study && typeof openStudy==='function'){ try{ await openStudy(r.study); }catch(e){} } return true; }
    if(r.tab==='about'){ showTab('about'); return true; }
    if(r.b && (r.b!==state.book||r.c!==state.ch||!CH)){ state.vf='all'; await gotoChapter(r.b,r.c,{keepScroll:!!opts.initial}); }
    if(r.wit && WITS.some(w=>w.id===r.wit)) state.wit=r.wit;
    if(r.tab==='conn'){ if(r.v && vlabels(state.book,state.ch).includes(r.v)) state.xVerse=r.v; showTab('conn'); render(); return true; }
    if(r.tab==='poly'){ HSP.focus=r.v?{v:r.v}:null; showTab('poly'); return true; }
    if(state.tab!=='read') showTab('read');
    wpClose(false);
    if(!r.v){ render(); HSP.focus=null; if(!opts.initial) scrollTo(0,0); return true; }
    if(!visibleVlabels(state.book,state.ch).includes(r.v)){ render(); return true; }
    HSP.focus={v:r.v};
    state.open.add(`${state.book}.${state.ch}.${r.v}`); render();
    const el=document.getElementById(`v-${state.book}-${state.ch}-${r.v}`);
    if(el){ el.scrollIntoView({block:'center'}); el.classList.add('flash'); setTimeout(()=>el.classList.remove('flash'),1600); }
    if(r.word!=null || r.i!=null){
      const i=await HSP.findWord(state.wit, r.v, r.word, r.i);
      const w=i!=null && el && el.querySelector(`.word[data-i="${i}"]`);
      if(w){ w.scrollIntoView({block:'center'}); wpOpen(w,{focus:false, fromLink:true, linkKey:r.word&&/^[HG]\d+[A-Za-z]?$/i.test(r.word)?r.word.toUpperCase():null}); }
    }
    persist();
    return true;
  } finally { applying--; }
};
addEventListener('popstate',()=>{ const r=HSP.parse(location.hash); if(r) HSP.apply(r); });
HSP.copyLink = function(){
  const url=location.origin+location.pathname+HSP.hashFor();
  const done=()=>backupToast('Link copied: '+url.replace(/^https?:\/\//,''));
  if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done,()=>{ fb(); });
  else fb();
  function fb(){ const t=document.createElement('textarea'); t.value=url; document.body.appendChild(t); t.select(); try{ document.execCommand('copy'); done(); }catch(e){ backupToast(url); } t.remove(); }
  window.__lastLink=url; return url;
};

// ===================== command palette =====================
const ALIAS={gn:'Gen',ge:'Gen',ex:'Exod',exo:'Exod',lv:'Lev',le:'Lev',nm:'Num',nu:'Num',dt:'Deut',de:'Deut',jos:'Josh',jdg:'Judg',jg:'Judg',ru:'Ruth','1sa':'1Sam','2sa':'2Sam','1ki':'1Kgs','2ki':'2Kgs','1kg':'1Kgs','2kg':'2Kgs','1ch':'1Chr','2ch':'2Chr',ne:'Neh',es:'Esth',est:'Esth',jb:'Job',ps:'Ps',psa:'Ps',psalm:'Ps',psalms:'Ps',pss:'Ps',pr:'Prov',prv:'Prov',ec:'Eccl',ecc:'Eccl',qoh:'Eccl',so:'Song',sos:'Song',ss:'Song',cant:'Song',canticles:'Song',is:'Isa',jr:'Jer',la:'Lam',ez:'Ezek',eze:'Ezek',dn:'Dan',da:'Dan',ho:'Hos',jl:'Joel',am:'Amos',ob:'Obad',jon:'Jonah',mi:'Mic',na:'Nah',hb:'Hab',zp:'Zeph',hg:'Hag',zc:'Zech',ml:'Mal',
  mt:'Matt',mk:'Mark',mr:'Mark',lk:'Luke',lu:'Luke',jn:'John',jhn:'John',joh:'John',ac:'Acts',rm:'Rom',ro:'Rom','1co':'1Cor','2co':'2Cor',ga:'Gal',ep:'Eph',php:'Phil',pp:'Phil',phil:'Phil',col:'Col','1th':'1Thess','2th':'2Thess','1ti':'1Tim','2ti':'2Tim',ti:'Titus',tit:'Titus',phm:'Phlm',phlm:'Phlm',philemon:'Phlm',hb2:'Heb',jas:'Jas',jm:'Jas','1pe':'1Pet','2pe':'2Pet','1pt':'1Pet','2pt':'2Pet','1jn':'1John','2jn':'2John','3jn':'3John','1jo':'1John','2jo':'2John','3jo':'3John',jud:'Jude',jd:'Jude',re:'Rev',rv:'Rev',apoc:'Rev',revelations:'Rev',
  tb:'Tob',tob:'Tob',jdt:'Jdt',wis:'Wis',ws:'Wis',sir:'Sir',ecclus:'Sir',bar:'Bar','1mc':'1Macc','2mc':'2Macc','1ma':'1Macc','2ma':'2Macc'};
const bkey = s => String(s||'').toLowerCase().replace(/[\s.]/g,'').replace(/^i{3}(?=[a-z])/,'3').replace(/^ii(?=[a-z])/,'2').replace(/^i(?=[a-z])/,'1').replace(/^(first|1st)/,'1').replace(/^(second|2nd)/,'2').replace(/^(third|3rd)/,'3');
HSP.resolveBook = function(s){
  const k=bkey(s); if(!k) return null;
  if(ALIAS[k] && BOOK[ALIAS[k]]) return ALIAS[k];
  const esn=b=> (typeof HS_I18N!=='undefined' && HS_I18N.BOOKS.es[b.id]) || '';
  const exact=BOOKS.find(b=>b.id.toLowerCase()===k||bkey(b.name)===k||bkey(esn(b))===k); if(exact) return exact.id;
  if(k.length>=2){ const pre=BOOKS.find(b=>bkey(b.name).startsWith(k)||bkey(esn(b)).startsWith(k)||b.id.toLowerCase().startsWith(k)); if(pre) return pre.id; }
  return null;
};
HSP.parseRef = function(q){
  const m=/^\s*((?:[1-3]|i{1,3})?\s*[a-z][a-z.\s]*?)\s*(\d+)(?:\s*[:.,\s]\s*(\d+))?(?:\s*[-–]\s*\d+)?\s*$/i.exec(q||''); if(!m) return null;
  const b=HSP.resolveBook(m[1]); if(!b) return null; const c=+m[2]; if(c<1||c>BOOK[b].ch.length) return {b, c:Math.min(Math.max(c,1),BOOK[b].ch.length), v:null, bad:true};
  let v=m[3]||null; if(v && !vlabels(b,c).includes(String(v))) v=null; return {b,c,v};
};
let PAL=null, palSeq=0, palSel=0, palItems=[], palEn='web';
function palVer(id){
  if(id==='kjv') return {id:'kjv', dir:'kjv', abbr:'KJV', ok:b=>!!(b&&b.kjv)};
  if(id==='rvr1909') return {id:'rvr1909', dir:'rvr1909', abbr:'RVR 1909', ok:b=>!!(b&&b.rvr1909)};
  return {id:'web', dir:'en', abbr:'WEB', ok:()=>true};
}
const T=(k,v)=> (typeof HS_I18N!=='undefined'?HS_I18N.t(k,v):k);
function palEl(){
  if(PAL) return PAL;
  const d=document.createElement('div'); d.id='cmdk'; d.className='cmdk'; d.hidden=true; d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true'); d.setAttribute('aria-label',T('cmdk.aria'));
  d.innerHTML=`<div class="cmdk-bd" data-cmdk-close></div><div class="cmdk-pn"><div class="cmdk-top"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input id="cmdkQ" type="search" autocomplete="off" spellcheck="false" placeholder="Gen 1:2 · jn 3 16 · H7363 · ברא · λόγος · “hovering”" aria-label="${T('cmdk.ariaInput')}" aria-controls="cmdkList" aria-autocomplete="list"><kbd class="cmdk-kbd">Esc</kbd></div>
  <div class="cmdk-opts"><span class="cmdk-hint" id="cmdkHint">${T('cmdk.hintEmpty')}</span><span class="seg cmdk-en" role="group" aria-label="${T('cmdk.ariaText')}"><button type="button" data-en="web" aria-pressed="true">WEB</button><button type="button" data-en="kjv" aria-pressed="false">KJV</button><button type="button" data-en="rvr1909" aria-pressed="false">RVR 1909</button></span></div>
  <div class="cmdk-list" id="cmdkList" role="listbox" aria-label="${T('cmdk.results')}"></div><div class="cmdk-foot"><span>${T('cmdk.foot')}</span><button type="button" class="linkbtn" id="cmdkCopy">${T('cmdk.copyView')}</button></div></div>`;
  document.body.appendChild(d); PAL=d;
  const q=d.querySelector('#cmdkQ'); let t=null;
  q.addEventListener('input',()=>{ clearTimeout(t); t=setTimeout(()=>palRun(q.value),120); });
  q.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){ e.preventDefault(); palMove(1); } else if(e.key==='ArrowUp'){ e.preventDefault(); palMove(-1); }
    else if(e.key==='Enter'){ e.preventDefault(); const it=palItems[palSel]; if(it) palChoose(it); }
    else if(e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); HSP.closePalette(); } });
  d.addEventListener('click',e=>{
    if(e.target.closest('[data-cmdk-close]')){ HSP.closePalette(); return; }
    const en=e.target.closest('[data-en]'); if(en){ palEn=en.dataset.en; d.querySelectorAll('[data-en]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.en===palEn)); palRun(q.value); return; }
    if(e.target.closest('#cmdkCopy')){ HSP.copyLink(); return; }
    const it=e.target.closest('[data-pi]'); if(it){ palChoose(palItems[+it.dataset.pi]); } });
  return d;
}
HSP.openPalette = function(initial){
  const d=palEl(); d.hidden=false; document.body.classList.add('cmdk-on');
  const q=d.querySelector('#cmdkQ'); if(initial!=null) q.value=initial; q.focus(); q.select(); palRun(q.value);
};
HSP.closePalette = function(){ if(!PAL||PAL.hidden) return false; PAL.hidden=true; document.body.classList.remove('cmdk-on'); palSeq++; const b=document.getElementById('searchBtn'); if(b) b.focus({preventScroll:true}); return true; };
function palMove(d){ if(!palItems.length) return; palSel=(palSel+d+palItems.length)%palItems.length; palPaintSel(); }
function palPaintSel(){ PAL.querySelectorAll('[data-pi]').forEach(el=>{ const on=+el.dataset.pi===palSel; el.classList.toggle('sel',on); el.setAttribute('aria-selected',on); if(on) el.scrollIntoView({block:'nearest'}); }); }
function palRender(items, status){
  palItems=items; if(palSel>=items.length) palSel=0;
  const list=PAL.querySelector('#cmdkList');
  let lastGroup=null;
  list.innerHTML=items.map((it,i)=>{ const g=it.group!==lastGroup?`<div class="cmdk-g" role="presentation">${E(it.group)}</div>`:''; lastGroup=it.group;
    return g+`<div class="cmdk-it${i===palSel?' sel':''}" role="option" id="cmdk-o${i}" aria-selected="${i===palSel}" data-pi="${i}"><div class="cmdk-t" dir="ltr">${it.html||E(it.title)}</div>${it.sub?`<div class="cmdk-s">${it.subHtml?it.sub:E(it.sub)}</div>`:''}</div>`; }).join('')+
    (status?`<div class="cmdk-status" role="status">${E(status)}</div>`:'');
}
function palChoose(it){ if(!it) return; HSP.closePalette(); setTimeout(()=>it.go(),0); }
HSP.paletteKind = function(q){
  q=String(q||'').trim(); if(!q) return 'empty';
  if(/^[HGhg]\d{1,4}[a-zA-Z]?$/.test(q)) return 'strong';
  if(HSP.parseRef(q)) return 'ref';
  if(/[\u0590-\u05ff]/.test(q)) return 'heb';
  if(/[\u0370-\u03ff\u1f00-\u1fff]/.test(q)) return 'grk';
  return 'text';
};
async function palRun(raw){
  const seq=++palSeq, q=String(raw||'').trim(), kind=HSP.paletteKind(q); palSel=0;
  const hint=PAL.querySelector('#cmdkHint');
  hint.textContent={empty:T('cmdk.hintEmpty'),strong:T('cmdk.hintStrong'),ref:T('cmdk.hintRef'),heb:T('cmdk.hintHeb'),grk:T('cmdk.hintGrk'),text:T('cmdk.hintText',{abbr:palVer(palEn).abbr})}[kind];
  PAL.dataset.kind=kind;
  if(kind==='empty'){ palRender([
      {group:'Try',title:'Gen 1:2',sub:'Go to a verse',go:()=>HSP.openPalette('Gen 1:2')},
      {group:'Try',title:'jn 3 16',sub:'Short book names work',go:()=>HSP.openPalette('jn 3 16')},
      {group:'Try',title:'H7363',sub:"Strong's number",go:()=>HSP.openPalette('H7363')},
      {group:'Try',title:'ברא',sub:'Hebrew or Greek word',go:()=>HSP.openPalette('ברא')},
      {group:'Try',title:'hovering',sub:'English words or a phrase',go:()=>HSP.openPalette('hovering')},
      {group:'This view',title:'Copy link to this view',sub:location.origin+location.pathname+HSP.hashFor(),go:()=>HSP.copyLink()}]); return; }
  if(kind==='ref'){
    const r=HSP.parseRef(q); const name=refName(r.b,r.c,r.v);
    let sub=r.v?T('open.verseRead'):T('open.chapter');
    const items=[{group:'Go to',title:name,sub,go:()=>HSP.goRef(r)}];
    if(r.v) items.push({group:T('cmdk.groupGo'),title:T('cmdk.inChords',{name}),sub:T('cmdk.xrefVerse'),go:()=>HSP.apply({tab:'conn',b:r.b,c:r.c,v:r.v})});
    palRender(items);
    if(r.v){ try{ const pv=palVer(palEn), dir=pv.ok(BOOK[r.b])?pv.dir:'en'; const en=await getJSON(`${dir}/${r.b}.json.gz`); if(seq!==palSeq) return; const t=(en[String(r.c)]||{})[r.v]; if(t){ items[0].sub=enPlain(t).slice(0,160); palRender(items); } }catch(e){} }
    return;
  }
  if(kind==='strong'){
    const L=q[0].toUpperCase(); palRender([],T('cmdk.lexLoading'));
    try{ await lex(L); }catch(e){ if(seq===palSeq) palRender([],T('cmdk.lexOffline')); return; }
    if(seq!==palSeq) return;
    const lx=LEXF[L], num=L+q.slice(1).replace(/^0+/,'').replace(/[a-z]$/i,'').padStart(4,'0'), suf=(q.match(/[a-z]$/i)||[''])[0].toUpperCase();
    const keys=Object.keys(lx).filter(k=>k.startsWith(num) && !/\d/.test(k.slice(num.length)) && (!suf||k===num+suf)).sort((a,b)=>(lx[b][5]||0)-(lx[a][5]||0));
    palRender(keys.slice(0,8).map(k=>{ const e=lx[k]; return {group:"Strong's",html:`<bdi class="${L==='H'?'cmdk-heb':'cmdk-grk'}">${E(e[0])}</bdi> <i>${E(e[1])}</i> · ${E(e[3])} <span class="cmdk-k">${E(k)}</span>`,sub:T('cmdk.occOpen',{n:e[5]||0}),go:()=>openConcordance(k)}; }), keys.length?'':T('cmdk.noEntry'));
    return;
  }
  if(kind==='heb'||kind==='grk'){
    const L=kind==='heb'?'H':'G'; palRender([],T('cmdk.lexLoading'));
    try{ await lex(L); }catch(e){ if(seq===palSeq) palRender([],T('cmdk.lexOffline')); return; }
    if(seq!==palSeq) return;
    const lx=LEXF[L], n=kind==='heb'?hcons(q):gnorm(q), f=kind==='heb'?hcons:gnorm;
    const hits=[]; for(const [k,e] of Object.entries(lx)){ const m=f(e[0]); if(!m) continue; const s=m===n?0:m.startsWith(n)?1:0; if(m===n||(n.length>=2&&m.startsWith(n))) hits.push([s,-(e[5]||0),k]); }
    hits.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
    const items=hits.slice(0,12).map(([,,k])=>{ const e=lx[k]; return {group:'Lexicon',html:`<bdi class="${L==='H'?'cmdk-heb':'cmdk-grk'}">${E(e[0])}</bdi> <i>${E(e[1])}</i> · ${E(e[3])} <span class="cmdk-k">${E(strongNum(k))}</span>`,sub:`${e[5]||0} occurrences${String(e[2]).startsWith('A:')?' · Aramaic':''} · open in Lexicon & concordance`,go:()=>openConcordance(k)}; });
    // a spelling that is a tagged surface form
    try{ const fm=await morph(kind==='heb'?'hform':'gform'); if(seq!==palSeq) return; const hit=fm[n]||fm['~'+n];
      if(hit) hit.split('|').reverse().forEach(k=>{ const e=lx[k]; if(e && !items.some(x=>x.key===k)) items.unshift({group:'This spelling',key:k,html:`<bdi class="${L==='H'?'cmdk-heb':'cmdk-grk'}">${E(q)}</bdi> → <bdi class="${L==='H'?'cmdk-heb':'cmdk-grk'}">${E(e[0])}</bdi> · ${E(e[3])} <span class="cmdk-k">${E(strongNum(k))}</span>`,sub:T('cmdk.formFound'),go:()=>openConcordance(k)}); }); }catch(e){}
    palRender(items, items.length?'':T('cmdk.noLemma'));
    return;
  }
  // English phrase search across one English version, loaded book by book (and cached for offline)
  if(q.length<3){ palRender([],`Type at least 3 letters to search the ${palVer(palEn).abbr}.`); return; }
  const pv=palVer(palEn), dir=pv.dir, needle=q.toLowerCase().replace(/[“”"]/g,'').replace(/\s+/g,' ').trim();
  const books=BOOKS.filter(b=>bookVisible(b.id) && pv.ok(b)); const items=[]; let done=0, total=0; const MAX=150;
  const strip=t=>enPlain(t).replace(/\s+/g,' ');
  const tick=()=>{ if(seq!==palSeq) return; palRender(items.slice(0,MAX), done<books.length?`Searching ${pv.abbr}… ${done}/${books.length} books · ${total} verse${total===1?'':'s'}`:`${total} verse${total===1?'':'s'} in the ${pv.abbr}${total>MAX?` (first ${MAX} shown)`:''}${total?'':' — try fewer words'}`); };
  palRender([],'Searching…');
  let idx=0;
  async function worker(){ while(idx<books.length){ const b=books[idx++]; let en; try{ en=await getJSON(`${dir}/${b.id}.json.gz`); }catch(e){ done++; continue; } if(seq!==palSeq) return;
    const res=[];
    for(const [c,vs] of Object.entries(en)){ if(c[0]==='_') continue; for(const [v,t] of Object.entries(vs)){ const s=strip(t), p=s.toLowerCase().indexOf(needle); if(p<0) continue;
      if(!verseVisible(b.id,+c,v)) continue; res.push({b:b.id,c:+c,v,s,p}); } }
    res.sort((x,y)=>x.c-y.c||parseInt(x.v)-parseInt(y.v));
    b._res=res; done++; total+=res.length;
    items.length=0; for(const bb of books){ if(bb._res) for(const r of bb._res){ if(items.length>=MAX) break; const a=Math.max(0,r.p-50); const pre=(a?'…':'')+r.s.slice(a,r.p), hit=r.s.slice(r.p,r.p+needle.length), post=r.s.slice(r.p+needle.length,r.p+needle.length+70)+(r.p+needle.length+70<r.s.length?'…':'');
      items.push({group:`${pv.abbr} text`,title:refName(r.b,r.c,r.v),sub:`${E(pre)}<mark>${E(hit)}</mark>${E(post)}`,subHtml:true,go:()=>HSP.goRef({b:r.b,c:r.c,v:r.v})}); } }
    tick(); } }
  await Promise.all(Array.from({length:6},worker));
  books.forEach(b=>delete b._res);
};
HSP.goRef = async function(r){ if(!r.v){ await HSP.apply({tab:'read',b:r.b,c:r.c}); HSP.sync('push'); return; } await HSP.apply({tab:'read',b:r.b,c:r.c,v:r.v}); HSP.sync('push'); };
addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey) && !e.altKey && (e.key==='k'||e.key==='K')){ e.preventDefault(); if(PAL&&!PAL.hidden) HSP.closePalette(); else HSP.openPalette(); return; }
  if(e.key==='Escape' && PAL && !PAL.hidden){ e.preventDefault(); e.stopImmediatePropagation(); HSP.closePalette(); }
}, true);
})();
