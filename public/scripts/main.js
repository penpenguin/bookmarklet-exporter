const generateBookmarklet = (code, options = {}) => {
  const trimmed = code.trim();

  if (!trimmed) {
    throw new Error('code is required');
  }

  const { wrapIIFE = true, collapseNewlines = true } = options;

  const singleLine = collapseNewlines ? trimmed.replace(/[\r\n]+/g, ' ') : trimmed;

  const wrapped = wrapIIFE ? `(function(){ ${singleLine} })();` : singleLine;

  return `javascript:${wrapped}`;
};

const ensureMonacoTextareaIdentifiers = (root, options = {}) => {
  if (!root) return;
  const textarea = root.querySelector('textarea.inputarea');
  if (!textarea) return;

  const { name = 'code', id = 'monaco-code-input' } = options;

  if (!textarea.hasAttribute('name')) {
    textarea.setAttribute('name', name);
  }

  if (!textarea.id) {
    textarea.id = id;
  }
};

const sampleCode = `const selected = window.getSelection()?.toString();
if (selected) {
  alert('選択したテキスト: ' + selected);
} else {
  alert('選択範囲がありません');
}`;

const cdnBase = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.0/min/';

const editorContainer = document.getElementById('editor');
const fallbackTextarea = document.getElementById('code-fallback');
const wrapIife = document.getElementById('wrap-iife');
const collapseLines = document.getElementById('collapse-lines');
const nameInput = document.getElementById('name-input');
const output = document.getElementById('output');
const message = document.getElementById('message');
const bookmarkLink = document.getElementById('bookmark-link');
const convertBtn = document.getElementById('convert-btn');
const copyBtn = document.getElementById('copy-btn');
const tabButtons = Array.from(document.querySelectorAll('[data-tab-target]'));
const tabPanels = Array.from(document.querySelectorAll('[data-tab-panel]'));

let monacoEditor = null;

const activateTab = (target) => {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tabTarget === target;
    button.setAttribute('aria-selected', String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.dataset.tabPanel === target;
    panel.dataset.active = String(isActive);
    if (isActive) {
      panel.removeAttribute('hidden');
    } else {
      panel.setAttribute('hidden', '');
    }
  });
};

const initTabs = () => {
  if (tabButtons.length === 0 || tabPanels.length === 0) return;
  activateTab('tools');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.tabTarget;
      if (target) activateTab(target);
    });

    button.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

      event.preventDefault();
      const currentIndex = tabButtons.indexOf(button);
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (currentIndex + direction + tabButtons.length) % tabButtons.length;
      tabButtons[nextIndex].focus();
      const target = tabButtons[nextIndex].dataset.tabTarget;
      if (target) activateTab(target);
    });
  });
};

const setMessage = (text, state = 'info') => {
  if (!message) return;
  message.textContent = text;
  message.dataset.state = state;
};

const loadMonaco = () =>
  new Promise((resolve, reject) => {
    if (window.monaco) {
      resolve(window.monaco);
      return;
    }

    const loader = document.createElement('script');
    loader.src = `${cdnBase}vs/loader.min.js`;
    loader.onload = () => {
      window.require.config({ paths: { vs: `${cdnBase}vs` } });
      window.require(['vs/editor/editor.main'], () => resolve(window.monaco));
    };
    loader.onerror = () => reject(new Error('Monaco の読み込みに失敗しました。'));
    document.body.appendChild(loader);
  });

const initEditor = async () => {
  if (!editorContainer) return;
  try {
    const monaco = await loadMonaco();
    monacoEditor = monaco.editor.create(editorContainer, {
      value: sampleCode,
      language: 'javascript',
      theme: 'vs-dark',
      minimap: { enabled: false },
      fontSize: 14,
      automaticLayout: true,
      ariaLabel: 'JavaScriptコード',
    });

    ensureMonacoTextareaIdentifiers(editorContainer, {
      name: 'code',
      id: 'monaco-code-input',
    });
  } catch (error) {
    editorContainer.style.display = 'none';
    if (fallbackTextarea) {
      fallbackTextarea.style.display = 'block';
      fallbackTextarea.value = sampleCode;
    }
    setMessage('Monaco を読み込めなかったため、テキストエリアで編集できます。', 'error');
  }
};

const getCode = () => {
  if (monacoEditor) return monacoEditor.getValue();
  return fallbackTextarea?.value ?? '';
};

const applyNameToLink = () => {
  if (!bookmarkLink) return;
  const label = nameInput?.value.trim() || 'ブックマークレット';
  bookmarkLink.textContent = label;
};

const convert = () => {
  if (!output || !bookmarkLink || !wrapIife || !collapseLines) return;
  try {
    const bookmarklet = generateBookmarklet(getCode(), {
      wrapIIFE: wrapIife.checked,
      collapseNewlines: collapseLines.checked,
    });

    output.value = bookmarklet;
    bookmarkLink.href = bookmarklet;
    applyNameToLink();
    setMessage('ブックマークレットを生成しました。ドラッグして登録できます。', 'success');
  } catch (error) {
    if (error instanceof Error) {
      setMessage(error.message, 'error');
    } else {
      setMessage('変換に失敗しました。コードを確認してください。', 'error');
    }
  }
};

const copyResult = async () => {
  if (!output) return;
  const text = output.value.trim();
  if (!text) {
    setMessage('先に「変換する」を実行してください。', 'info');
    return;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      output.focus();
      output.select();
      document.execCommand('copy');
    }
    setMessage('生成結果をクリップボードにコピーしました。', 'success');
  } catch (error) {
    setMessage('コピーに失敗しました。手動で選択してコピーしてください。', 'error');
  }
};

initEditor();
applyNameToLink();
initTabs();
document.body.classList.remove('no-js');
document.body.classList.add('js');

convertBtn?.addEventListener('click', convert);
copyBtn?.addEventListener('click', copyResult);
nameInput?.addEventListener('input', applyNameToLink);
