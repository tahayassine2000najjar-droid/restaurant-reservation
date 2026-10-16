// auth.js - remembers the team login in localStorage so it survives a refresh.

export function saveSession({ token, username, role }) {
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
  localStorage.setItem('role', role);
}

// Returns { token, username, role } or null when nobody is logged in.
export function loadSession() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');
  if (!token || !role) return null;
  return { token, username, role };
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
}
