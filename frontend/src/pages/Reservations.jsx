import { useState } from 'react';
import ReservationForm from '../components/ReservationForm.jsx';
import TrackReservations from '../components/TrackReservations.jsx';
import { createReservation } from '../api.js';

export default function Reservations() {
  const [lastCode, setLastCode] = useState(null);

  async function handleSave(form) {
    const created = await createReservation(form);
    setLastCode(created.bookingCode);
  }

  return (
    <main className="layout-single">
      <p className="remark">
        Reservations are taken only from <strong>08:00 to 20:00</strong>, every day.
      </p>

      {lastCode && (
        <div className="alert">
          ✔ Your reservation was created successfully! It is now waiting for
          the team's approval.
          <br />
          Your booking code: <strong>{lastCode}</strong> — keep it together with
          your phone number to track, find, or cancel your request (even from
          another device).
        </div>
      )}

      <ReservationForm onSave={handleSave} />

      <TrackReservations />
    </main>
  );
}
