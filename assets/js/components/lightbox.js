/* =============================================
   FIGURE LIGHTBOX
   Click (or press Enter on) any image inside a .figure-card to view it
   full size. Built on a native <dialog>, so focus is trapped, Escape closes
   it and focus returns to the image automatically.
   Markup: <div class="figure-card"><img ...><div class="figure-cap">...</div></div>
   ============================================= */

/** @param {HTMLElement} scope any container holding .figure-card elements */
export function initLightbox(scope) {
  const cards = [...scope.querySelectorAll('.figure-card')];
  if (!cards.length || typeof HTMLDialogElement === 'undefined') return;

  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Enlarged figure');
  dialog.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Close">&times;</button>
    <img class="lightbox-img" src="" alt="">
    <div class="lightbox-caption"></div>`;
  document.body.appendChild(dialog);

  const img = dialog.querySelector('.lightbox-img');
  const caption = dialog.querySelector('.lightbox-caption');

  function open(source, captionHTML) {
    img.src = source.currentSrc || source.src;
    img.alt = source.alt;
    caption.innerHTML = captionHTML;
    document.documentElement.classList.add('scroll-lock');
    dialog.showModal();
  }

  cards.forEach((card) => {
    const thumb = card.querySelector('img');
    if (!thumb) return;
    const cap = card.querySelector('.figure-cap');
    const show = () => open(thumb, cap ? cap.innerHTML : '');

    // Make the image operable by keyboard and announced as a button
    thumb.tabIndex = 0;
    thumb.setAttribute('role', 'button');
    thumb.setAttribute('aria-label', `Enlarge: ${thumb.alt}`);
    thumb.addEventListener('click', show);
    thumb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); }
    });
  });

  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  // A click on the backdrop targets the <dialog> element itself
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => document.documentElement.classList.remove('scroll-lock'));
}
