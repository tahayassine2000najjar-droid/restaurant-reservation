// api.js - tiny wrapper around fetch for the two API groups.

const BASE = 'http://localhost:4000/api';

// Every failed response throws an Error that also carries the HTTP status,
// so a page can react to 401 (session expired) for example.
async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed with status ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---- team login ----

// POST /api/auth/login -> { token, username, role }
export async function login(username, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

// ---- reservations ----

// GET /api/reservations?date=YYYY-MM-DD&search=john  (TEAM ONLY, needs the token)
export async function getReservations({ date, search } = {}, token) {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (search) params.set('search', search);
  const url = params.toString()
    ? `${BASE}/reservations?${params.toString()}`
    : `${BASE}/reservations`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

// GET /api/reservations/:id - PUBLIC: a guest uses it to follow HIS OWN
// request (created in this browser) and see when the team accepts/declines.
export async function getReservation(id) {
  const res = await fetch(`${BASE}/reservations/${id}`);
  return handleResponse(res);
}

// POST /api/reservations - PUBLIC: this is how a guest asks for a table.
export async function createReservation(payload) {
  const res = await fetch(`${BASE}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// PATCH /api/reservations/:id/status  (TEAM ONLY)
// status is "confirmed" (accept) or "cancelled" (decline).
export async function setStatus(id, status, token) {
  const res = await fetch(`${BASE}/reservations/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}
