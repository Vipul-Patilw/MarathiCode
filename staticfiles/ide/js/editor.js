/* ═══════════════════════════════════════════════════
   मराठीकोड IDE — editor.js
   ═══════════════════════════════════════════════════ */
'use strict';

// ── EXAMPLES ─────────────────────────────────────
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

// ── DOM ───────────────────────────────────────────
const $ = id => document.getElementById(id);
const editor         = $('codeEditor');
const gutter         = $('gutter');
const runBtn         = $('runBtn');
const outputBody     = $('outputBody');
const statusDot      = $('statusDot');
const statusText     = $('statusText');
const cursorPos      = $('cursorPos');
const lineCountEl    = $('lineCount');
const loadingOvl     = $('loadingOverlay');
const inlineRow      = $('inlineInputRow');
const inlineBox      = $('inlineInputBox');
const inlineSend     = $('inlineInputSend');
const inlinePromptEl = $('inlineInputPrompt');
const examplesGrid   = $('examplesGrid');
const sbErrors       = $('sbErrors');
const highlightLayer = $('highlightLayer');
const codeWrap       = $('codeWrap');

let fontSize = 13;

// ═══════════════════════════════════════════════════
//  CUSTOM MODAL SYSTEM (replaces alert / confirm / prompt)
// ═══════════════════════════════════════════════════

const modalOverlay = $('mcModalOverlay');
const modalEl      = $('mcModal');
const modalIcon    = $('mcModalIcon');
const modalTitle   = $('mcModalTitle');
const modalMsg     = $('mcModalMessage');
const modalFooter  = $('mcModalFooter');
const modalInputWrap = $('mcModalInputWrap');
const modalInput   = $('mcModalInput');

// SVG icons for each modal type
const MODAL_ICONS = {
  alert: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  confirm: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  prompt: `<svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  error: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
};

function _openModal(type, title, message, hasInput, defaultVal) {
  return new Promise(resolve => {
    // Set type class on modal
    modalEl.className = `mc-modal mc-modal--${type}`;

    // Icon
    modalIcon.innerHTML = MODAL_ICONS[type] || MODAL_ICONS.alert;

    // Title & message
    modalTitle.textContent = title;
    modalMsg.textContent   = message;

    // Input field
    if (hasInput) {
      modalInputWrap.style.display = '';
      modalInput.value = defaultVal || '';
      setTimeout(() => modalInput.focus(), 80);
    } else {
      modalInputWrap.style.display = 'none';
    }

    // Buttons
    modalFooter.innerHTML = '';

    if (type === 'confirm') {
      const cancelBtn = _makeBtn('mc-btn mc-btn-cancel', 'रद्द करा');
      const okBtn     = _makeBtn('mc-btn mc-btn-ok-confirm', 'होय');
      cancelBtn.addEventListener('click', () => { _closeModal(); resolve(false); });
      okBtn.addEventListener('click',     () => { _closeModal(); resolve(true); });
      modalFooter.appendChild(cancelBtn);
      modalFooter.appendChild(okBtn);
      // Keyboard: Escape = cancel, Enter = confirm
      _modalKeyHandler = e => {
        if (e.key === 'Escape') { _closeModal(); resolve(false); }
        if (e.key === 'Enter' && !hasInput) { _closeModal(); resolve(true); }
      };
    } else if (type === 'prompt') {
      const cancelBtn = _makeBtn('mc-btn mc-btn-cancel', 'रद्द करा');
      const okBtn     = _makeBtn('mc-btn mc-btn-ok-prompt', 'ठीक आहे');
      cancelBtn.addEventListener('click', () => { _closeModal(); resolve(null); });
      okBtn.addEventListener('click',     () => { _closeModal(); resolve(modalInput.value); });
      modalInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); _closeModal(); resolve(modalInput.value); }
        if (e.key === 'Escape') { e.preventDefault(); _closeModal(); resolve(null); }
      });
      modalFooter.appendChild(cancelBtn);
      modalFooter.appendChild(okBtn);
      _modalKeyHandler = e => {
        if (e.key === 'Escape') { _closeModal(); resolve(null); }
      };
    } else {
      // alert / error — single OK button
      const btnCls = type === 'error' ? 'mc-btn mc-btn-ok-alert' : 'mc-btn mc-btn-ok-alert';
      const okBtn = _makeBtn(btnCls, 'ठीक आहे');
      okBtn.style.background = type === 'error' ? 'var(--c-red)' : '';
      okBtn.addEventListener('click', () => { _closeModal(); resolve(undefined); });
      modalFooter.appendChild(okBtn);
      _modalKeyHandler = e => {
        if (e.key === 'Enter' || e.key === 'Escape') { _closeModal(); resolve(undefined); }
      };
      setTimeout(() => okBtn.focus(), 80);
    }

    // Backdrop click closes (for alert only, not confirm/prompt)
    if (type === 'alert' || type === 'error') {
      _backdropHandler = e => { if (e.target === modalOverlay) { _closeModal(); resolve(undefined); } };
      modalOverlay.addEventListener('click', _backdropHandler);
    }

    document.addEventListener('keydown', _modalKeyHandler);
    modalOverlay.classList.add('open');
  });
}

let _modalKeyHandler  = null;
let _backdropHandler  = null;

function _closeModal() {
  modalOverlay.classList.remove('open');
  if (_modalKeyHandler) { document.removeEventListener('keydown', _modalKeyHandler); _modalKeyHandler = null; }
  if (_backdropHandler) { modalOverlay.removeEventListener('click', _backdropHandler); _backdropHandler = null; }
}

function _makeBtn(cls, label) {
  const b = document.createElement('button');
  b.className = cls; b.textContent = label;
  return b;
}

// Public API — drop-in replacements
function mcAlert(message, title = 'सूचना') {
  return _openModal('alert', title, message, false);
}
function mcConfirm(message, title = 'खात्री करा') {
  return _openModal('confirm', title, message, false);
}
function mcPrompt(message, defaultVal = '', title = 'माहिती द्या') {
  return _openModal('prompt', title, message, true, defaultVal);
}
function mcError(message, title = 'चूक') {
  return _openModal('error', title, message, false);
}

// ═══════════════════════════════════════════════════
//  SYNTAX HIGHLIGHTING
// ═══════════════════════════════════════════════════

// Token definitions — order matters: longer/more-specific first
const KW_FLOW    = ['nahitar jar','jaoparyant','pratyek','nahitar','thamba','pudhe','jaude','madhe','jar'];
const KW_FN      = ['karya','parat','varg','suruvat'];
const KW_BOOL    = ['khare','khote','shunya','aani','kiva','nahi'];
const KW_SELF    = ['swatah'];
const BUILTINS   = ['poornanank','dasamank','akshar','lambai','aakda_shreni','dakhava','ghya'];

// Build a regex that matches any of the keywords as whole words
function _kwRe(list) {
  return new RegExp(`\\b(${list.map(k => k.replace(/ /g,'\\s+')).join('|')})\\b`, 'g');
}

function escHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlightLine(raw) {
  let i = 0;
  let out = '';
  const len = raw.length;

  while (i < len) {
    const ch = raw[i];

    // ── Comment: # ... rest of line ───────────────
    if (ch === '#') {
      out += `<span class="hl-cmt">${escHtml(raw.slice(i))}</span>`;
      return out;
    }

    // ── String: "..." or '...' ────────────────────
    if (ch === '"' || ch === "'") {
      const q = ch;
      let j = i + 1;
      while (j < len) {
        if (raw[j] === '\\') { j += 2; continue; }
        if (raw[j] === q)    { j++; break; }
        j++;
      }
      out += `<span class="hl-str">${escHtml(raw.slice(i, j))}</span>`;
      i = j;
      continue;
    }

    // ── Number ────────────────────────────────────
    if (/\d/.test(ch) && (i === 0 || /[^a-zA-Z0-9_\u0900-\u097F]/.test(raw[i - 1]))) {
      let j = i;
      while (j < len && /[\d._]/.test(raw[j])) j++;
      // only if not followed by identifier char
      if (j === len || /[^a-zA-Z_\u0900-\u097F]/.test(raw[j])) {
        out += `<span class="hl-num">${escHtml(raw.slice(i, j))}</span>`;
        i = j; continue;
      }
    }

    // ── Identifier / keyword ──────────────────────
    if (/[a-zA-Z_\u0900-\u097F]/.test(ch)) {
      let j = i;
      while (j < len && /[a-zA-Z0-9_\u0900-\u097F]/.test(raw[j])) j++;
      const word = raw.slice(i, j);

      // Check multi-word "nahitar jar" lookahead
      if (word === 'nahitar') {
        const rest = raw.slice(j);
        const m = rest.match(/^(\s+jar)\b/);
        if (m) {
          out += `<span class="hl-kw">${escHtml(word + m[1])}</span>`;
          i = j + m[1].length; continue;
        }
      }

      const cls = _wordClass(word);
      if (cls) {
        out += `<span class="${cls}">${escHtml(word)}</span>`;
      } else {
        // Check if it looks like a class name (CamelCase)
        if (/^[A-Z][a-zA-Z0-9_]+$/.test(word)) {
          out += `<span class="hl-class">${escHtml(word)}</span>`;
        } else {
          out += escHtml(word);
        }
      }
      i = j; continue;
    }

    // ── Operators ─────────────────────────────────
    if (/[+\-*\/%=<>!&|^~]/.test(ch)) {
      let j = i;
      while (j < len && /[+\-*\/%=<>!&|^~]/.test(raw[j])) j++;
      out += `<span class="hl-op">${escHtml(raw.slice(i, j))}</span>`;
      i = j; continue;
    }

    // ── Brackets / punctuation ────────────────────
    if (/[()[\]{},.:;@]/.test(ch)) {
      out += `<span class="hl-paren">${escHtml(ch)}</span>`;
      i++; continue;
    }

    // Fallthrough
    out += escHtml(ch);
    i++;
  }
  return out;
}

function _wordClass(word) {
  if (KW_FLOW.includes(word))  return 'hl-kw';
  if (KW_FN.includes(word))    return 'hl-fn';
  if (KW_BOOL.includes(word))  return 'hl-bool';
  if (KW_SELF.includes(word))  return 'hl-self';
  if (BUILTINS.includes(word)) return 'hl-builtin';
  return null;
}

function buildHighlight(code) {
  return code.split('\n').map(highlightLine).join('\n');
}

function updateHighlight() {
  // Keep a trailing newline so the last line always has correct height
  highlightLayer.innerHTML = buildHighlight(editor.value) + '\n';
  // Sync scroll offset
  highlightLayer.style.transform =
    `translate(-${codeWrap.scrollLeft}px, -${codeWrap.scrollTop}px)`;
}

// ── GUTTER + CURSOR ───────────────────────────────
function updateGutter() {
  const n = editor.value.split('\n').length;
  gutter.textContent = Array.from({length: n}, (_, i) => i + 1).join('\n');
  lineCountEl.textContent = `${n} ओळी`;
}
function updateCursor() {
  const lines = editor.value.slice(0, editor.selectionStart).split('\n');
  cursorPos.textContent = `ओळ ${lines.length}, स्तंभ ${lines[lines.length - 1].length + 1}`;
}
function syncScroll() {
  gutter.scrollTop = codeWrap.scrollTop;
  updateHighlight();
}

editor.addEventListener('input', () => {
  updateGutter();
  updateCursor();
  updateHighlight();
});
editor.addEventListener('click',  updateCursor);
editor.addEventListener('keyup',  updateCursor);
codeWrap.addEventListener('scroll', syncScroll);

editor.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const s = editor.selectionStart, end = editor.selectionEnd;
    editor.value = editor.value.slice(0, s) + '    ' + editor.value.slice(end);
    editor.selectionStart = editor.selectionEnd = s + 4;
    updateGutter(); updateHighlight();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault(); startRun();
  }
  const pairs = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'" };
  if (pairs[e.key]) {
    e.preventDefault();
    const s = editor.selectionStart;
    editor.value = editor.value.slice(0, s) + e.key + pairs[e.key] + editor.value.slice(editor.selectionEnd);
    editor.selectionStart = editor.selectionEnd = s + 1;
    updateGutter(); updateHighlight();
  }
});

// ── FONT SIZE (keep highlight layer in sync) ──────
function applyFontSize(px) {
  editor.style.fontSize         = px + 'px';
  highlightLayer.style.fontSize = px + 'px';
  gutter.style.fontSize         = px + 'px';
  $('fsValue').textContent      = px + 'px';
}

// ── OUTPUT HELPERS ────────────────────────────────
function clearOutput() { outputBody.innerHTML = ''; }
function showWelcome() {
  outputBody.innerHTML = `<div class="output-welcome">
    <svg viewBox="0 0 24 24" fill="none" class="welcome-icon-svg"><path d="M4 17l6-6-6-6M12 19h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <p>कोड लिहा आणि <strong>चालवा</strong> दाबा &nbsp;<kbd>⌘↵</kbd></p>
  </div>`;
}
function addLine(text, cls = '') {
  const d = document.createElement('div');
  d.className = 'output-line' + (cls ? ' ' + cls : '');
  d.textContent = text;
  outputBody.appendChild(d);
  outputBody.scrollTop = outputBody.scrollHeight;
}
function setStatus(state, msg) {
  statusDot.className = 'status-dot' + (state ? ' ' + state : '');
  statusText.textContent = msg;
}

// ── INLINE INPUT ──────────────────────────────────
let _code = '', _collected = [], _remaining = [];

function showInlineInput(prompt) {
  inlinePromptEl.textContent = prompt || '> ';
  inlineBox.value = '';
  inlineRow.style.display = 'flex';
  inlineBox.focus();
}
function hideInlineInput() { inlineRow.style.display = 'none'; inlineBox.value = ''; }

function submitInput() {
  const val = inlineBox.value;
  hideInlineInput();
  addLine((inlinePromptEl.textContent || '> ') + val, 'echo');
  _collected.push(val);
  if (_remaining.length > 0) {
    showInlineInput(_remaining.shift());
  } else {
    executeCode(_code, _collected);
  }
}
inlineSend.addEventListener('click', submitInput);
inlineBox.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submitInput(); } });

// ── RUN FLOW ──────────────────────────────────────
runBtn.addEventListener('click', startRun);

function startRun() {
  const code = editor.value.trim();
  if (!code) { clearOutput(); addLine('कोड लिहा आणि मग चालवा!', 'err'); return; }
  _code = code; _collected = []; _remaining = [];
  clearOutput();
  setStatus('running', 'चालवत आहे…');
  runBtn.disabled = true;

  fetch('/run/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })
    .then(r => r.json())
    .then(data => {
      runBtn.disabled = false;
      if (data.needs_input && data.input_prompts?.length) {
        setStatus('', 'Input अपेक्षित…');
        _remaining = [...data.input_prompts];
        showInlineInput(_remaining.shift());
      } else {
        displayResult(data);
      }
    })
    .catch(err => {
      runBtn.disabled = false;
      addLine('सर्व्हर चूक: ' + err.message, 'err');
      setStatus('error', 'चूक');
    });
}

async function executeCode(code, inputs) {
  loadingOvl.classList.add('visible');
  runBtn.disabled = true;
  setStatus('running', 'चालवत आहे…');
  try {
    const r = await fetch('/run/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, inputs })
    });
    displayResult(await r.json());
  } catch (err) {
    addLine('सर्व्हर चूक: ' + err.message, 'err');
    setStatus('error', 'चूक');
  } finally {
    loadingOvl.classList.remove('visible');
    runBtn.disabled = false;
  }
}

function displayResult(data) {
  if (data.output && data.output !== '(कोणताही output नाही)') {
    data.output.split('\n').forEach(l => addLine(l));
  }
  if (data.error) {
    addLine('चूक: ' + data.error, 'err');
    sbErrors.childNodes[1] && (sbErrors.childNodes[1].textContent = ' 1');
    setStatus('error', 'चूक');
  }
  if (data.success && !data.error) {
    if (!data.output || data.output === '(कोणताही output नाही)') addLine('(output नाही)');
    addLine('✓ यशस्वीरीत्या चालले', 'ok');
    setStatus('success', 'यशस्वी');
  } else if (!data.needs_input && !data.error) {
    setStatus('error', 'चूक');
  }
}

// ── ACTIVITY BAR / PANELS ─────────────────────────
document.querySelectorAll('.act-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.dataset.panel;
    const wasActive = btn.classList.contains('active');
    document.querySelectorAll('.act-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel-view').forEach(p => p.classList.remove('active'));
    if (!wasActive) {
      btn.classList.add('active');
      const pv = $('panel-' + panel);
      if (pv) pv.classList.add('active');
    }
  });
});

// Output tabs
document.querySelectorAll('.out-tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.out-tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.out-view').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    $('out-' + t.dataset.out).classList.add('active');
  });
});

// ── THEMES ───────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-tile').forEach(t => {
    t.classList.toggle('active', t.dataset.theme === theme);
  });
  const icon = $('themeIcon');
  if (theme === 'light') {
    icon.innerHTML = `<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`;
  } else {
    icon.innerHTML = `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  localStorage.setItem('mc-theme', theme);
}

document.querySelectorAll('.theme-tile').forEach(t => {
  t.addEventListener('click', () => applyTheme(t.dataset.theme));
});
$('themeToggleBtn').addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(cur === 'light' ? 'dark' : 'light');
});
const savedTheme = localStorage.getItem('mc-theme');
if (savedTheme) applyTheme(savedTheme);

// ── FONT SIZE ─────────────────────────────────────
$('fsMinus').addEventListener('click', () => {
  if (fontSize > 10) { fontSize--; applyFontSize(fontSize); updateGutter(); }
});
$('fsPlus').addEventListener('click', () => {
  if (fontSize < 20) { fontSize++; applyFontSize(fontSize); updateGutter(); }
});

// ── RESIZE PANELS ─────────────────────────────────
const outputDrag = $('outputDrag');
const outputPane = document.querySelector('.output-pane');
let dragStartY = 0, dragStartH = 0;
outputDrag.addEventListener('mousedown', e => {
  dragStartY = e.clientY;
  dragStartH = outputPane.offsetHeight;
  outputDrag.classList.add('dragging');
  document.addEventListener('mousemove', onOutputDrag);
  document.addEventListener('mouseup', () => {
    outputDrag.classList.remove('dragging');
    document.removeEventListener('mousemove', onOutputDrag);
  }, { once: true });
});
function onOutputDrag(e) {
  const delta = dragStartY - e.clientY;
  const newH = Math.max(60, Math.min(window.innerHeight * .7, dragStartH + delta));
  outputPane.style.height = newH + 'px';
}

const resizeHandle = $('resizeHandle');
const sidePanel = document.querySelector('.side-panel');
let rpStartX = 0, rpStartW = 0;
resizeHandle.addEventListener('mousedown', e => {
  rpStartX = e.clientX; rpStartW = sidePanel.offsetWidth;
  resizeHandle.classList.add('dragging');
  document.addEventListener('mousemove', onResizeDrag);
  document.addEventListener('mouseup', () => {
    resizeHandle.classList.remove('dragging');
    document.removeEventListener('mousemove', onResizeDrag);
  }, { once: true });
});
function onResizeDrag(e) {
  const w = Math.max(160, Math.min(400, rpStartW + (e.clientX - rpStartX)));
  sidePanel.style.width = w + 'px';
}

// ── SIDEBAR BUTTONS ───────────────────────────────
$('clearBtn').addEventListener('click', async () => {
  const ok = await mcConfirm('कोड साफ करायचा आहे का? सर्व बदल नष्ट होतील.', 'कोड साफ करा');
  if (!ok) return;
  editor.value = ''; updateGutter(); updateHighlight(); showWelcome();
  setStatus('', 'तयार');
});

$('copyBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(editor.value).then(() => {
    setStatus('success', 'कॉपी केले!');
    setTimeout(() => setStatus('', 'तयार'), 2000);
  });
});

$('formatBtn').addEventListener('click', () => {
  editor.value = editor.value.split('\n').map(l => l.replace(/\s+$/, '')).join('\n');
  updateGutter(); updateHighlight();
  setStatus('success', 'फॉर्मॅट केले!');
  setTimeout(() => setStatus('', 'तयार'), 2000);
});

$('clearOutputBtn').addEventListener('click', () => {
  hideInlineInput(); showWelcome(); setStatus('', 'तयार');
});

$('copyOutputBtn').addEventListener('click', () => {
  const txt = [...outputBody.querySelectorAll('.output-line')].map(d => d.textContent).join('\n');
  navigator.clipboard.writeText(txt).then(() => {
    setStatus('success', 'Output कॉपी केले!');
    setTimeout(() => setStatus('', 'तयार'), 2000);
  });
});

// Search
$('searchBtn').addEventListener('click', () => {
  const q = $('searchInput').value; if (!q) return;
  const code = editor.value;
  const idx = code.indexOf(q);
  if (idx === -1) { $('searchResults').textContent = 'सापडले नाही'; return; }
  editor.focus(); editor.setSelectionRange(idx, idx + q.length);
  $('searchResults').textContent = `${(code.split(q).length - 1)} ठिकाणी सापडले`;
});
$('replaceBtn').addEventListener('click', () => {
  const q = $('searchInput').value, r = $('replaceInput').value;
  if (!q) return;
  editor.value = editor.value.split(q).join(r);
  updateGutter(); updateHighlight();
});

// ── FILES ─────────────────────────────────────────
const files = { main: editor.value };
let currentFile = 'main';

$('newFileBtn').addEventListener('click', async () => {
  const name = await mcPrompt('नवीन फाईलचे नाव:', '', 'नवीन फाईल');
  if (!name) return;
  const fname = name.replace(/[^a-zA-Z0-9_]/g, '') || 'untitled';
  files[fname] = `# ${fname}.mc\n`;
  addFileTab(fname);
  addFileItem(fname);
  switchFile(fname);
});

function addFileTab(name) {
  const tab = document.createElement('div');
  tab.className = 'editor-tab'; tab.dataset.file = name;
  tab.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M14 2v6h6" stroke="currentColor" stroke-width="1.5"/></svg><span>${name}.mc</span><button class="tab-close" data-file="${name}" title="बंद करा"><svg viewBox="0 0 24 24" fill="none"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>`;
  $('editorTabs').appendChild(tab);
  tab.addEventListener('click', e => { if (!e.target.closest('.tab-close')) switchFile(name); });
  tab.querySelector('.tab-close').addEventListener('click', e => { e.stopPropagation(); closeFile(name); });
}

function addFileItem(name) {
  const item = document.createElement('div');
  item.className = 'file-item'; item.dataset.file = name;
  item.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 2v6h6M10 13h4M10 17h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span>${name}.mc</span><span class="file-lang-tag">MC</span>`;
  item.addEventListener('click', () => switchFile(name));
  $('fileList').appendChild(item);
}

function switchFile(name) {
  files[currentFile] = editor.value; currentFile = name;
  editor.value = files[name] || ''; updateGutter(); updateHighlight();
  document.querySelectorAll('.editor-tab').forEach(t => t.classList.toggle('active', t.dataset.file === name));
  document.querySelectorAll('.file-item').forEach(t => t.classList.toggle('active', t.dataset.file === name));
  $('bcFile').textContent = name + '.mc';
}

function closeFile(name) {
  if (name === 'main') return;
  delete files[name];
  document.querySelector(`.editor-tab[data-file="${name}"]`)?.remove();
  document.querySelector(`.file-item[data-file="${name}"]`)?.remove();
  if (currentFile === name) switchFile('main');
}

$('fileList').addEventListener('click', e => {
  const item = e.target.closest('.file-item'); if (!item) return;
  switchFile(item.dataset.file);
});
document.querySelectorAll('.editor-tab').forEach(tab => {
  tab.addEventListener('click', e => { if (!e.target.closest('.tab-close')) switchFile(tab.dataset.file); });
});
document.querySelectorAll('.tab-close').forEach(btn => {
  btn.addEventListener('click', e => { e.stopPropagation(); closeFile(btn.dataset.file); });
});

// ── BUILD EXAMPLES ────────────────────────────────
EXAMPLES.forEach(ex => {
  const item = document.createElement('div');
  item.className = 'ex-item';
  item.innerHTML = `
    <div class="ex-item-icon"><svg viewBox="0 0 24 24" fill="none">${ICONS.default}</svg></div>
    <div class="ex-item-body">
      <div class="ex-item-title">${ex.title}</div>
      <div class="ex-item-desc">${ex.desc}</div>
    </div>
    <span class="ex-badge">${ex.diff}</span>`;
  item.addEventListener('click', () => {
    editor.value = ex.code; updateGutter(); updateHighlight();
    document.querySelectorAll('.act-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel-view').forEach(p => p.classList.remove('active'));
    document.querySelector('.act-btn[data-panel="explorer"]').classList.add('active');
    $('panel-explorer').classList.add('active');
    setStatus('success', `"${ex.title}" लोड केले`);
    setTimeout(() => setStatus('', 'तयार'), 2000);
    editor.focus();
  });
  examplesGrid.appendChild(item);
});

// ── INIT ─────────────────────────────────────────
updateGutter();
updateCursor();
updateHighlight(); // initial highlight pass
