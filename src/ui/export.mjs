import { escapeHTML } from './dom.mjs';

export function showExportDialog(dialog, kiroText) {
  const preview = dialog.querySelector('.export-preview');
  preview.textContent = kiroText;
  
  const downloadBtn = dialog.querySelector('#download-md');
  const copyBtn = dialog.querySelector('#copy-text');
  const shareBtn = dialog.querySelector('#copy-share');
  const closeBtn = dialog.querySelector('#close-export');
  
  downloadBtn.onclick = () => downloadFile(kiroText);
  copyBtn.onclick = () => copyToClipboard(kiroText);
  shareBtn.onclick = () => copyShareLink(kiroText);
  closeBtn.onclick = () => dialog.close();
  
  dialog.showModal();
}

function downloadFile(text) {
  const blob = new Blob([text], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'requirements.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('Copied to clipboard');
  } catch (err) {
    showToast('Failed to copy');
  }
  document.body.removeChild(textarea);
}

function copyShareLink(text) {
  const base64 = base64URLEncode(text);
  const url = window.location.origin + window.location.pathname + '#s=' + base64;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('Share link copied');
    }).catch(() => {
      fallbackCopy(url);
    });
  } else {
    fallbackCopy(url);
  }
}

function base64URLEncode(str) {
  const utf8Bytes = new TextEncoder().encode(str);
  const base64 = btoa(String.fromCharCode(...utf8Bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.hidden = false;
    setTimeout(() => {
      toast.hidden = true;
    }, 2000);
  }
}
