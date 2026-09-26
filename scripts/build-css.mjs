// index.html 에서 쓰는 Tailwind 클래스만 뽑아 CSS로 만든 뒤,
// TAILWIND-OFFLINE-START ~ END 사이에 넣어 줍니다. (인터넷이 안 되는 학교망/체육관 대비)
// 사용법: npm install && npm run build:css
import fs from 'node:fs';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

const file = new URL('../index.html', import.meta.url);
const html = fs.readFileSync(file, 'utf8');
const START = '<!-- TAILWIND-OFFLINE-START';
const END = '<!-- TAILWIND-OFFLINE-END -->';
const a = html.indexOf(START), b = html.indexOf(END);
if (a < 0 || b < 0) throw new Error('TAILWIND-OFFLINE 표시를 찾을 수 없어요.');
const headerEnd = html.indexOf('-->', a) + 3;
const scanned = html.slice(0, a) + html.slice(b + END.length);

const result = await postcss([tailwindcss({ content: [{ raw: scanned, extension: 'html' }] })])
  .process('@tailwind base;@tailwind components;@tailwind utilities;', { from: undefined });
const css = result.css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s*([{};:,>])\s*/g, '$1').replace(/;}/g, '}');

const out = html.slice(0, headerEnd) + '\n    <style id="tailwind-offline">' + css + '</style>\n    ' + html.slice(b);
fs.writeFileSync(file, out);
console.log(`내장 CSS ${(css.length / 1024).toFixed(1)}KB 를 index.html 에 넣었어요.`);
