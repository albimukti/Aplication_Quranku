const BASE_URL = 'http://localhost:8080/api';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('quranku_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'Terjadi kesalahan pada server';
    try {
      const data = await response.json();
      if (data.error) errorMsg = data.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
