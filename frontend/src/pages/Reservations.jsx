import { useState } from 'react';
import ReservationForm from '../components/ReservationForm.jsx';
import TrackReservations from '../components/TrackReservations.jsx';
import { createReservation } from '../api.js';

const PHONE_KEY = 'lastGuestPhone';

export default function Reservations() {
  const [lastCode, setLastCode] = useState(null);
  const [autoPhone, setAutoPhone] = useState(
    () => localStorage.getItem(PHONE_KEY) || ''
  );
  const [autoKey, setAutoKey] = useState(0);

  async function handleSave(form) {
    const created = await createReservation(form);
    localStorage.setItem(PHONE_KEY, form.phone);
    setAutoPhone(form.phone);
    setLastCode(created.bookingCode);
    setAutoKey((k) => k + 1);
  }

  return (
    <main className="layout-single">
      <p className="remark">
        Reservations are taken only from <strong>08:00 to 20:00</strong>, every day.
      </p>

      {lastCode && (
        <div className="alert">
          Thank you! Your request was sent and is waiting for the team's approval.
          <br />
          Your booking code: <strong>{lastCode}</strong> — keep it to find or
          cancel your request (even from another device).
        </div>
      )}

      <ReservationForm onSave={handleSave} />

      <TrackReservations autoPhone={autoPhone} autoKey={autoKey} />
    </main>
  );
}
