import { useState, useEffect, useRef } from 'react';
import { trackReservations, guestCancel } from '../api.js';

const LABELS = {
  pending: 'Pending — waiting for the team',
  confirmed: 'Accepted ✔',
  cancelled: 'Declined ✘',
};

export default function TrackReservations() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [rows, setRows] = useState([]);
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  async function search(targetPhone, targetCode) {
    const p = targetPhone.trim();
    const c = targetCode.trim();
    if (!p || !c) {
      setError('Enter both your phone number and your booking code');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const found = await trackReservations(p, c);
      if (!alive.current) return;
      setRows(found);
      setSearched(true);
    } catch (err) {
      if (!alive.current) return;
      setError(err.message);
    } finally {
      if (alive.current) setBusy(false);
    }
  }

  async function cancel(row) {
    const ok = window.confirm(
      `Cancel the reservation ${row.bookingCode} (${row.date} at ${row.time})?`
    );
    if (!ok) return;
    setBusy(true);
    setError('');
    try {
      await guestCancel(row.id, phone);
      await search(phone, code);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card my-reservations">
      <h2>Track my reservation</h2>
      <p className="muted">
        Enter the phone number and the booking code you received when booking —
        no account needed, it works on any device.
      </p>

      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          search(phone, code);
        }}
      >
        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Phone number
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 123 4567"
          />
        </label>

        <label>
          Booking code
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="R-7K2QM"
          />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Searching…' : 'Find my reservations'}
          </button>
        </div>
      </form>

      {searched && !busy && rows.length === 0 && (
        <div className="alert">
          No reservation found for this phone number and booking code.
        </div>
      )}

      <ul className="guest-list">
        {rows.map((row) => (
          <li key={row.id} className="guest-res">
            <div>
              <strong>
                {row.date} at {row.time}
              </strong>
              <div className="muted">
                {row.guests} guest{row.guests > 1 ? 's' : ''} · {row.customerName}
                {' · '}code {row.bookingCode}
              </div>
            </div>
            <span className={`badge badge-${row.status}`}>
              {LABELS[row.status] || row.status}
            </span>
            {row.status === 'pending' && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => cancel(row)}
                disabled={busy}
              >
                Cancel
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
