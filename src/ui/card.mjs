import { GHOST_BY_ID, GHOSTS } from '../core/index.mjs';
import { ghostSVG } from './ghost-art.mjs';
import { escapeHTML } from './dom.mjs';

export function showExorcismCard(dialog, finding, report, onExorcise, onIgnore) {
  const ghostInfo = getGhostInfo(finding.ghostId);
  const line = report.lines[finding.lineIndex];
  
  const content = `
    <div class="card-ghost-header">
      ${ghostSVG(ghostInfo.silhouette, ghostInfo.color, 50)}
      <div class="card-ghost-name" id="card-ghost-name">${escapeHTML(ghostInfo.name)}</div>
    </div>
    
    <div class="card-line">
      Line ${finding.lineIndex + 1}: ${highlightMatch(line.text, finding)}
    </div>
    
    <div class="card-why">
      <strong>Why it haunts you:</strong><br>
      ${escapeHTML(ghostInfo.why)}
    </div>
    
    <div class="card-diff">
      <h4>After exorcism:</h4>
      <div class="diff-old">${escapeHTML(line.text)}</div>
      <div class="diff-new">${escapeHTML(finding.suggestion)}</div>
    </div>
    
    <div class="card-actions">
      <button id="exorcise-btn" type="button">Exorcise</button>
      <button id="ignore-btn" type="button">Leave it</button>
    </div>
  `;
  
  dialog.querySelector('.card-content').innerHTML = content;
  dialog.setAttribute('aria-labelledby', 'card-ghost-name');
  
  const exorciseBtn = dialog.querySelector('#exorcise-btn');
  const ignoreBtn = dialog.querySelector('#ignore-btn');
  
  exorciseBtn.onclick = () => {
    dialog.close();
    onExorcise(finding);
  };
  
  ignoreBtn.onclick = () => {
    dialog.close();
    if (onIgnore) onIgnore();
  };
  
  dialog.showModal();
}

function highlightMatch(text, finding) {
  const before = escapeHTML(text.substring(0, finding.start));
  const match = escapeHTML(text.substring(finding.start, finding.end));
  const after = escapeHTML(text.substring(finding.end));
  return `${before}<mark>${match}</mark>${after}`;
}

function getGhostInfo(ghostId) {
  return GHOST_BY_ID[ghostId] || GHOSTS[0];
}
