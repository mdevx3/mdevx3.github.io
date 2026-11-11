/* =============================================
   THEME SWITCH
   Deep black is the default. The inline script in each page's <head>
   applies the saved choice before first paint (no flash); this module wires
   the nav switch, saves the choice and announces it with a 'themechange'
   event so the 3D scene can swap its materials.
   Expected markup: <button class="theme-toggle"> (rendered by site-chrome.js)
   ============================================= */

const STORAGE_KEY = 'theme';
const root = document.documentElement;

function applyTheme(theme, button, announce) {
  root.dataset.theme = theme;
  const next = theme === 'dark' ? 'light' : 'dark';
  button.setAttribute('aria-label', `Switch to ${next} theme`);
  button.setAttribute('title', `Switch to ${next} theme`);
  if (announce) document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

/** @param {HTMLButtonElement} button */
export function initThemeToggle(button) {
  applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark', button, false);
  button.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next, button, true);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* private mode: works for this visit */ }
  });
}
