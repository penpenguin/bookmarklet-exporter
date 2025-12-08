import { mountMonaco } from '@monaco/bootstrap';

export class SnippetEditor extends HTMLElement {
  private textarea!: HTMLTextAreaElement;
  private monacoMount!: HTMLDivElement;
  private host!: HTMLDivElement;
  private monacoController:
    | {
        dispose: () => void;
        format: () => Promise<void>;
        getValue: () => string;
        setValue: (v: string) => void;
      }
    | undefined;

  connectedCallback() {
    if (this.hasChildNodes()) {
      this.cache();
    } else {
      this.render();
    }
    // 表示と同時に Monaco を試行（失敗しても textarea フォールバック）
    void this.enableMonaco();
  }

  disconnectedCallback() {
    this.monacoController?.dispose();
  }

  private render() {
    const initial = this.dataset.code ? decodeURIComponent(this.dataset.code) : '';
    this.innerHTML = `
      <div class="editor-shell">
        <div class="monaco-host" hidden></div>
        <textarea data-field="code" class="editor-fallback" spellcheck="false" aria-label="JavaScript コード">${initial}</textarea>
      </div>
    `;
    this.cache();
  }

  private cache() {
    this.host = this.querySelector('.editor-shell') as HTMLDivElement;
    this.monacoMount = this.querySelector('.monaco-host') as HTMLDivElement;
    this.textarea = this.querySelector('[data-field="code"]') as HTMLTextAreaElement;
    this.textarea?.addEventListener('input', () => this.emitChange());
  }

  get value() {
    if (this.monacoController) return this.monacoController.getValue();
    return this.textarea?.value ?? '';
  }

  set value(v: string) {
    if (this.monacoController) {
      this.monacoController.setValue(v);
    } else if (this.textarea) {
      this.textarea.value = v;
    }
  }

  focus() {
    (this.monacoController ? this.host : this.textarea)?.focus();
  }

  private emitChange() {
    this.dispatchEvent(
      new CustomEvent('editor-change', {
        detail: { value: this.value },
        bubbles: true,
      }),
    );
  }

  private async enableMonaco() {
    if (this.monacoController) return;
    try {
      this.monacoMount.hidden = false;
      this.textarea.style.display = 'none';
      this.monacoController = await mountMonaco(this.monacoMount, this.value, (val) => {
        this.textarea.value = val;
        this.emitChange();
      });
      this.textarea.style.display = 'none';
    } catch (error) {
      console.warn('Monaco failed to load, falling back to textarea', error);
      this.monacoMount.hidden = true;
      this.textarea.style.display = '';
    }
  }

  async formatCode() {
    if (this.monacoController) {
      await this.monacoController.format();
      this.emitChange();
      return;
    }
    // fallback: simple trim
    this.textarea.value = this.textarea.value.trim();
    this.emitChange();
  }
}

if (!customElements.get('snippet-editor')) {
  customElements.define('snippet-editor', SnippetEditor);
}
