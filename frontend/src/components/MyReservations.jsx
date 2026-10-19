// MyReservations.jsx - GUEST side: below the form, shows every reservation
// created in THIS browser, with the live status (pending / accepted / declined).
// No login needed: the ids are kept in localStorage (see Reservations.jsx)
// and refreshed from the public GET /api/reservations/:id endpoint.
import { useState, useEffect, useCallback, useRef } from 'react';
import { getReservation } from '../api.js';

// Human-friendly labels for the three statuses.
const LABELS = {
  pending: 'Pending — waiting for the team',
  confirmed: 'Accepted ✔',
  cancelled: 'Declined ✘',
};

const POLL_MS = 10000; // refresh the statuses every 10 seconds

export default function MyReservations({ ids, onRemove }) {
  const [rows, setRows] = useState([]); // the fresh copies from the API
  const alive = useRef(true); // false once the component is unmounted

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // Fetch the latest version of every tracked reservation.
  const load = useCallback(async () => {
    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const row = await getReservation(id);
          return { ...row, id: row._id };
        } catch {
          return { id, missing: true }; // deleted by the team -> forget it
        }
      })
    );

    if (!alive.current) return;

    // Ask the parent to forget reservations that no longer exist.
    results
      .filter((r) => r.missing)
      .forEach((r) => onRemove(r.id));

    setRows(results.filter((r) => !r.missing));
  }, [ids, onRemove]);

  useEffect(() => {
    if (ids.length === 0) {
      setRows([]);
      return;
    }
    load();
    const timer = setInterval(load, POLL_MS);
    window.addEventListener('focus', load); // refresh when the tab is active again
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', load);
    };
  }, [load, ids]);

  // Nothing sent yet -> no section at all.
  if (ids.length === 0) return null;

  return (
    <section className="card my-reservations">
      <h2>My reservations</h2>
      <p className="muted">
        Follow your requests here: the status updates by itself when the team
        accepts or declines them.
      </p>

      {rows.length === 0 && <div className="alert">Loading…</div>}

      <ul className="guest-list">
        {rows.map((row) => (
          <li key={row.id} className="guest-res">
            <div>
              <strong>
                {row.date} at {row.time}
              </strong>
              <div className="muted">
                {row.guests} guest{row.guests > 1 ? 's' : ''} · {row.customerName}
              </div>
            </div>
            <span className={`badge badge-${row.status}`}>
              {LABELS[row.status] || row.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
