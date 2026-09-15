const KEY = 'minicanvas.token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    window.localStorage.setItem(KEY, token);
  } catch {
    // storage can be unavailable in private mode; the session just won't persist
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
