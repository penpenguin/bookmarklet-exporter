import 'monaco-editor/min/vs/editor/editor.main.css';

const workerMap: Record<string, string> = {
  json: './json.worker.js',
  javascript: './ts.worker.js',
  typescript: './ts.worker.js',
  default: './editor.worker.js',
};

export async function mountMonaco(
  host: HTMLElement,
  initialValue: string,
  onChange: (value: string) => void,
) {
  const monaco = await import('monaco-editor');

  self.MonacoEnvironment = {
    getWorker(_: string, label: string) {
      const file = workerMap[label] ?? workerMap.default;
      return new Worker(new URL(file, import.meta.url), { type: 'module' });
    },
  };

  const editor = monaco.editor.create(host, {
    value: initialValue,
    language: 'javascript',
    automaticLayout: true,
    minimap: { enabled: false },
    theme: 'vs-dark',
  });

  const subscription = editor.onDidChangeModelContent(() => {
    onChange(editor.getValue());
  });

  const format = async () => {
    const action = editor.getAction('editor.action.formatDocument');
    if (action) {
      await action.run();
    }
  };

  return {
    dispose() {
      subscription.dispose();
      editor.dispose();
    },
    format,
    getValue: () => editor.getValue(),
    setValue: (v: string) => editor.setValue(v),
  };
}
