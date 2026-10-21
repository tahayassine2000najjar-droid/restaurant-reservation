import { useState, useEffect, useCallback } from 'react';
import ReservationList from '../components/ReservationList.jsx';
import { getReservations, setStatus, deleteReservation } from '../api.js';

export default function Team({ session, onLogout }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await getReservations(
        { date: dateFilter || undefined, search: query || undefined },
        session.token
      );
      setReservations(rows.map((r) => ({ ...r, id: r._id })));
    } catch (err) {
      if (err.status === 401) {
        onLogout();
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

  async function changeStatus(row, status) {
    setError('');
    try {
      await setStatus(row.id, status, session.token);
      await load();
    } catch (err) {
      if (err.status === 401) {
        onLogout();
        return;
      }
      setError(err.message);
    }
  }

  async function remove(row) {
    setError('');
    try {
      await deleteReservation(row.id, session.token);
      await load();
      return true;
    } catch (err) {
      if (err.status === 401) {
        onLogout();
        return false;
      }
      setError(err.message);
      return false;
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
              placeholder="Taha Najjar"
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
          onDelete={remove}
        />
      </section>
    </main>
  );
}
