import { APP } from '../config/app.config.js';

/**
 * Persistência 100% local. Qualquer falha de acesso ao localStorage
 * (aba anônima, armazenamento bloqueado) é tolerada: o app segue
 * funcionando em memória.
 */
export function loadState() {
  try {
    const raw = window.localStorage.getItem(APP.storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(APP.storageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearState() {
  try {
    window.localStorage.removeItem(APP.storageKey);
  } catch {
    /* armazenamento indisponível */
  }
}

/** Gera um arquivo .json para backup. */
export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
