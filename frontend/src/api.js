

const BASE_URL = 'http://localhost:4000/api/reservations';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
   
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}


export async function getReservations(date) {
  const url = date ? `${BASE_URL}?date=${encodeURIComponent(date)}` : BASE_URL;
  const res = await fetch(url);
  return handleResponse(res);
}


export async function getReservation(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  return handleResponse(res);
}


export async function createReservation(payload) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateReservation(id, payload) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}


export async function deleteReservation(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}
