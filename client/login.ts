import { api, byId, errorMessage } from './api.js';
import type { User } from './types.js';

const form = byId<HTMLFormElement>('login-form');
const errorEl = byId('error');
const button = form.querySelector('button')!;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  const data = new FormData(form);
  const email = String(data.get('email') ?? '');
  const password = String(data.get('password') ?? '');

  if (!email || !password) {
    errorEl.textContent = 'Preenche o email e a password.';
    errorEl.hidden = false;
    return;
  }

  button.disabled = true;
  try {
    await api<User>('/api/auth/login', { method: 'POST', body: { email, password } });
    window.location.href = '/';
  } catch (err) {
    errorEl.textContent = errorMessage(err);
    errorEl.hidden = false;
  } finally {
    button.disabled = false;
  }
});
