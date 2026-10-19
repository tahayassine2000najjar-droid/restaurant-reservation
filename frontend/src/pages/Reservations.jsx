// Reservations.jsx - the GUEST page: the form to ask for a reservation,
// and BELOW it the requests sent from this browser, so the guest can
// follow the status (pending / accepted / declined) without any login.
import { useState, useCallback } from 'react';
import ReservationForm from '../components/ReservationForm.jsx';
import MyReservations from '../components/MyReservations.jsx';
import { createReservation } from '../api.js';

// The ids of the reservations created in THIS browser are kept in
// localStorage, so the list survives a refresh of the page.
const STORAGE_KEY = 'guestReservationIds';

function loadIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export default function Reservations() {
  const [ids, setIds] = useState(loadIds); // ids created in this browser

  // A guest can only CREATE a request; the team accepts or declines it later.
  async function handleSave(form) {
    const created = await createReservation(form); // the new row (status pending)
    setIds((old) => {
      const next = [...old, created._id];
      saveIds(next);
      return next;
    });
  }

  // The team deleted the reservation on the server -> stop tracking it.
  const removeId = useCallback((id) => {
    setIds((old) => {
      const next = old.filter((x) => x !== id);
      saveIds(next);
      return next;
    });
  }, []);

  return (
    <main className="layout-single">
      {/* The remark: opening hours for reservations. */}
      <p className="remark">
        Reservations are taken only from <strong>08:00 to 20:00</strong>, every day.
      </p>

      <ReservationForm onSave={handleSave} />

      {/* Below the form: the requests sent from this browser + their status. */}
      <MyReservations ids={ids} onRemove={removeId} />
    </main>
  );
}
