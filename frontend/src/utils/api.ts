const getBaseUrl = (): string => {
  // If explicitly configured via environment variable, use it
  if (import.meta.env.VITE_API_URL) {
    return (import.meta.env.VITE_API_URL as string).replace(/\/+$/, '');
  }

  // When deployed to production (e.g. on Vercel), use relative '/api'
  // to avoid CORS and connect directly to Vercel Serverless Function or rewrites
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return '/api';
  }

  // Default to local backend during development
  return 'http://localhost:8080/api';
};

const BASE_URL = getBaseUrl();

export interface FetchApiOptions extends RequestInit {
  skipCache?: boolean;
  ttlMs?: number;
}

interface CacheEntry {
  data: any;
  expiry: number;
}

// In-memory fast cache
const apiMemoryCache = new Map<string, CacheEntry>();

const getDefaultTtl = (endpoint: string): number => {
  if (endpoint.startsWith('/quran') || endpoint.startsWith('/iqro') || endpoint.startsWith('/doas')) {
    return 30 * 60 * 1000; // 30 minutes for Quran, Iqro, Doas
  }
  if (endpoint.startsWith('/prayer/cities') || endpoint.startsWith('/prayer/qibla')) {
    return 60 * 60 * 1000; // 1 hour for cities and qibla
  }
  if (endpoint.startsWith('/prayer/times')) {
    return 15 * 60 * 1000; // 15 minutes for prayer times
  }
  if (endpoint.startsWith('/masjid')) {
    return 10 * 60 * 1000; // 10 minutes for mosques
  }
  return 2 * 60 * 1000; // 2 minutes default
};

// Clear cache entries matching a prefix
export function invalidateApiCache(prefix?: string) {
  if (!prefix) {
    apiMemoryCache.clear();
    return;
  }
  for (const key of apiMemoryCache.keys()) {
    if (key.includes(prefix)) {
      apiMemoryCache.delete(key);
    }
  }
}

export async function fetchApi<T>(endpoint: string, options: FetchApiOptions = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const token = localStorage.getItem('quranku_token');
  const cacheKey = `${endpoint}_${token ? 'auth' : 'anon'}`;

  // 1. Check in-memory cache for GET requests
  if (isGet && !options.skipCache) {
    const cached = apiMemoryCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data as T;
    }

    // Check session storage for static endpoints
    try {
      if (endpoint.startsWith('/quran/surahs') || endpoint.startsWith('/prayer/cities') || endpoint.startsWith('/doas')) {
        const sessionItem = sessionStorage.getItem(`quranku_cache_${endpoint}`);
        if (sessionItem) {
          const parsed = JSON.parse(sessionItem);
          if (parsed && Date.now() < parsed.expiry) {
            apiMemoryCache.set(cacheKey, parsed);
            return parsed.data as T;
          }
        }
      }
    } catch {
      // ignore storage errors
    }
  }

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

  const resultData = await response.json();

  // 2. Store in cache if it's a successful GET request
  if (isGet && !options.skipCache) {
    const ttl = options.ttlMs || getDefaultTtl(endpoint);
    const entry: CacheEntry = {
      data: resultData,
      expiry: Date.now() + ttl,
    };
    apiMemoryCache.set(cacheKey, entry);

    // Persist static assets in sessionStorage
    try {
      if (endpoint.startsWith('/quran/surahs') || endpoint.startsWith('/prayer/cities') || endpoint.startsWith('/doas')) {
        sessionStorage.setItem(`quranku_cache_${endpoint}`, JSON.stringify(entry));
      }
    } catch {
      // ignore quota exceeded
    }
  } else if (!isGet) {
    // Invalidate related cache on mutation (POST, DELETE, PUT, PATCH)
    if (endpoint.includes('bookmark')) invalidateApiCache('bookmark');
    if (endpoint.includes('prayer-log')) invalidateApiCache('prayer-log');
    if (endpoint.includes('donation')) invalidateApiCache('donation');
  }

  return resultData as T;
}
