// Reservations.jsx - the reservations page (form + list + all CRUD state).
import { useState, useEffect, useCallback } from 'react';
import ReservationForm from '../components/ReservationForm.jsx';
import ReservationList from '../components/ReservationList.jsx';
import {
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation,
} from '../api.js';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // reservation being edited (or null)
  const [dateFilter, setDateFilter] = useState(''); // optional ?date= filter

  // Fetch the list from the API. Re-run whenever the date filter changes.
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await getReservations(dateFilter || undefined);
      // Mongo uses _id; give every row an `id` so React keys and props are simple.
      setReservations(rows.map((r) => ({ ...r, id: r._id })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Create or update, then refresh the table so it stays in sync.
  async function handleSave(form) {
    if (editing) {
      await updateReservation(editing.id, form);
    } else {
      await createReservation(form);
    }
    setEditing(null);
    await load();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this reservation?')) return;
    setError('');
    try {
      await deleteReservation(id);
      if (editing && editing.id === id) setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="layout">
      <section className="panel">
        <ReservationForm
          onSave={handleSave}
          editing={editing}
          onCancel={() => setEditing(null)}
        />
      </section>

      <section className="panel">
        <div className="list-header">
          <h2>Reservations</h2>
          <label className="date-filter">
            Filter by date
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </label>
          {dateFilter && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setDateFilter('')}
            >
              Clear
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <ReservationList
          items={reservations}
          loading={loading}
          onEdit={setEditing}
          onDelete={handleDelete}
        />
      </section>
    </main>
  );
}
