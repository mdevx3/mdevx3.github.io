/* =============================================
   THEME TOGGLE
   The initial theme is applied before first paint by the tiny inline script
   in each page's <head> (no flash). This module wires up the switch button:
   it flips <html data-theme>, remembers the choice, and follows the OS
   setting only while the visitor hasn't picked one.
   Expected markup: <button class="theme-toggle"> (rendered by site-chrome.js)
   ============================================= */

const STORAGE_KEY = 'theme';
const root = document.documentElement;
const osLight = window.matchMedia('(prefers-color-scheme: light)');

const readSaved = () => {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
};

function applyTheme(theme, button) {
  root.dataset.theme = theme;
  const next = theme === 'dark' ? 'light' : 'dark';
  button.setAttribute('aria-label', `Switch to ${next} theme`);
  button.setAttribute('title', `Switch to ${next} theme`);
}

/** @param {HTMLButtonElement} button */
export function initThemeToggle(button) {
  applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark', button);

  button.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next, button);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* private mode: still works for this visit */ }
  });

  // No saved choice: keep tracking the OS preference live.
  osLight.addEventListener('change', (e) => {
    if (!readSaved()) applyTheme(e.matches ? 'light' : 'dark', button);
  });
}
