// Pequeno helper para chamar a API. Lança um Error com a mensagem do servidor quando falha.
async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !path.startsWith('/api/auth/')) {
    window.location.href = '/login';
    throw new Error('Sessão expirada.');
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.error || `Erro ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return data;
}
