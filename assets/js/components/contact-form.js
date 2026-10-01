/* =============================================
   CONTACT FORM
   Posts to Web3Forms (access key + honeypot live in the form's hidden
   inputs). Adds inline validation, an aria-live status message and a
   disabled/busy state while sending.
   Expected markup per field:
     <div class="form-group">
       <input id="name" name="name" required aria-describedby="name-error">
       <span class="form-error" id="name-error"></span>
     </div>
   plus one <p class="form-status" data-form-status role="status"> in the form.
   ============================================= */

const ENDPOINT = 'https://api.web3forms.com/submit';

const MESSAGES = {
  name: { valueMissing: 'Please enter your name.' },
  email: {
    valueMissing: 'Please enter your email address.',
    typeMismatch: 'That email address doesn’t look right.',
  },
  message: { valueMissing: 'Please write a short message.' },
};

/** @param {HTMLFormElement} form */
export function initContactForm(form) {
  const submit = form.querySelector('.form-submit');
  const status = form.querySelector('[data-form-status]');
  const fields = [...form.querySelectorAll('.form-input, .form-textarea')];
  const submitHTML = submit.innerHTML;

  form.noValidate = true; // we show our own, accessible messages

  const errorEl = (field) => form.querySelector(`#${field.id}-error`);

  function validate(field) {
    const messages = MESSAGES[field.name] || {};
    const key = Object.keys(messages).find((k) => field.validity[k]);
    const text = key ? messages[key] : '';
    field.setAttribute('aria-invalid', String(Boolean(text)));
    const el = errorEl(field);
    if (el) el.textContent = text;
    return !text;
  }

  function setStatus(state, text) {
    status.dataset.state = state;
    status.textContent = text;
  }

  fields.forEach((field) => {
    field.addEventListener('blur', () => { if (field.value) validate(field); });
    field.addEventListener('input', () => { if (field.getAttribute('aria-invalid') === 'true') validate(field); });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('', '');

    const invalid = fields.filter((f) => !validate(f));
    if (invalid.length) { invalid[0].focus(); return; }

    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    submit.textContent = 'Sending…';

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        form.reset();
        setStatus('success', 'Message sent. Thank you, I’ll get back to you soon.');
      } else {
        console.error('Web3Forms error:', data);
        setStatus('error', 'Something went wrong. Please try again or email me directly.');
      }
    } catch (err) {
      console.error('Contact form network error:', err);
      setStatus('error', 'Network error. Please try again or email me directly.');
    } finally {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
      submit.innerHTML = submitHTML;
    }
  });
}
