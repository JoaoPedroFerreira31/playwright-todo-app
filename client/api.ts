// Pequeno helper para chamar a API. Lança um ApiError com a mensagem do servidor quando falha.

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}

export async function api<T = void>(path: string, { method = 'GET', body }: ApiOptions = {}): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !path.startsWith('/api/auth/')) {
    window.location.href = '/login';
    throw new ApiError('Sessão expirada.', 401);
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error || `Erro ${res.status}`, res.status);
  return data as T;
}

/** Mensagem legível de qualquer erro. */
export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** getElementById tipado que falha logo se o elemento não existir. */
export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Elemento #${id} não encontrado`);
  return el as T;
}
