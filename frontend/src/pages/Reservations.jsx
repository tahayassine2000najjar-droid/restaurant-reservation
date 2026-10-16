// Reservations.jsx - the GUEST page: only the form to ask for a reservation.
// No list, no filter, no status here: the team does that after logging in.
import { useState } from 'react';
import ReservationForm from '../components/ReservationForm.jsx';
import { createReservation } from '../api.js';

export default function Reservations() {
  const [sent, setSent] = useState(false); // true after a successful request

  // A guest can only CREATE a request; the team accepts or declines it later.
  async function handleSave(form) {
    await createReservation(form);
    setSent(true);
  }

  return (
    <main className="layout-single">
      {/* The remark: opening hours for reservations. */}
      <p className="remark">
        Reservations are taken only from <strong>08:00 to 20:00</strong>, every day.
      </p>

      {sent && (
        <div className="alert">
          Thank you! Your request was sent and is waiting for the team's approval.
        </div>
      )}

      <ReservationForm onSave={handleSave} />

      {sent && (
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setSent(false)}>
            Send another request
          </button>
        </div>
      )}
    </main>
  );
}
