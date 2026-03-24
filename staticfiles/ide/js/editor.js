/* ═══════════════════════════════════════════════════
   मराठीकोड IDE — editor.js
   ═══════════════════════════════════════════════════ */
'use strict';

const EXAMPLES = [
  { title:'नमस्कार जग', desc:'पहिला कार्यक्रम', diff:'सोपे',
    code:`dakhava("नमस्कार, जग!")\ndakhava("मराठीकोड मध्ये आपले स्वागत आहे!")` },
  { title:'ghya() Input', desc:'वापरकर्त्याकडून input', diff:'सोपे',
    code:`nav = ghya("तुमचे नाव: ")\ndakhava("नमस्कार,", nav, "!")\nvay = poornanank(ghya("वय: "))\njar vay >= 18:\n    dakhava("तुम्ही प्रौढ आहात!")\nnahitar:\n    dakhava("तुम्ही लहान आहात")` },
  { title:'कॅल्क्युलेटर', desc:'Input घेऊन गणना', diff:'मध्यम',
    code:`a = dasamank(ghya("पहिला आकडा: "))\nb = dasamank(ghya("दुसरा आकडा: "))\ndakhava("बेरीज  :", a + b)\ndakhava("वजाबाकी:", a - b)\ndakhava("गुणाकार:", a * b)\njar b != 0:\n    dakhava("भागाकार:", a / b)\nnahitar:\n    dakhava("शून्याने भाग होत नाही!")` },
  { title:'गुण श्रेणी', desc:'if-elif-else', diff:'मध्यम',
    code:`guni = poornanank(ghya("गुण (0-100): "))\njar guni >= 90:\n    dakhava("A श्रेणी — उत्कृष्ट!")\nnahitar jar guni >= 75:\n    dakhava("B श्रेणी — चांगले!")\nnahitar jar guni >= 60:\n    dakhava("C श्रेणी — ठीक")\nnahitar:\n    dakhava("अभ्यास कर!")` },
  { title:'पाढे', desc:'Input घेऊन पाढा', diff:'सोपे',
    code:`ankada = poornanank(ghya("कोणत्या आकड्याचा पाढा? "))\npratyek i madhe aakda_shreni(1, 11):\n    dakhava(ankada, "×", i, "=", ankada * i)` },
  { title:'while लूप', desc:'जोपर्यंत', diff:'मध्यम',
    code:`i = 1\njaoparyant i <= 5:\n    dakhava("आकडा:", i)\n    i = i + 1\ndakhava("मोजणी पूर्ण!")` },
  { title:'for लूप', desc:'प्रत्येक + यादी', diff:'मध्यम',
    code:`phale = ["आंबा", "केळी", "सफरचंद", "द्राक्षे"]\ndakhava("फळांची यादी:")\npratyek phal madhe phale:\n    dakhava("-", phal)\ndakhava("एकूण:", lambai(phale))` },
  { title:'Function', desc:'कार्य परिभाषित करा', diff:'मध्यम',
    code:`karya gunakara(a, b):\n    parat a * b\n\ndakhava("6 × 7 =", gunakara(6, 7))\ndakhava("5 × 5 =", gunakara(5, 5))` },
  { title:'फिबोनाची', desc:'Recursive function', diff:'कठीण',
    code:`karya fib(n):\n    jar n <= 1:\n        parat n\n    parat fib(n-1) + fib(n-2)\n\npratyek i madhe aakda_shreni(0, 10):\n    dakhava(fib(i))` },
  { title:'Class / वर्ग', desc:'Object-oriented', diff:'कठीण',
    code:`varg Vidyarthi:\n    karya suruvat(swatah, nav, guni):\n        swatah.nav = nav\n        swatah.guni = guni\n    karya mahiti(swatah):\n        dakhava("नाव:", swatah.nav)\n        dakhava("गुण:", swatah.guni)\n\nv = Vidyarthi("राहुल", 85)\nv.mahiti()` },
  { title:'यादी क्रियाकलाप', desc:'List methods', diff:'मध्यम',
    code:`ankadi = [5, 2, 8, 1, 9, 3]\ndakhava("मूळ:", ankadi)\nankadi.joda(7)\nankadi.sort()\ndakhava("क्रमाने:", ankadi)\ndakhava("एकूण:", lambai(ankadi))` },
  { title:'break / continue', desc:'थांब आणि पुढे', diff:'मध्यम',
    code:`dakhava("सम आकडे (1-10):")\npratyek i madhe aakda_shreni(1, 11):\n    jar i % 2 != 0:\n        pudhe\n    dakhava(i)` },
];

const ICONS = {
  default: `<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
};

const $ = id => document.getElementById(id);

const editor          = $('codeEditor');
const gutter          = $('gutter');
const runBtn          = $('runBtn');
const runBtnMobile    = $('runBtnMobile');
const outputBody      = $('outputBody');
const statusDot       = $('statusDot');
const statusText      = $('statusText');
const cursorPos       = $('cursorPos');
const lineCountEl     = $('lineCount');
const loadingOvl      = $('loadingOverlay');
const inlineRow       = $('inlineInputRow');
const inlineBox       = $('inlineInputBox');
const inlineSend      = $('inlineInputSend');
const inlinePromptEl  = $('inlineInputPrompt');
const examplesGrid    = $('examplesGrid');
const highlightLayer  = $('highlightLayer');
const sidePanel       = $('sidePanel');
const sidebarOverlay  = $('sidebarOverlay');

let fontSize = 13;

// ═══════════════════════════════════════════════════
//  PANEL SWITCHING — shared by desktop act-btns AND
//  the mobile nav strip inside the drawer
// ═══════════════════════════════════════════════════
function switchPanel(panelName) {
  // Update all desktop act-btns
  document.querySelectorAll('.act-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.panel === panelName);
  });
  // Update all mobile nav strip buttons
  document.querySelectorAll('.mnav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.panel === panelName);
  });
  // Show the correct panel view
  document.querySelectorAll('.panel-view').forEach(p => p.classList.remove('active'));
  const target = $('panel-' + panelName);
  if (target) target.classList.add('active');
}

// Desktop activity bar
document.querySelectorAll('.act-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.dataset.panel;
    const wasActive = btn.classList.contains('active');
    if (wasActive) {
      // clicking active panel collapses it
      switchPanel('__none__');
    } else {
      switchPanel(panel);
    }
  });
});

// Mobile nav strip — same logic, but also close drawer after navigating to a
// panel that shows content (examples/docs close, others stay open)
document.querySelectorAll('.mnav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    switchPanel(btn.dataset.panel);
  });
});

// ═══════════════════════════════════════════════════
//  MOBILE SIDEBAR DRAWER
// ═══════════════════════════════════════════════════
function openSidebar() {
  sidePanel.classList.add('mobile-open');
  sidebarOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidePanel.classList.remove('mobile-open');
  sidebarOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

$('mobileMenuBtn').addEventListener('click', openSidebar);
$('mobileMenuBtn2').addEventListener('click', openSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

// Close after picking an example or file on mobile
document.addEventListener('click', e => {
  if (window.innerWidth > 680) return;
  if (e.target.closest('.ex-item') || e.target.closest('.file-item')) {
    setTimeout(closeSidebar, 120);
  }
});

// ═══════════════════════════════════════════════════
//  CUSTOM MODAL
// ═══════════════════════════════════════════════════
const modalOverlay   = $('mcModalOverlay');
const modalEl        = $('mcModal');
const modalIcon      = $('mcModalIcon');
const modalTitle     = $('mcModalTitle');
const modalMsg       = $('mcModalMessage');
const modalFooter    = $('mcModalFooter');
const modalInputWrap = $('mcModalInputWrap');
const modalInput     = $('mcModalInput');

const MODAL_ICONS = {
  alert:   `<svg viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  confirm: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  prompt:  `<svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  error:   `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
};
let _mkh = null, _bdh = null;

function _openModal(type, title, message, hasInput, defaultVal) {
  return new Promise(resolve => {
    modalEl.className = `mc-modal mc-modal--${type}`;
    modalIcon.innerHTML = MODAL_ICONS[type] || MODAL_ICONS.alert;
    modalTitle.textContent = title;
    modalMsg.textContent   = message;
    modalInputWrap.style.display = hasInput ? '' : 'none';
    if (hasInput) { modalInput.value = defaultVal || ''; setTimeout(() => modalInput.focus(), 80); }
    modalFooter.innerHTML = '';
    const done = val => { _closeModal(); resolve(val); };
    const mkb  = (cls, lbl) => { const b = document.createElement('button'); b.className = cls; b.textContent = lbl; return b; };

    if (type === 'confirm') {
      const c = mkb('mc-btn mc-btn-cancel','रद्द करा'), o = mkb('mc-btn mc-btn-ok-confirm','होय');
      c.onclick = () => done(false); o.onclick = () => done(true);
      modalFooter.append(c, o);
      _mkh = e => { if(e.key==='Escape') done(false); if(e.key==='Enter'&&!hasInput) done(true); };
    } else if (type === 'prompt') {
      const c = mkb('mc-btn mc-btn-cancel','रद्द करा'), o = mkb('mc-btn mc-btn-ok-prompt','ठीक आहे');
      c.onclick = () => done(null); o.onclick = () => done(modalInput.value);
      modalInput.addEventListener('keydown', e => {
        if (e.key==='Enter') { e.preventDefault(); done(modalInput.value); }
        if (e.key==='Escape'){ e.preventDefault(); done(null); }
      });
      modalFooter.append(c, o);
      _mkh = e => { if(e.key==='Escape') done(null); };
    } else {
      const btnCls = type==='error' ? 'mc-btn mc-btn-ok-error' : 'mc-btn mc-btn-ok-alert';
      const o = mkb(btnCls,'ठीक आहे');
      o.onclick = () => done(undefined);
      modalFooter.append(o);
      _mkh = e => { if(e.key==='Enter'||e.key==='Escape') done(undefined); };
      setTimeout(() => o.focus(), 80);
    }
    if (type==='alert'||type==='error') {
      _bdh = e => { if(e.target===modalOverlay) done(undefined); };
      modalOverlay.addEventListener('click', _bdh);
    }
    document.addEventListener('keydown', _mkh);
    modalOverlay.classList.add('open');
  });
}
function _closeModal() {
  modalOverlay.classList.remove('open');
  if (_mkh) { document.removeEventListener('keydown', _mkh); _mkh = null; }
  if (_bdh) { modalOverlay.removeEventListener('click', _bdh); _bdh = null; }
}
const mcAlert   = (m, t='सूचना')        => _openModal('alert',   t, m, false);
const mcConfirm = (m, t='खात्री करा')   => _openModal('confirm', t, m, false);
const mcPrompt  = (m, d='', t='माहिती द्या') => _openModal('prompt', t, m, true, d);
const mcError   = (m, t='चूक')          => _openModal('error',   t, m, false);

// ═══════════════════════════════════════════════════
//  SYNTAX HIGHLIGHTING
// ═══════════════════════════════════════════════════
const KW_FLOW  = ['nahitar jar','jaoparyant','pratyek','nahitar','thamba','pudhe','jaude','madhe','jar'];
const KW_FN    = ['karya','parat','varg','suruvat'];
const KW_BOOL  = ['khare','khote','shunya','aani','kiva','nahi'];
const KW_SELF  = ['swatah'];
const BUILTINS = ['poornanank','dasamank','akshar','lambai','aakda_shreni','dakhava','ghya'];

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function highlightLine(raw) {
  let i=0, out='';
  const len = raw.length;
  while (i < len) {
    const ch = raw[i];
    if (ch==='#') { out+=`<span class="hl-cmt">${esc(raw.slice(i))}</span>`; return out; }
    if (ch==='"'||ch==="'") {
      const q=ch; let j=i+1;
      while(j<len){if(raw[j]==='\\'){j+=2;continue}if(raw[j]===q){j++;break}j++;}
      out+=`<span class="hl-str">${esc(raw.slice(i,j))}</span>`; i=j; continue;
    }
    if(/\d/.test(ch)&&(i===0||/[^a-zA-Z0-9_\u0900-\u097F]/.test(raw[i-1]))){
      let j=i; while(j<len&&/[\d._]/.test(raw[j]))j++;
      if(j===len||/[^a-zA-Z_\u0900-\u097F]/.test(raw[j])){out+=`<span class="hl-num">${esc(raw.slice(i,j))}</span>`;i=j;continue;}
    }
    if(/[a-zA-Z_\u0900-\u097F]/.test(ch)){
      let j=i; while(j<len&&/[a-zA-Z0-9_\u0900-\u097F]/.test(raw[j]))j++;
      const word=raw.slice(i,j);
      if(word==='nahitar'){const m=raw.slice(j).match(/^(\s+jar)\b/);if(m){out+=`<span class="hl-kw">${esc(word+m[1])}</span>`;i=j+m[1].length;continue;}}
      const cls=KW_FLOW.includes(word)?'hl-kw':KW_FN.includes(word)?'hl-fn':KW_BOOL.includes(word)?'hl-bool':KW_SELF.includes(word)?'hl-self':BUILTINS.includes(word)?'hl-builtin':null;
      if(cls) out+=`<span class="${cls}">${esc(word)}</span>`;
      else if(/^[A-Z][a-zA-Z0-9_]+$/.test(word)) out+=`<span class="hl-class">${esc(word)}</span>`;
      else out+=esc(word);
      i=j; continue;
    }
    if(/[+\-*\/%=<>!&|^~]/.test(ch)){
      let j=i; while(j<len&&/[+\-*\/%=<>!&|^~]/.test(raw[j]))j++;
      out+=`<span class="hl-op">${esc(raw.slice(i,j))}</span>`; i=j; continue;
    }
    if(/[()[\]{},.:;@]/.test(ch)){out+=`<span class="hl-paren">${esc(ch)}</span>`;i++;continue;}
    out+=esc(ch); i++;
  }
  return out;
}

function updateHighlight() {
  highlightLayer.innerHTML = editor.value.split('\n').map(highlightLine).join('\n') + '\n';
  syncHighlightScroll();
}

// ── SCROLL SYNC ───────────────────────────────────
// Textarea scrolls itself (overflow:auto, height:100%).
// We just mirror its scrollTop/Left to the highlight pre.
// The gutter also mirrors scrollTop.
function syncHighlightScroll() {
  highlightLayer.scrollTop  = editor.scrollTop;
  highlightLayer.scrollLeft = editor.scrollLeft;
  gutter.scrollTop          = editor.scrollTop;
}
editor.addEventListener('scroll', syncHighlightScroll);

// ── GUTTER + CURSOR ───────────────────────────────
function updateGutter() {
  const n = editor.value.split('\n').length;
  gutter.textContent = Array.from({length: n}, (_,i) => i+1).join('\n');
  lineCountEl.textContent = `${n} ओळी`;
}
function updateCursor() {
  const lines = editor.value.slice(0, editor.selectionStart).split('\n');
  cursorPos.textContent = `ओळ ${lines.length}, स्तंभ ${lines[lines.length-1].length+1}`;
}

editor.addEventListener('input', () => { updateGutter(); updateCursor(); updateHighlight(); });
editor.addEventListener('click',  updateCursor);
editor.addEventListener('keyup',  updateCursor);

editor.addEventListener('keydown', e => {
  if (e.key==='Tab') {
    e.preventDefault();
    const s=editor.selectionStart, end=editor.selectionEnd;
    editor.value=editor.value.slice(0,s)+'    '+editor.value.slice(end);
    editor.selectionStart=editor.selectionEnd=s+4;
    updateGutter(); updateHighlight();
  }
  if ((e.ctrlKey||e.metaKey)&&e.key==='Enter') { e.preventDefault(); startRun(); }
  const pairs={'(':')','{':'}','[':']','"':'"',"'":"'"};
  if (pairs[e.key]) {
    e.preventDefault();
    const s=editor.selectionStart;
    editor.value=editor.value.slice(0,s)+e.key+pairs[e.key]+editor.value.slice(editor.selectionEnd);
    editor.selectionStart=editor.selectionEnd=s+1;
    updateGutter(); updateHighlight();
  }
});

function applyFontSize(px) {
  const p = px+'px';
  editor.style.fontSize         = p;
  highlightLayer.style.fontSize = p;
  gutter.style.fontSize         = p;
  $('fsValue').textContent       = p;
}

// ── OUTPUT ───────────────────────────────────────
function clearOutput() { outputBody.innerHTML=''; }
function showWelcome() {
  outputBody.innerHTML=`<div class="output-welcome"><svg viewBox="0 0 24 24" fill="none" class="welcome-icon-svg"><path d="M4 17l6-6-6-6M12 19h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><p>कोड लिहा आणि <strong>चालवा</strong> दाबा &nbsp;<kbd>⌘↵</kbd></p></div>`;
}
function addLine(text, cls='') {
  const d=document.createElement('div');
  d.className='output-line'+(cls?' '+cls:'');
  d.textContent=text;
  outputBody.appendChild(d);
  outputBody.scrollTop=outputBody.scrollHeight;
}
function setStatus(state, msg) {
  statusDot.className='status-dot'+(state?' '+state:'');
  statusText.textContent=msg;
}

// ── INLINE INPUT ──────────────────────────────────
let _code='',_collected=[],_remaining=[];
function showInlineInput(prompt) { inlinePromptEl.textContent=prompt||'> '; inlineBox.value=''; inlineRow.style.display='flex'; inlineBox.focus(); }
function hideInlineInput() { inlineRow.style.display='none'; inlineBox.value=''; }
function submitInput() {
  const val=inlineBox.value; hideInlineInput();
  addLine((inlinePromptEl.textContent||'> ')+val,'echo');
  _collected.push(val);
  if(_remaining.length>0) showInlineInput(_remaining.shift());
  else executeCode(_code,_collected);
}
inlineSend.addEventListener('click', submitInput);
inlineBox.addEventListener('keydown', e=>{ if(e.key==='Enter'){e.preventDefault();submitInput();} });

// ── RUN ──────────────────────────────────────────
function setRunning(on) { [runBtn,runBtnMobile].forEach(b=>{if(b)b.disabled=on;}); }

function startRun() {
  const code=editor.value.trim();
  if(!code){clearOutput();addLine('कोड लिहा आणि मग चालवा!','err');return;}
  _code=code;_collected=[];_remaining=[];
  clearOutput(); setStatus('running','चालवत आहे…'); setRunning(true);
  fetch('/run/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})})
    .then(r=>r.json())
    .then(data=>{
      setRunning(false);
      if(data.needs_input&&data.input_prompts?.length){
        setStatus('','Input अपेक्षित…');
        _remaining=[...data.input_prompts];
        showInlineInput(_remaining.shift());
      } else displayResult(data);
    })
    .catch(err=>{setRunning(false);addLine('सर्व्हर चूक: '+err.message,'err');setStatus('error','चूक');});
}
async function executeCode(code,inputs) {
  loadingOvl.classList.add('visible'); setRunning(true); setStatus('running','चालवत आहे…');
  try {
    const r=await fetch('/run/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,inputs})});
    displayResult(await r.json());
  } catch(err){addLine('सर्व्हर चूक: '+err.message,'err');setStatus('error','चूक');}
  finally{loadingOvl.classList.remove('visible');setRunning(false);}
}
function displayResult(data) {
  if(data.output&&data.output!=='(कोणताही output नाही)') data.output.split('\n').forEach(l=>addLine(l));
  if(data.error){addLine('चूक: '+data.error,'err');setStatus('error','चूक');}
  if(data.success&&!data.error){if(!data.output||data.output==='(कोणताही output नाही)')addLine('(output नाही)');addLine('✓ यशस्वीरीत्या चालले','ok');setStatus('success','यशस्वी');}
  else if(!data.needs_input&&!data.error)setStatus('error','चूक');
}
if(runBtn)       runBtn.addEventListener('click',startRun);
if(runBtnMobile) runBtnMobile.addEventListener('click',startRun);

// ── OUTPUT TABS ───────────────────────────────────
document.querySelectorAll('.out-tab').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.out-tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.out-view').forEach(x=>x.classList.remove('active'));
    t.classList.add('active'); $('out-'+t.dataset.out).classList.add('active');
  });
});

// ── THEMES ───────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme',theme);
  document.querySelectorAll('.theme-tile').forEach(t=>t.classList.toggle('active',t.dataset.theme===theme));
  const icon=$('themeIcon');
  icon.innerHTML=theme==='light'
    ?`<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`
    :`<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  localStorage.setItem('mc-theme',theme);
}
document.querySelectorAll('.theme-tile').forEach(t=>t.addEventListener('click',()=>applyTheme(t.dataset.theme)));
$('themeToggleBtn').addEventListener('click',()=>{
  applyTheme(document.documentElement.getAttribute('data-theme')==='light'?'dark':'light');
});
const THEME_CYCLE=['dark','light','saffron','midnight'];
$('themeMobileBtn').addEventListener('click',()=>{
  const cur=document.documentElement.getAttribute('data-theme')||'dark';
  applyTheme(THEME_CYCLE[(THEME_CYCLE.indexOf(cur)+1)%THEME_CYCLE.length]);
});
const savedTheme=localStorage.getItem('mc-theme');
if(savedTheme) applyTheme(savedTheme);

// ── FONT SIZE ─────────────────────────────────────
$('fsMinus').addEventListener('click',()=>{if(fontSize>10){fontSize--;applyFontSize(fontSize);updateGutter();}});
$('fsPlus').addEventListener('click', ()=>{if(fontSize<20){fontSize++;applyFontSize(fontSize);updateGutter();}});

// ── RESIZE OUTPUT PANE (mouse + touch) ───────────
const outputDrag=  $('outputDrag');
const outputPane=  document.querySelector('.output-pane');
let dragY=0, dragH=0;
function startOutputDrag(y){dragY=y;dragH=outputPane.offsetHeight;outputDrag.classList.add('dragging');}
function doOutputDrag(y){
  const h=Math.max(44,Math.min(window.innerHeight*.7,dragH+(dragY-y)));
  outputPane.style.height=h+'px';
}
outputDrag.addEventListener('mousedown', e=>{
  startOutputDrag(e.clientY);
  const mu=()=>{outputDrag.classList.remove('dragging');document.removeEventListener('mousemove',mm);};
  const mm=e=>doOutputDrag(e.clientY);
  document.addEventListener('mousemove',mm);
  document.addEventListener('mouseup',mu,{once:true});
});
outputDrag.addEventListener('touchstart',e=>{
  startOutputDrag(e.touches[0].clientY);
  const tu=()=>{outputDrag.classList.remove('dragging');document.removeEventListener('touchmove',tm);};
  const tm=e=>{e.preventDefault();doOutputDrag(e.touches[0].clientY);};
  document.addEventListener('touchmove',tm,{passive:false});
  document.addEventListener('touchend',tu,{once:true});
},{passive:true});

// ── RESIZE SIDE PANEL ────────────────────────────
const resizeHandle=$('resizeHandle');
let rpX=0,rpW=0;
resizeHandle.addEventListener('mousedown',e=>{
  rpX=e.clientX;rpW=sidePanel.offsetWidth;
  resizeHandle.classList.add('dragging');
  const mm=e=>{sidePanel.style.width=Math.max(160,Math.min(400,rpW+(e.clientX-rpX)))+'px';};
  document.addEventListener('mousemove',mm);
  document.addEventListener('mouseup',()=>{resizeHandle.classList.remove('dragging');document.removeEventListener('mousemove',mm);},{once:true});
});

// ── SIDEBAR BUTTONS ───────────────────────────────
$('clearBtn').addEventListener('click',async()=>{
  if(!await mcConfirm('कोड साफ करायचा आहे का?','कोड साफ करा'))return;
  editor.value='';updateGutter();updateHighlight();showWelcome();setStatus('','तयार');
});
$('copyBtn').addEventListener('click',()=>{
  navigator.clipboard.writeText(editor.value).then(()=>{setStatus('success','कॉपी केले!');setTimeout(()=>setStatus('','तयार'),2000);});
});
$('formatBtn').addEventListener('click',()=>{
  editor.value=editor.value.split('\n').map(l=>l.replace(/\s+$/,'')).join('\n');
  updateGutter();updateHighlight();setStatus('success','फॉर्मॅट केले!');setTimeout(()=>setStatus('','तयार'),2000);
});
$('clearOutputBtn').addEventListener('click',()=>{hideInlineInput();showWelcome();setStatus('','तयार');});
$('clearOutputMobileBtn').addEventListener('click',()=>{hideInlineInput();showWelcome();setStatus('','तयार');});
$('copyOutputBtn').addEventListener('click',()=>{
  const txt=[...outputBody.querySelectorAll('.output-line')].map(d=>d.textContent).join('\n');
  navigator.clipboard.writeText(txt).then(()=>{setStatus('success','Output कॉपी केले!');setTimeout(()=>setStatus('','तयार'),2000);});
});

$('searchBtn').addEventListener('click',()=>{
  const q=$('searchInput').value;if(!q)return;
  const idx=editor.value.indexOf(q);
  if(idx===-1){$('searchResults').textContent='सापडले नाही';return;}
  editor.focus();editor.setSelectionRange(idx,idx+q.length);
  $('searchResults').textContent=`${editor.value.split(q).length-1} ठिकाणी सापडले`;
});
$('replaceBtn').addEventListener('click',()=>{
  const q=$('searchInput').value,r=$('replaceInput').value;
  if(!q)return;
  editor.value=editor.value.split(q).join(r);
  updateGutter();updateHighlight();
});

// ── FILES ─────────────────────────────────────────
const files={main:editor.value};
let currentFile='main';

$('newFileBtn').addEventListener('click',async()=>{
  const name=await mcPrompt('नवीन फाईलचे नाव:','','नवीन फाईल');
  if(!name)return;
  const fname=name.replace(/[^a-zA-Z0-9_]/g,'')||'untitled';
  files[fname]=`# ${fname}.mc\n`;
  addFileTab(fname);addFileItem(fname);switchFile(fname);
});
function addFileTab(name){
  const t=document.createElement('div');t.className='editor-tab';t.dataset.file=name;
  t.innerHTML=`<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M14 2v6h6" stroke="currentColor" stroke-width="1.5"/></svg><span>${name}.mc</span><button class="tab-close" data-file="${name}"><svg viewBox="0 0 24 24" fill="none"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>`;
  $('editorTabs').appendChild(t);
  t.addEventListener('click',e=>{if(!e.target.closest('.tab-close'))switchFile(name);});
  t.querySelector('.tab-close').addEventListener('click',e=>{e.stopPropagation();closeFile(name);});
}
function addFileItem(name){
  const i=document.createElement('div');i.className='file-item';i.dataset.file=name;
  i.innerHTML=`<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 2v6h6M10 13h4M10 17h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span>${name}.mc</span><span class="file-lang-tag">MC</span>`;
  i.addEventListener('click',()=>switchFile(name));
  $('fileList').appendChild(i);
}
function switchFile(name){
  files[currentFile]=editor.value;currentFile=name;
  editor.value=files[name]||'';updateGutter();updateHighlight();
  document.querySelectorAll('.editor-tab').forEach(t=>t.classList.toggle('active',t.dataset.file===name));
  document.querySelectorAll('.file-item').forEach(t=>t.classList.toggle('active',t.dataset.file===name));
  $('bcFile').textContent=name+'.mc';
}
function closeFile(name){
  if(name==='main')return;
  delete files[name];
  document.querySelector(`.editor-tab[data-file="${name}"]`)?.remove();
  document.querySelector(`.file-item[data-file="${name}"]`)?.remove();
  if(currentFile===name)switchFile('main');
}
$('fileList').addEventListener('click',e=>{const i=e.target.closest('.file-item');if(i)switchFile(i.dataset.file);});
document.querySelectorAll('.editor-tab').forEach(t=>{
  t.addEventListener('click',e=>{if(!e.target.closest('.tab-close'))switchFile(t.dataset.file);});
});
document.querySelectorAll('.tab-close').forEach(b=>{
  b.addEventListener('click',e=>{e.stopPropagation();closeFile(b.dataset.file);});
});

// ── EXAMPLES ─────────────────────────────────────
EXAMPLES.forEach(ex=>{
  const item=document.createElement('div');item.className='ex-item';
  item.innerHTML=`<div class="ex-item-icon"><svg viewBox="0 0 24 24" fill="none">${ICONS.default}</svg></div><div class="ex-item-body"><div class="ex-item-title">${ex.title}</div><div class="ex-item-desc">${ex.desc}</div></div><span class="ex-badge">${ex.diff}</span>`;
  item.addEventListener('click',()=>{
    editor.value=ex.code;updateGutter();updateHighlight();
    switchPanel('explorer');
    setStatus('success',`"${ex.title}" लोड केले`);setTimeout(()=>setStatus('','तयार'),2000);
    editor.focus();
  });
  examplesGrid.appendChild(item);
});

// ── INIT ─────────────────────────────────────────
updateGutter();
updateCursor();
updateHighlight();