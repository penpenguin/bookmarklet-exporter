import type { editor as MonacoEditor } from 'monaco-editor';
import { generateBookmarklet } from '../lib/bookmarklet';
import { ensureMonacoTextareaIdentifiers } from './editorA11y';

const sampleCode = `const selected = window.getSelection()?.toString();
if (selected) {
  alert('選択したテキスト: ' + selected);
} else {
  alert('選択範囲がありません');
}`;

const cdnBase = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.0/min/';

const editorContainer = document.getElementById('editor');
const fallbackTextarea = document.getElementById('code-fallback') as HTMLTextAreaElement | null;
const wrapIife = document.getElementById('wrap-iife') as HTMLInputElement | null;
const collapseLines = document.getElementById('collapse-lines') as HTMLInputElement | null;
const nameInput = document.getElementById('name-input') as HTMLInputElement | null;
const output = document.getElementById('output') as HTMLTextAreaElement | null;
const message = document.getElementById('message');
const bookmarkLink = document.getElementById('bookmark-link') as HTMLAnchorElement | null;
const convertBtn = document.getElementById('convert-btn');
const copyBtn = document.getElementById('copy-btn');

let monacoEditor: MonacoEditor.IStandaloneCodeEditor | null = null;

const setMessage = (text: string, state: 'success' | 'error' | 'info' = 'info') => {
  if (!message) return;
  message.textContent = text;
  message.dataset.state = state;
};

const loadMonaco = () =>
  new Promise<typeof import('monaco-editor')>((resolve, reject) => {
    if ((window as any).monaco) {
      resolve((window as any).monaco);
      return;
    }

    const loader = document.createElement('script');
    loader.src = `${cdnBase}vs/loader.min.js`;
    loader.onload = () => {
      (window as any).require.config({ paths: { vs: `${cdnBase}vs` } });
      (window as any).require(['vs/editor/editor.main'], () => resolve((window as any).monaco));
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

    // Ensure the hidden textarea Monaco uses for input has stable identifiers for autofill tools.
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

convertBtn?.addEventListener('click', convert);
copyBtn?.addEventListener('click', copyResult);
nameInput?.addEventListener('input', applyNameToLink);
