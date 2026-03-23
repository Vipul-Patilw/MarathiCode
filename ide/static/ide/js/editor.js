/* ═══════════════════════════════════════════════════
   मराठीकोड IDE — Editor JavaScript
   ═══════════════════════════════════════════════════ */
'use strict';

// ─────────────────────────────────────────────────
//  EXAMPLES DATA
// ─────────────────────────────────────────────────
const EXAMPLES = [
  {
    title: '🙏 नमस्कार जग', badge: 'सोपे', desc: 'पहिला कार्यक्रम',
    code: `# पहिला मराठीकोड कार्यक्रम
dakhava("नमस्कार, जग!")
dakhava("मराठीकोड मध्ये आपले स्वागत आहे!")`,
  },
  {
    title: '⌨️ ghya() — Input', badge: 'सोपे', desc: 'वापरकर्त्याकडून input घ्या',
    code: `# ghya() — Python च्या input() सारखे
nav = ghya("तुमचे नाव सांगा: ")
dakhava("नमस्कार,", nav)

vay = poornanank(ghya("तुमचे वय: "))
jar vay >= 18:
    dakhava("तुम्ही प्रौढ आहात!")
nahitar:
    dakhava("तुम्ही अजून लहान आहात")`,
  },
  {
    title: '🔢 कॅल्क्युलेटर', badge: 'मध्यम', desc: 'Input घेऊन गणना करा',
    code: `# साधा कॅल्क्युलेटर
a = dasamank(ghya("पहिला आकडा: "))
b = dasamank(ghya("दुसरा आकडा: "))

dakhava("बेरीज  :", a + b)
dakhava("वजाबाकी:", a - b)
dakhava("गुणाकार:", a * b)
jar b != 0:
    dakhava("भागाकार:", a / b)
nahitar:
    dakhava("शून्याने भाग होत नाही!")`,
  },
  {
    title: '🔀 जर-नाहीतर', badge: 'मध्यम', desc: 'if-elif-else',
    code: `guni = poornanank(ghya("गुण द्या (0-100): "))
jar guni >= 90:
    dakhava("A श्रेणी — उत्कृष्ट! 🏆")
nahitar jar guni >= 75:
    dakhava("B श्रेणी — चांगले! 👍")
nahitar jar guni >= 60:
    dakhava("C श्रेणी — ठीक 📚")
nahitar:
    dakhava("अभ्यास कर! 💪")`,
  },
  {
    title: '🔄 जोपर्यंत लूप', badge: 'मध्यम', desc: 'while loop',
    code: `i = 1
jaoparyant i <= 5:
    dakhava("आकडा:", i)
    i = i + 1
dakhava("पूर्ण!")`,
  },
  {
    title: '📋 प्रत्येक लूप', badge: 'मध्यम', desc: 'for loop',
    code: `phale = ["आंबा", "केळी", "सफरचंद", "द्राक्षे"]
dakhava("फळांची यादी:")
pratyek phal madhe phale:
    dakhava("🍎", phal)
dakhava("एकूण:", lambai(phale))`,
  },
  {
    title: '⚡ कार्य', badge: 'मध्यम', desc: 'Function',
    code: `karya gunakara(a, b):
    parat a * b

dakhava("6 × 7 =", gunakara(6, 7))
dakhava("5 × 5 =", gunakara(5, 5))`,
  },
  {
    title: '🔁 फिबोनाची', badge: 'कठीण', desc: 'Recursion',
    code: `karya fib(n):
    jar n <= 1:
        parat n
    parat fib(n-1) + fib(n-2)

pratyek i madhe aakda_shreni(0, 9):
    dakhava(fib(i))`,
  },
  {
    title: '📦 वर्ग (Class)', badge: 'कठीण', desc: 'Class + Object',
    code: `varg Vidyarthi:
    karya suruvat(swatah, nav, guni):
        swatah.nav = nav
        swatah.guni = guni
    karya mahiti(swatah):
        dakhava("नाव:", swatah.nav)
        dakhava("गुण:", swatah.guni)

v = Vidyarthi("राहुल", 85)
v.mahiti()`,
  },
  {
    title: '📊 यादी', badge: 'मध्यम', desc: 'List operations',
    code: `ankadi = [5, 2, 8, 1, 9, 3]
dakhava("मूळ:", ankadi)
ankadi.joda(7)
dakhava("जोडल्यानंतर:", ankadi)
ankadi.sort()
dakhava("क्रमाने:", ankadi)`,
  },
  {
    title: '➗ पाढे', badge: 'सोपे', desc: 'गुणाकार पाढा',
    code: `ankada = poornanank(ghya("कोणत्या आकड्याचा पाढा? "))
dakhava(ankada, "चा पाढा:")
pratyek i madhe aakda_shreni(1, 11):
    dakhava(ankada, "×", i, "=", ankada * i)`,
  },
  {
    title: '🎯 break / continue', badge: 'मध्यम', desc: 'थांब आणि पुढे',
    code: `dakhava("सम आकडे (1-10):")
pratyek i madhe aakda_shreni(1, 11):
    jar i % 2 != 0:
        pudhe
    dakhava(i)`,
  },
];

// ─────────────────────────────────────────────────
//  DOM ELEMENTS
// ─────────────────────────────────────────────────
const editor       = document.getElementById('codeEditor');
const lineNums     = document.getElementById('lineNumbers');
const runBtn       = document.getElementById('runBtn');
const outputBody   = document.getElementById('outputBody');
const statusDot    = document.getElementById('statusDot');
const statusMsg    = document.getElementById('statusMsg');
const cursorPos    = document.getElementById('cursorPos');
const lineCount    = document.getElementById('lineCount');
const loadingOvl   = document.getElementById('loadingOverlay');
const examplesGrid = document.getElementById('examplesGrid');
const inputModal   = document.getElementById('inputModal');
const inputForm    = document.getElementById('inputForm');
const inputFields  = document.getElementById('inputFields');
const inputSubmit  = document.getElementById('inputSubmit');
const inputCancel  = document.getElementById('inputCancel');

// ─────────────────────────────────────────────────
//  LINE NUMBERS + CURSOR
// ─────────────────────────────────────────────────
function updateLineNumbers() {
  const n = editor.value.split('\n').length;
  lineNums.textContent = Array.from({length: n}, (_, i) => i + 1).join('\n');
  lineCount.textContent = `ओळी: ${n}`;
}

function updateCursor() {
  const val = editor.value;
  const pos = editor.selectionStart;
  const lines = val.slice(0, pos).split('\n');
  cursorPos.textContent = `ओळ ${lines.length}, स्तंभ ${lines[lines.length-1].length + 1}`;
}

function syncScroll() { lineNums.scrollTop = editor.scrollTop; }

editor.addEventListener('input',  () => { updateLineNumbers(); updateCursor(); syncScroll(); });
editor.addEventListener('click',  updateCursor);
editor.addEventListener('keyup',  updateCursor);
editor.addEventListener('scroll', syncScroll);

editor.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const s = editor.selectionStart, end = editor.selectionEnd;
    editor.value = editor.value.slice(0, s) + '    ' + editor.value.slice(end);
    editor.selectionStart = editor.selectionEnd = s + 4;
    updateLineNumbers();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runCode(); }
  const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
  if (pairs[e.key]) {
    e.preventDefault();
    const s = editor.selectionStart;
    editor.value = editor.value.slice(0, s) + e.key + pairs[e.key] + editor.value.slice(editor.selectionEnd);
    editor.selectionStart = editor.selectionEnd = s + 1;
    updateLineNumbers();
  }
});

// ─────────────────────────────────────────────────
//  INPUT MODAL — shows when code has ghya() calls
// ─────────────────────────────────────────────────
function showInputModal(prompts) {
  inputFields.innerHTML = '';
  prompts.forEach((prompt, idx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'input-field-wrap';
    wrapper.innerHTML = `
      <label class="input-label">${prompt || `Input ${idx + 1}:`}</label>
      <input class="input-text" type="text" id="inp_${idx}" 
             placeholder="येथे मूल्य टाका..." autocomplete="off" spellcheck="false">
    `;
    inputFields.appendChild(wrapper);
  });
  inputModal.classList.add('visible');
  // focus first input
  const first = document.getElementById('inp_0');
  if (first) first.focus();
}

function hideInputModal() {
  inputModal.classList.remove('visible');
}

// Submit inputs → re-run code with values
inputSubmit.addEventListener('click', () => {
  const inputs = [];
  let idx = 0;
  while (document.getElementById('inp_' + idx)) {
    inputs.push(document.getElementById('inp_' + idx).value);
    idx++;
  }
  hideInputModal();
  executeCode(editor.value, inputs);
});

// Allow Enter key inside last input to submit
inputFields.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); inputSubmit.click(); }
});

inputCancel.addEventListener('click', () => {
  hideInputModal();
  statusDot.className = 'dot';
  statusMsg.textContent = 'रद्द केले';
});

// ─────────────────────────────────────────────────
//  CORE RUN LOGIC
// ─────────────────────────────────────────────────
async function runCode() {
  const code = editor.value.trim();
  if (!code) {
    setOutput([{ text: 'कोड लिहा आणि मग चालवा!', type: 'error' }]);
    return;
  }
  // First call without inputs — server will tell us if ghya() exists
  await executeCode(code, null);
}

async function executeCode(code, inputs) {
  loadingOvl.classList.add('visible');
  statusDot.className = 'dot running';
  statusMsg.textContent = 'चालवत आहे...';
  runBtn.disabled = true;

  try {
    const body = { code };
    if (inputs !== null) body.inputs = inputs;

    const resp = await fetch('/run/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await resp.json();

    // Server says it needs input values
    if (data.needs_input && data.input_prompts && data.input_prompts.length > 0) {
      loadingOvl.classList.remove('visible');
      runBtn.disabled = false;
      statusDot.className = 'dot';
      statusMsg.textContent = 'Input अपेक्षित आहे...';
      showInputModal(data.input_prompts);
      return;
    }

    // Build output lines
    const lines = [];
    if (data.output && data.output !== '(कोणताही output नाही)') {
      data.output.split('\n').forEach(l => lines.push({ text: l, type: 'normal' }));
    }
    if (data.error) {
      lines.push({ text: '⚠️ चूक: ' + data.error, type: 'error' });
    }
    if (data.success && !data.error) {
      if (!data.output || data.output === '(कोणताही output नाही)') {
        lines.push({ text: '(कोणताही output नाही)', type: 'normal' });
      }
      lines.push({ text: '✓ यशस्वीरीत्या चालले', type: 'success' });
      statusDot.className = 'dot success';
      statusMsg.textContent = 'यशस्वी';
    } else {
      statusDot.className = 'dot error';
      statusMsg.textContent = 'चूक';
    }

    setOutput(lines);
  } catch (err) {
    setOutput([{ text: '⚠️ सर्व्हर चूक: ' + err.message, type: 'error' }]);
    statusDot.className = 'dot error';
    statusMsg.textContent = 'चूक';
  } finally {
    loadingOvl.classList.remove('visible');
    runBtn.disabled = false;
  }
}

function setOutput(lines) {
  outputBody.innerHTML = '';
  lines.forEach(({ text, type }) => {
    const div = document.createElement('div');
    div.className = 'output-line' +
      (type === 'error'   ? ' error-line'  : '') +
      (type === 'success' ? ' success-tag' : '');
    div.textContent = text;
    outputBody.appendChild(div);
  });
  outputBody.scrollTop = outputBody.scrollHeight;
}

runBtn.addEventListener('click', runCode);

// ─────────────────────────────────────────────────
//  TAB NAVIGATION
// ─────────────────────────────────────────────────
document.querySelectorAll('.nav-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    const tab = pill.dataset.tab;
    document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    pill.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
  });
});

// ─────────────────────────────────────────────────
//  THEME SWITCHER
// ─────────────────────────────────────────────────
document.querySelectorAll('.swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    const theme = swatch.dataset.theme;
    document.body.setAttribute('data-theme', theme === 'dark' ? '' : theme);
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    localStorage.setItem('mc-theme', theme);
  });
});
const savedTheme = localStorage.getItem('mc-theme');
if (savedTheme && savedTheme !== 'dark') {
  document.body.setAttribute('data-theme', savedTheme);
  const s = document.querySelector(`.swatch[data-theme="${savedTheme}"]`);
  if (s) { document.querySelectorAll('.swatch').forEach(x => x.classList.remove('active')); s.classList.add('active'); }
}

// ─────────────────────────────────────────────────
//  SIDEBAR BUTTONS
// ─────────────────────────────────────────────────
document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm('कोड साफ करायचा आहे का?')) {
    editor.value = '';
    updateLineNumbers();
    setOutput([]);
    outputBody.innerHTML = `<div class="output-welcome"><span class="welcome-icon">🚀</span><p>कोड लिहा आणि <strong>चालवा</strong> बटण दाबा</p></div>`;
    statusDot.className = 'dot';
    statusMsg.textContent = 'तयार';
  }
});

document.getElementById('copyBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(editor.value).then(() => {
    statusMsg.textContent = 'कॉपी केले!';
    setTimeout(() => statusMsg.textContent = 'तयार', 2000);
  });
});

document.getElementById('formatBtn').addEventListener('click', () => {
  editor.value = editor.value.split('\n').map(l => l.replace(/\s+$/, '')).join('\n');
  updateLineNumbers();
  statusMsg.textContent = 'फॉर्मॅट केले!';
  setTimeout(() => statusMsg.textContent = 'तयार', 2000);
});

document.getElementById('clearOutputBtn').addEventListener('click', () => {
  outputBody.innerHTML = `<div class="output-welcome"><span class="welcome-icon">🚀</span><p>कोड लिहा आणि <strong>चालवा</strong> बटण दाबा</p></div>`;
  statusDot.className = 'dot';
});

// ─────────────────────────────────────────────────
//  FILE MANAGEMENT
// ─────────────────────────────────────────────────
const files = { 'main': editor.value };
let currentFile = 'main';

document.getElementById('newFileBtn').addEventListener('click', () => {
  const name = prompt('नवीन फाईलचे नाव:');
  if (!name) return;
  const fname = name.replace(/[^a-zA-Z0-9_]/g, '') || 'untitled';
  files[fname] = `# ${fname}.mc\n`;
  const item = document.createElement('div');
  item.className = 'file-item';
  item.dataset.file = fname;
  item.innerHTML = `<span class="file-icon">📄</span> ${fname}.mc`;
  document.getElementById('fileList').appendChild(item);
  switchToFile(fname, item);
});

document.getElementById('fileList').addEventListener('click', e => {
  const item = e.target.closest('.file-item');
  if (!item) return;
  switchToFile(item.dataset.file, item);
});

function switchToFile(name, item) {
  files[currentFile] = editor.value;
  currentFile = name;
  editor.value = files[name] || '';
  updateLineNumbers();
  document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
  item.classList.add('active');
  document.querySelector('.filename-tag').textContent = name + '.mc';
}

// ─────────────────────────────────────────────────
//  EXAMPLES
// ─────────────────────────────────────────────────
function buildExamples() {
  EXAMPLES.forEach((ex, idx) => {
    const card = document.createElement('div');
    card.className = 'example-card';
    card.innerHTML = `
      <div class="example-card-header">
        <div class="example-title">${ex.title}</div>
        <span class="example-badge">${ex.badge}</span>
      </div>
      <div class="example-code">${escHtml(ex.code)}</div>
      <div class="example-footer">
        <span>${ex.desc}</span>
        <button class="load-btn" data-idx="${idx}">उघडा →</button>
      </div>`;
    examplesGrid.appendChild(card);
  });
  examplesGrid.addEventListener('click', e => {
    const btn = e.target.closest('.load-btn');
    if (!btn) return;
    const ex = EXAMPLES[+btn.dataset.idx];
    editor.value = ex.code;
    updateLineNumbers();
    document.querySelector('.nav-pill[data-tab="editor"]').click();
    statusMsg.textContent = `"${ex.title}" लोड केले`;
    setTimeout(() => statusMsg.textContent = 'तयार', 2000);
  });
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─────────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────────
buildExamples();
updateLineNumbers();
updateCursor();
