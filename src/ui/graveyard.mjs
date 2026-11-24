import { GHOST_BY_ID, GHOSTS } from '../core/index.mjs';
import { ghostSVG } from './ghost-art.mjs';
import { escapeHTML } from './dom.mjs';

export function renderGraveyard(container, report, onGhostClick) {
  const tombstonesContainer = container.querySelector('.tombstones');
  if (!tombstonesContainer) return;
  
  tombstonesContainer.innerHTML = '';
  
  const relevantLines = report.lines.filter(line => 
    line.type === 'requirement' || line.type === 'userStory'
  );
  
  relevantLines.forEach(line => {
    const lineFindings = report.findings.filter(f => f.lineIndex === line.index);
    const tombstone = createTombstone(line, lineFindings, onGhostClick);
    tombstonesContainer.appendChild(tombstone);
  });
}

function createTombstone(line, findings, onGhostClick) {
  const tombstone = document.createElement('div');
  tombstone.className = 'tombstone' + (findings.length === 0 ? ' at-rest' : '');
  
  const label = document.createElement('div');
  label.className = 'tombstone-label';
  label.textContent = `L${line.index + 1}`;
  
  const text = document.createElement('div');
  text.className = 'tombstone-text';
  text.textContent = truncate(line.text, 28);
  
  tombstone.appendChild(label);
  tombstone.appendChild(text);
  
  if (findings.length > 0) {
    const ghostsContainer = document.createElement('div');
    ghostsContainer.className = 'ghosts';
    
    const maxGhosts = 3;
    const visibleFindings = findings.slice(0, maxGhosts);
    
    visibleFindings.forEach((finding, index) => {
      const ghost = createGhost(finding, onGhostClick);
      ghostsContainer.appendChild(ghost);
    });
    
    if (findings.length > maxGhosts) {
      const badge = document.createElement('span');
      badge.className = 'ghost-badge';
      badge.textContent = `+${findings.length - maxGhosts}`;
      ghostsContainer.appendChild(badge);
    }
    
    tombstone.appendChild(ghostsContainer);
  }
  
  return tombstone;
}

function createGhost(finding, onGhostClick) {
  const button = document.createElement('button');
  button.className = 'ghost';
  button.type = 'button';
  button.setAttribute('role', 'button');
  button.setAttribute('tabindex', '0');
  button.setAttribute('aria-label', 
    `${getGhostName(finding.ghostId)} haunting line ${finding.lineIndex + 1}: ${finding.match}`
  );
  
  const ghostInfo = getGhostInfo(finding.ghostId);
  button.innerHTML = ghostSVG(ghostInfo.silhouette, ghostInfo.color, 40);
  
  button.addEventListener('click', () => onGhostClick(finding));
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onGhostClick(finding);
    }
  });
  
  return button;
}

function getGhostInfo(ghostId) {
  return GHOST_BY_ID[ghostId] || GHOSTS[0];
}

function getGhostName(ghostId) {
  return getGhostInfo(ghostId).name;
}

function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 1) + '…';
}
