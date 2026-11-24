import { escapeHTML } from './dom.mjs';
import { GHOST_BY_ID } from '../core/index.mjs';

let wired = false;
let currentReport = null;

/**
 * Grimoire editor: textarea + highlight backdrop + line-number gutter.
 * Lines do not wrap, so the gutter and the backdrop stay aligned with the textarea.
 * Double-clicking (or Alt+Enter) inside a cursed word opens its exorcism card.
 */
export function initEditor(textarea, overlay, gutter, report, onFindingPick) {
  currentReport = report;
  renderHighlights(overlay, textarea.value, report);
  renderLineNumbers(gutter, textarea.value, report);
  syncScroll(textarea, overlay, gutter);
  if (wired) return;
  wired = true;
  textarea.addEventListener('scroll', () => syncScroll(textarea, overlay, gutter));
  const pick = () => {
    const f = findingAtCaret(textarea, currentReport);
    if (f && onFindingPick) onFindingPick(f);
  };
  textarea.addEventListener('dblclick', pick);
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.altKey) { e.preventDefault(); pick(); }
  });
}

function syncScroll(textarea, overlay, gutter) {
  overlay.scrollTop = textarea.scrollTop;
  overlay.scrollLeft = textarea.scrollLeft;
  gutter.scrollTop = textarea.scrollTop;
}

function findingAtCaret(textarea, report) {
  if (!report) return null;
  const pos = textarea.selectionStart;
  const before = textarea.value.slice(0, pos);
  const lineIndex = before.split('\n').length - 1;
  const col = pos - (before.lastIndexOf('\n') + 1);
  const onLine = report.findings.filter((f) => f.lineIndex === lineIndex);
  return onLine.find((f) => col >= f.start && col <= f.end && f.ghostId !== 'wandering-soul')
    || onLine.find((f) => col >= f.start && col <= f.end) || null;
}

function renderHighlights(overlay, text, report) {
  const lines = text.split('\n');
  const html = lines.map((line, lineIndex) => {
    // the Wandering Soul spans the whole line: tint the line instead of marking it
    const all = report.findings.filter((f) => f.lineIndex === lineIndex);
    const wandering = all.some((f) => f.ghostId === 'wandering-soul');
    const marks = all.filter((f) => f.ghostId !== 'wandering-soul').sort((a, b) => a.start - b.start);
    let out = '';
    let last = 0;
    for (const f of marks) {
      if (f.start < last) continue; // overlapping hit: keep the first
      const color = (GHOST_BY_ID[f.ghostId] || {}).color || '#b48cff';
      out += escapeHTML(line.slice(last, f.start));
      out += `<mark style="--ghost:${color}">${escapeHTML(line.slice(f.start, f.end))}</mark>`;
      last = f.end;
    }
    out += escapeHTML(line.slice(last));
    return wandering ? `<span class="wandering-line">${out || ' '}</span>` : out;
  }).join('\n');
  overlay.innerHTML = html + '\n';
}

function renderLineNumbers(gutter, text, report) {
  const haunted = new Set(report.findings.map((f) => f.lineIndex));
  gutter.innerHTML = text.split('\n')
    .map((_, i) => `<span${haunted.has(i) ? ' class="haunted"' : ''}>${i + 1}</span>`)
    .join('\n') + '\n';
}
