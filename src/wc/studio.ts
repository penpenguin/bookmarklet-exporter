import {
  buildBookmarklet,
  EncodeMode,
  MinifyMode,
  TransformOptions,
  WrapMode,
} from '@domain/bookmarklet/transform';
import './editor';
import './output';
import { BookmarkletOutput } from './output';
import { SnippetEditor } from './editor';

type Tab = 'tools' | 'guide';

type StudioState = {
  name: string;
  code: string;
  wrap: WrapMode;
  minify: MinifyMode;
  encode: EncodeMode;
  collapse: boolean;
  tab: Tab;
};

const STORAGE_KEY = 'bookmarklet-exporter:v1';
const defaultState: StudioState = {
  name: 'ブックマークレット',
  code: '',
  wrap: 'iife',
  minify: 'simple',
  encode: 'minimal',
  collapse: true,
  tab: 'tools',
};

export class BookmarkletStudio extends HTMLElement {
  private saveTimer: number | undefined;
  private output!: BookmarkletOutput;
  private editor!: SnippetEditor;
  private nameInput!: HTMLInputElement;
  private wrapSelect!: HTMLSelectElement;
  private minifySelect!: HTMLSelectElement;
  private encodeSelect!: HTMLSelectElement;
  private collapseCheckbox!: HTMLInputElement;
  private messageEl!: HTMLElement;
  private tabButtons!: NodeListOf<HTMLButtonElement>;
  private panels!: NodeListOf<HTMLElement>;
  private initialized = false;

  connectedCallback() {
    if (!this.initialized) {
      this.render();
      this.cacheElements();
      this.restoreState();
      this.bindEvents();
      this.syncTabWithHash(true);
      this.initialized = true;
    }
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this.handleHashChange);
    if (this.saveTimer) window.clearTimeout(this.saveTimer);
  }

  private render() {
    const initialName = this.dataset.name || defaultState.name;
    const initialCode = this.dataset.code ? decodeURIComponent(this.dataset.code) : '';
    this.innerHTML = `
      <div class="studio" data-role="studio">
        <header class="hero">
          <h1>ブックマークレットを素早く生成</h1>
          <p class="lead">JavaScript を貼り付けてオプションを選ぶだけで、ブックマークバーにドラッグできるリンクと URL を生成します。</p>
        </header>

        <div class="tab-shell">
          <div class="tab-list" role="tablist" aria-label="コンテンツ切り替え">
            <button class="tab" data-tab="tools" role="tab" aria-controls="tools-panel" aria-selected="true" tabindex="0">ツール</button>
            <button class="tab" data-tab="guide" role="tab" aria-controls="guide-panel" aria-selected="false" tabindex="-1">説明</button>
          </div>

          <div class="tab-panels">
            <section id="tools-panel" class="tab-panel" data-panel="tools" role="tabpanel">
              <div class="panel">
                <div class="field">
                  <label for="name-input">ブックマーク名（任意）</label>
                  <input id="name-input" data-field="name" type="text" placeholder="例: Text Highlighter" value="${initialName}">
                </div>

                <div class="field">
                  <label>JavaScript コード</label>
                  <p class="note">信頼できるコードだけを貼り付けてください。不要な改行はオプションでまとめられます。</p>
                  <snippet-editor data-field="editor" data-code="${encodeURIComponent(initialCode)}"></snippet-editor>
                </div>

                <div class="editor-toolbar" aria-label="変換オプションと整形">
                  <div class="option-row">
                    <label class="option select">
                      wrap
                      <select data-field="wrap">
                        <option value="none">なし</option>
                        <option value="iife" selected>IIFE</option>
                        <option value="async">async IIFE</option>
                      </select>
                    </label>
                    <label class="option select">
                      minify
                      <select data-field="minify">
                        <option value="none">なし</option>
                        <option value="simple" selected>簡易</option>
                        <option value="terser">terser</option>
                      </select>
                    </label>
                    <label class="option select">
                      encode
                      <select data-field="encode">
                        <option value="minimal" selected>軽量</option>
                        <option value="component">encodeURIComponent</option>
                      </select>
                    </label>
                    <label class="option check">
                      <input type="checkbox" data-field="collapse" checked> 改行を 1 行にまとめる
                    </label>
                  </div>
                  <div class="toolbar-actions">
                    <button type="button" data-action="format" class="secondary ghost">整形</button>
                  </div>
                </div>

                <div class="actions">
                  <button type="button" data-action="convert" class="primary">変換する</button>
                  <button type="button" data-action="copy" class="secondary">生成結果をコピー</button>
                </div>

                <bookmarklet-output data-field="output"></bookmarklet-output>
                <div class="message" data-field="message" role="status" aria-live="polite"></div>
              </div>
            </section>

            <section id="guide-panel" class="tab-panel" data-panel="guide" role="tabpanel" hidden>
              <div class="panel guide">
                <h2>使い方</h2>
                <ol class="pill-list">
                  <li>コードをエディターに貼り付け、オプションを必要に応じて変更します。</li>
                  <li>「変換する」を押して URL とドラッグ用リンクを生成します。</li>
                  <li>ブックマークバーへリンクをドラッグするか、コピーした URL を登録します。</li>
                  <li>動作確認し、問題があればコードを修正して再生成します。</li>
                </ol>
                <h2>よくある注意</h2>
                <ul class="pill-list">
                  <li>機密情報は入力しないでください。貼り付けたコードはブラウザ内のみで処理されます。</li>
                  <li>Safari ではクリップボードアクセスが制限される場合があります。失敗したら手動コピーしてください。</li>
                  <li>URL が長い場合は wrap を「なし」にしたり、minify を有効にして短縮します。</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    `;
  }

  private cacheElements() {
    this.output = this.querySelector('bookmarklet-output') as BookmarkletOutput;
    this.editor = this.querySelector('snippet-editor') as SnippetEditor;
    this.nameInput = this.querySelector('[data-field="name"]') as HTMLInputElement;
    this.wrapSelect = this.querySelector('[data-field="wrap"]') as HTMLSelectElement;
    this.minifySelect = this.querySelector('[data-field="minify"]') as HTMLSelectElement;
    this.encodeSelect = this.querySelector('[data-field="encode"]') as HTMLSelectElement;
    this.collapseCheckbox = this.querySelector('[data-field="collapse"]') as HTMLInputElement;
    this.messageEl = this.querySelector('[data-field="message"]') as HTMLElement;
    this.tabButtons = this.querySelectorAll<HTMLButtonElement>('[data-tab]');
    this.panels = this.querySelectorAll<HTMLElement>('[data-panel]');
    // decode initial code attribute
    const encoded = this.dataset.code;
    if (encoded && this.editor) {
      this.editor.value = decodeURIComponent(encoded);
    }
  }

  private bindEvents() {
    this.addEventListener('input', () => this.scheduleSave());
    this.addEventListener('editor-change', () => this.scheduleSave());
    this.querySelector('[data-action="convert"]')?.addEventListener('click', () => this.handleConvert());
    this.querySelector('[data-action="copy"]')?.addEventListener('click', () => this.handleCopy());
    this.querySelector('[data-action="format"]')?.addEventListener('click', () => this.editor.formatCode());
    this.tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => this.setActiveTab(btn.dataset.tab as Tab, true));
      btn.addEventListener('keydown', (event) => this.handleTabKeydown(event, btn));
    });
    window.addEventListener('hashchange', this.handleHashChange);
  }

  private handleTabKeydown(event: KeyboardEvent, btn: HTMLButtonElement) {
    const buttons = Array.from(this.tabButtons);
    const index = buttons.indexOf(btn);
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      buttons[(index + 1) % buttons.length].focus();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      buttons[(index - 1 + buttons.length) % buttons.length].focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      buttons[0].focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      buttons[buttons.length - 1].focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.setActiveTab(btn.dataset.tab as Tab, true);
    }
  }

  private handleHashChange = () => {
    this.syncTabWithHash(false);
  };

  private get currentState(): StudioState {
    return {
      name: this.nameInput?.value || defaultState.name,
      code: this.editor?.value || '',
      wrap: (this.wrapSelect?.value as WrapMode) || defaultState.wrap,
      minify: (this.minifySelect?.value as MinifyMode) || defaultState.minify,
      encode: (this.encodeSelect?.value as EncodeMode) || defaultState.encode,
      collapse: this.collapseCheckbox?.checked ?? defaultState.collapse,
      tab: (this.getActiveTab() ?? defaultState.tab) as Tab,
    };
  }

  private restoreState() {
    const storedRaw = localStorage.getItem(STORAGE_KEY);
    const base = {
      ...defaultState,
      name: this.dataset.name ?? defaultState.name,
      code: this.dataset.code ? decodeURIComponent(this.dataset.code) : '',
    };
    let restored: StudioState = base;
    if (storedRaw) {
      try {
        const parsed = JSON.parse(storedRaw);
        restored = { ...base, ...parsed };
      } catch (e) {
        console.warn('Failed to parse stored state', e);
      }
    }
    this.applyState(restored);
  }

  private applyState(state: StudioState) {
    this.nameInput.value = state.name;
    this.editor.value = state.code;
    this.wrapSelect.value = state.wrap;
    this.minifySelect.value = state.minify;
    this.encodeSelect.value = state.encode;
    this.collapseCheckbox.checked = state.collapse;
    this.setActiveTab(state.tab, false);
  }

  private scheduleSave() {
    if (this.saveTimer) window.clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => this.persist(), 300);
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentState));
    } catch (error) {
      console.warn('localStorage is not available', error);
    }
  }

  private getOptions(): TransformOptions {
    const state = this.currentState;
    return {
      wrap: state.wrap,
      minify: state.minify,
      encode: state.encode,
      collapseNewlines: state.collapse,
    };
  }

  private async handleConvert() {
    this.setMessage('', 'muted');
    try {
      const result = await buildBookmarklet(this.currentState.code, this.getOptions());
      this.output.setResult(result, this.currentState.name);
      this.setMessage('生成しました。コピーまたはドラッグしてください。', 'success');
      this.scheduleSave();
    } catch (error) {
      this.setMessage(`変換に失敗しました: ${(error as Error).message}`, 'error');
    }
  }

  private async handleCopy() {
    const text =
      this.output.querySelector<HTMLTextAreaElement>('[data-role="output-text"]')?.value ?? '';
    if (!text) {
      this.setMessage('生成結果がありません。先に変換してください。', 'error');
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = this.output.querySelector<HTMLTextAreaElement>('[data-role="output-text"]');
        textarea?.select();
        document.execCommand('copy');
      }
      this.setMessage('コピーしました。', 'success');
    } catch (error) {
      this.setMessage('コピーに失敗しました。手動で選択してコピーしてください。', 'error');
    }
  }

  private setMessage(text: string, state: 'success' | 'error' | 'muted') {
    this.messageEl.dataset.state = state;
    this.messageEl.textContent = text;
  }

  private setActiveTab(tab: Tab, pushHash: boolean) {
    this.tabButtons.forEach((btn) => {
      const isActive = btn.dataset.tab === tab;
      btn.setAttribute('aria-selected', String(isActive));
      btn.tabIndex = isActive ? 0 : -1;
    });
    this.panels.forEach((panel) => {
      const isActive = panel.dataset.panel === tab;
      if (isActive) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
    if (pushHash) {
      const hash = `#${tab}`;
      if (window.location.hash !== hash) {
        history.pushState(null, '', hash);
      }
      this.scheduleSave();
    }
  }

  private getActiveTab(): Tab {
    const current = Array.from(this.tabButtons).find((btn) => btn.getAttribute('aria-selected') === 'true');
    return (current?.dataset.tab as Tab) ?? defaultState.tab;
  }

  private syncTabWithHash(allowFallbackToStored: boolean) {
    const hashTab = this.hashToTab(window.location.hash);
    if (hashTab) {
      this.setActiveTab(hashTab, false);
      return;
    }
    if (allowFallbackToStored) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as StudioState;
          if (parsed.tab) {
            this.setActiveTab(parsed.tab, false);
            return;
          }
        } catch {
          // ignore
        }
      }
    }
    this.setActiveTab(defaultState.tab, false);
  }

  private hashToTab(hash: string): Tab | null {
    if (hash === '#guide') return 'guide';
    if (hash === '#tools' || hash === '') return 'tools';
    return null;
  }
}

if (!customElements.get('bookmarklet-studio')) {
  customElements.define('bookmarklet-studio', BookmarkletStudio);
}
