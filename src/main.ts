import './style.css';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;

const L = (document.documentElement.lang || 'zh').toLowerCase().startsWith('en') ? 'en' : 'zh';
const T = {
  zh: {
    pickImg: '请选择图片(JPG / PNG / WebP)',
    ready: '选语言后点「提取文字」(首次需下载语言包)',
    loadingEngine: '正在加载 OCR 引擎(首次较慢)…',
    recognizing: (p: number) => `识别中 ${p}%…`,
    loadingLang: '加载语言包 / 初始化…',
    done: '识别完成',
    noText: '未识别到文字,换张更清晰的图试试',
    fail: '识别失败,请重试',
    placeholder: '(未识别到文字)',
    copyAll: '复制全部', copied: '已复制 ✓', dlTxt: '下载 TXT',
  },
  en: {
    pickImg: 'Please choose an image (JPG / PNG / WebP)',
    ready: 'Pick a language, then click "Extract text" (a language pack downloads on first run)',
    loadingEngine: 'Loading the OCR engine (slower on first run)…',
    recognizing: (p: number) => `Recognizing ${p}%…`,
    loadingLang: 'Loading language pack / initializing…',
    done: 'Done',
    noText: 'No text found — try a clearer image',
    fail: 'Recognition failed, please retry',
    placeholder: '(no text found)',
    copyAll: 'Copy all', copied: 'Copied ✓', dlTxt: 'Download TXT',
  },
}[L];

const fileInput = $<HTMLInputElement>('#fileInput');
const dropzone = $('#dropzone');
const panel = $('#panel');
const origMeta = $('#origMeta');
const langSeg = $('#langSeg');
const ocrBtn = $<HTMLButtonElement>('#ocrBtn');
const progressEl = $('#progress');
const bar = progressEl.querySelector('i') as HTMLElement;
const statusEl = $('#status');
const resultEl = $('#result');

let file: File | null = null;
let lang = 'chi_sim+eng';

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

function fmt(b: number): string {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1024 / 1024).toFixed(2) + ' MB';
}
function setStatus(msg: string, kind: 'ok' | 'err' | '' = '') {
  statusEl.textContent = msg;
  statusEl.className = 'statusline' + (kind ? ' ' + kind : '');
}
function setProgress(r: number | null) {
  if (r === null) { progressEl.classList.remove('show'); bar.style.width = '0'; return; }
  progressEl.classList.add('show');
  bar.style.width = Math.round(Math.min(1, Math.max(0, r)) * 100) + '%';
}

function loadFile(f: File) {
  if (!f.type.startsWith('image/')) { setStatus(T.pickImg, 'err'); return; }
  file = f;
  const url = URL.createObjectURL(f);
  const img = new Image();
  img.onload = () => {
    origMeta.innerHTML =
      `<img class="op-thumb" src="${url}" alt="" />` +
      `<div class="op-info"><b class="op-name">${f.name}</b>` +
      `<div class="op-line mono">${img.naturalWidth}×${img.naturalHeight} · ${fmt(f.size)}</div></div>`;
  };
  img.src = url;
  (panel as HTMLElement).hidden = false;
  ocrBtn.disabled = false;
  resultEl.classList.remove('show');
  resultEl.innerHTML = '';
  setProgress(null);
  setStatus(T.ready);
}

fileInput.addEventListener('change', () => {
  const f = fileInput.files?.[0];
  if (f) loadFile(f);
  fileInput.value = '';
});
(['dragenter', 'dragover'] as const).forEach((ev) =>
  dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add('drag'); }),
);
(['dragleave', 'drop'] as const).forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    if (ev === 'dragleave' && dropzone.contains((e as DragEvent).relatedTarget as Node)) return;
    dropzone.classList.remove('drag');
  }),
);
dropzone.addEventListener('drop', (e) => {
  const f = (e as DragEvent).dataTransfer?.files?.[0];
  if (f) loadFile(f);
});

langSeg.querySelectorAll('button').forEach((b) => {
  b.addEventListener('click', () => {
    langSeg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', 'true');
    lang = (b as HTMLElement).dataset.lang || 'chi_sim+eng';
  });
});

ocrBtn.addEventListener('click', async () => {
  if (!file) return;
  ocrBtn.disabled = true;
  resultEl.classList.remove('show');
  setStatus(T.loadingEngine);
  setProgress(0.02);
  try {
    const Tesseract = (await import('tesseract.js')).default;
    const { data } = await Tesseract.recognize(file, lang, {
      logger: (m: { status: string; progress: number }) => {
        if (m.status === 'recognizing text') {
          setProgress(m.progress);
          setStatus(T.recognizing(Math.round(m.progress * 100)));
        } else {
          setStatus(T.loadingLang);
        }
      },
    });
    setProgress(null);
    const text = (data.text || '').trim();
    setStatus(text ? T.done : T.noText, text ? 'ok' : 'err');
    renderResult(text);
  } catch (e) {
    setProgress(null);
    setStatus((e as Error).message || T.fail, 'err');
  } finally {
    ocrBtn.disabled = false;
  }
});

function renderResult(text: string) {
  resultEl.innerHTML =
    `<div class="ocr-out">` +
    `<textarea class="text-out" spellcheck="false" placeholder="${T.placeholder}"></textarea>` +
    `<div class="text-toolbar"><button class="btn btn-ghost" id="copyBtn">${T.copyAll}</button>` +
    `<button class="btn btn-primary" id="dlBtn">${T.dlTxt}</button></div></div>`;
  const ta = resultEl.querySelector('textarea') as HTMLTextAreaElement;
  ta.value = text;
  resultEl.classList.add('show');

  const copyBtn = resultEl.querySelector('#copyBtn') as HTMLButtonElement;
  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(ta.value);
      copyBtn.textContent = T.copied;
      setTimeout(() => (copyBtn.textContent = T.copyAll), 1500);
    } catch { ta.select(); }
  };
  (resultEl.querySelector('#dlBtn') as HTMLButtonElement).onclick = () => {
    const base = file!.name.replace(/\.[^.]+$/, '');
    const blob = new Blob([ta.value], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${base}.txt`;
    a.click();
  };
}
