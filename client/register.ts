import { api, byId, errorMessage } from './api.js';
import type { User } from './types.js';

const form = byId<HTMLFormElement>('register-form');
const errorEl = byId('error');
const button = form.querySelector('button')!;

function showError(message: string): void {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  const data = new FormData(form);
  const name = String(data.get('name') ?? '');
  const email = String(data.get('email') ?? '');
  const password = String(data.get('password') ?? '');
  const confirm = String(data.get('confirm') ?? '');

  if (password !== confirm) return showError('As passwords não coincidem.');

  button.disabled = true;
  try {
    await api<User>('/api/auth/register', { method: 'POST', body: { name, email, password } });
    window.location.href = '/';
  } catch (err) {
    showError(errorMessage(err));
  } finally {
    button.disabled = false;
  }
});
