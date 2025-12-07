import { TransformResult } from '@domain/bookmarklet/transform';

export class BookmarkletOutput extends HTMLElement {
  private textarea!: HTMLTextAreaElement;
  private link!: HTMLAnchorElement;

  connectedCallback() {
    if (this.isConnected && !this.hasChildNodes()) {
      this.render();
    } else {
      this.cacheRefs();
    }
  }

  private render() {
    this.innerHTML = `
      <div class="output-shell">
        <textarea data-role="output-text" class="output" rows="4" readonly aria-label="生成された javascript: URL"></textarea>
        <a data-role="drag-link" class="bookmark-link" draggable="true" href="javascript:void(0)">ドラッグしてブックマーク</a>
      </div>
    `;
    this.cacheRefs();
  }

  private cacheRefs() {
    this.textarea = this.querySelector('[data-role="output-text"]') as HTMLTextAreaElement;
    this.link = this.querySelector('[data-role="drag-link"]') as HTMLAnchorElement;
  }

  setResult(result: TransformResult, name: string) {
    if (!this.textarea || !this.link) {
      this.render();
    }
    this.textarea.value = result.display;
    this.link.textContent = name || 'ブックマークレット';
    this.link.setAttribute('href', result.href);
  }
}

if (!customElements.get('bookmarklet-output')) {
  customElements.define('bookmarklet-output', BookmarkletOutput);
}
