import { analyze, exorcise, exorciseAll, toKiroRequirements, GHOSTS } from '../core/index.mjs';
import { initEditor } from './editor.mjs';
import { renderMeter } from './meter.mjs';
import { renderGraveyard } from './graveyard.mjs';
import { showExorcismCard } from './card.mjs';
import { renderBestiary, toggleBestiary } from './bestiary.mjs';
import { showExportDialog } from './export.mjs';
import { renderSamples, getSample } from './samples.mjs';
import { toggleSound, playExorciseSound, isSoundEnabled } from './sound.mjs';

const STORAGE_KEY = 'haunted-spec:text';
const MAX_HISTORY = 50;

let state = {
  text: '',
  report: null,
  history: []
};

let debounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  const grimoire = document.getElementById('grimoire');
  const overlay = document.querySelector('.highlight-overlay');
  const lineNumbers = document.querySelector('.line-numbers');
  const hauntMeter = document.getElementById('haunt-meter');
  const graveyard = document.getElementById('graveyard');
  const exorcismCard = document.getElementById('exorcism-card');
  const bestiaryAside = document.getElementById('bestiary');
  const bestiaryContent = document.querySelector('.bestiary-content');
  const exportDialog = document.getElementById('export-dialog');
  const sampleMenu = document.getElementById('sample-menu');
  
  const exorciseAllBtn = document.getElementById('exorcise-all');
  const undoBtn = document.getElementById('undo');
  const toggleBestiaryBtn = document.getElementById('toggle-bestiary');
  const closeBestiaryBtn = document.getElementById('close-bestiary');
  const exportBtn = document.getElementById('export');
  const toggleSoundBtn = document.getElementById('toggle-sound');
  
  const initialText = loadInitialText();
  state.text = initialText;
  grimoire.value = initialText;
  
  analyzeAndRender();
  
  grimoire.addEventListener('input', () => {
    state.text = grimoire.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      analyzeAndRender();
      saveToLocalStorage();
    }, 150);
  });
  
  renderSamples(sampleMenu, (text) => {
    pushHistory();
    state.text = text;
    grimoire.value = text;
    analyzeAndRender();
    saveToLocalStorage();
  });
  
  exorciseAllBtn.addEventListener('click', () => {
    if (state.report && state.report.findings.length > 0) {
      pushHistory();
      state.text = exorciseAll(state.text);
      grimoire.value = state.text;
      analyzeAndRender();
      saveToLocalStorage();
    }
  });
  
  undoBtn.addEventListener('click', () => {
    if (state.history.length > 0) {
      state.text = state.history.pop();
      grimoire.value = state.text;
      analyzeAndRender();
      saveToLocalStorage();
      updateUndoButton();
    }
  });
  
  toggleBestiaryBtn.addEventListener('click', () => {
    const isHidden = bestiaryAside.hidden;
    toggleBestiary(bestiaryAside, isHidden);
  });
  
  closeBestiaryBtn.addEventListener('click', () => {
    toggleBestiary(bestiaryAside, false);
  });
  
  exportBtn.addEventListener('click', () => {
    const kiroText = toKiroRequirements(state.text);
    showExportDialog(exportDialog, kiroText);
  });
  
  toggleSoundBtn.addEventListener('click', () => {
    const enabled = !isSoundEnabled();
    toggleSound(enabled);
    toggleSoundBtn.setAttribute('aria-pressed', enabled);
    toggleSoundBtn.textContent = enabled ? 'Sound: on' : 'Sound: off';
  });
  
  function analyzeAndRender() {
    const previousScore = state.report ? state.report.score : -1;
    state.report = analyze(state.text);
    
    renderMeter(hauntMeter, state.report);
    initEditor(grimoire, overlay, lineNumbers, state.report, (finding) => {
      showExorcismCard(exorcismCard, finding, state.report, handleExorcise, null);
    });
    renderGraveyard(graveyard, state.report, (finding) => {
      showExorcismCard(exorcismCard, finding, state.report, handleExorcise, null);
    });
    renderBestiary(bestiaryContent, GHOSTS, state.report.stats);
    
    if (previousScore > 0 && state.report.score === 0) {
      showPurifiedToast();
    }
  }
  
  function handleExorcise(finding) {
    pushHistory();
    state.text = exorcise(state.text, finding);
    grimoire.value = state.text;
    analyzeAndRender();
    saveToLocalStorage();
    playExorciseSound();
  }
  
  function pushHistory() {
    state.history.push(state.text);
    if (state.history.length > MAX_HISTORY) {
      state.history.shift();
    }
    updateUndoButton();
  }
  
  function updateUndoButton() {
    undoBtn.disabled = state.history.length === 0;
  }
  
  function saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, state.text);
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }
  
  function loadInitialText() {
    const hash = window.location.hash;
    if (hash.startsWith('#s=')) {
      const encoded = hash.substring(3);
      try {
        return base64URLDecode(encoded);
      } catch (e) {
        console.warn('Failed to decode share link', e);
      }
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored;
    } catch (e) {
      console.warn('Failed to load from localStorage', e);
    }
    
    const firstSample = getSample(0);
    return firstSample ? firstSample.text : '';
  }
  
  function base64URLDecode(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }
  
  function showPurifiedToast() {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = 'Purified! Every ghost has been exorcised.';
      toast.hidden = false;
      setTimeout(() => {
        toast.hidden = true;
      }, 3000);
    }
  }
});
