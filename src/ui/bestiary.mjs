import { ghostSVG } from './ghost-art.mjs';
import { escapeHTML } from './dom.mjs';

export function renderBestiary(container, ghosts, stats) {
  container.innerHTML = '';
  
  ghosts.forEach(ghost => {
    const count = stats.byGhost[ghost.id] || 0;
    const entry = createGhostEntry(ghost, count);
    container.appendChild(entry);
  });
}

function createGhostEntry(ghost, count) {
  const entry = document.createElement('div');
  entry.className = 'ghost-entry';
  
  entry.innerHTML = `
    <div class="ghost-header">
      ${ghostSVG(ghost.silhouette, ghost.color, 40)}
      <div class="ghost-name" style="color: ${ghost.color}">${escapeHTML(ghost.name)}</div>
      <div class="ghost-count">${count}</div>
    </div>
    <div class="ghost-summary">${escapeHTML(ghost.summary)}</div>
  `;
  
  return entry;
}

export function toggleBestiary(aside, isOpen) {
  if (isOpen) {
    aside.hidden = false;
  } else {
    aside.hidden = true;
  }
}
