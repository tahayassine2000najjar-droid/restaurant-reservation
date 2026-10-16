// Team.jsx - PRIVATE page for the restaurant team:
// the list of reservations, a search by name, a filter by date,
// and the Accept / Decline buttons.
import { useState, useEffect, useCallback } from 'react';
import ReservationList from '../components/ReservationList.jsx';
import { getReservations, setStatus } from '../api.js';

export default function Team({ session, onLogout }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // filter by date
  const [search, setSearch] = useState(''); // search by customer name
  const [query, setQuery] = useState(''); // what we actually send (debounced)

  // Wait 400 ms after the last keystroke before searching.
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch the list from the API whenever the filter/search changes.
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await getReservations(
        { date: dateFilter || undefined, search: query || undefined },
        session.token
      );
      // Mongo uses _id; give every row an `id` so React keys are simple.
      setReservations(rows.map((r) => ({ ...r, id: r._id })));
    } catch (err) {
      if (err.status === 401) {
        onLogout(); // token expired -> back to the login page
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, query, session.token, onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  // Accept ("confirmed") or decline ("cancelled") a reservation.
  async function changeStatus(row, status) {
    setError('');
    try {
      await setStatus(row.id, status, session.token);
      await load(); // refresh so the badge updates
    } catch (err) {
      if (err.status === 401) {
        onLogout();
        return;
      }
      setError(err.message);
    }
  }

  return (
    <main>
      <section className="panel">
        <div className="list-header">
          <h2>Reservations</h2>

          <label className="date-filter">
            Search by name
            <input
              type="text"
              placeholder="Jane Doe…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <label className="date-filter">
            Filter by date
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </label>

          {(search || dateFilter) && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setSearch('');
                setDateFilter('');
              }}
            >
              Clear ✕
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <ReservationList
          items={reservations}
          loading={loading}
          onAccept={(row) => changeStatus(row, 'confirmed')}
          onDecline={(row) => changeStatus(row, 'cancelled')}
        />
      </section>
    </main>
  );
}
