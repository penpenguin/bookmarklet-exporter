import { TextDecoder, TextEncoder } from 'node:util';

if (!globalThis.TextEncoder) {
  // jsdom にはブラウザ実装がないので Node の実装を利用する
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).TextEncoder = TextEncoder;
}
if (!globalThis.TextDecoder) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).TextDecoder = TextDecoder;
}
