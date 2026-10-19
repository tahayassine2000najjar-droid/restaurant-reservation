// Reservations.jsx - the GUEST page: the form to ask for a reservation,
// and BELOW it the "Track my reservation" box: the guest follows his own
// requests (pending / accepted / declined) with his phone number, from
// any device. No account needed.
import { useState, useCallback } from 'react';
import ReservationForm from '../components/ReservationForm.jsx';
import TrackReservations from '../components/TrackReservations.jsx';
import { createReservation } from '../api.js';

// The phone of the last booking is remembered in this browser, so the
// track box below is already filled (and searched) when the guest comes
// back or books again.
const PHONE_KEY = 'lastGuestPhone';

export default function Reservations() {
  const [lastCode, setLastCode] = useState(null); // bookingCode of the last request
  const [autoPhone, setAutoPhone] = useState(
    () => localStorage.getItem(PHONE_KEY) || ''
  );
  const [autoKey, setAutoKey] = useState(0); // changed -> track box searches again

  // A guest can only CREATE a request; the team accepts or declines it later.
  async function handleSave(form) {
    const created = await createReservation(form); // { id, bookingCode, status... }
    localStorage.setItem(PHONE_KEY, form.phone);
    setAutoPhone(form.phone);
    setLastCode(created.bookingCode);
    setAutoKey((k) => k + 1); // tell the track box to search again
  }

  // Nothing to keep: only the phone is remembered (no reservation id).
  const clearPhone = useCallback(() => {
    localStorage.removeItem(PHONE_KEY);
    setAutoPhone('');
  }, []);

  return (
    <main className="layout-single">
      {/* The remark: opening hours for reservations. */}
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

      {/* Below the form: find his requests with phone (+ booking code). */}
      <TrackReservations autoPhone={autoPhone} autoKey={autoKey} />

      {autoPhone && (
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={clearPhone}>
            Forget my phone number on this device
          </button>
        </div>
      )}
    </main>
  );
}
