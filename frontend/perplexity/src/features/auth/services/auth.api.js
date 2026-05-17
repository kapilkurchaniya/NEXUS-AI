const API_BASE = import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api/auth`
  : 'https://nexus-ai-two-snowy.vercel.app/api/auth';


async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = data?.message || response.statusText || 'Request failed';
    throw new Error(error);
  }

  return data;
}

export async function register({ email, username, password }) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password }),
  });
}

export async function login({ email, password }) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function forgotPassword({ email }) {
  return request('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword({ token, password }) {
  return request(`/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  });

}

export async function getMe() {
    return request('/get-me');
}

export async function logout() {
  return request('/logout', {
    method: 'POST',
  });
}
