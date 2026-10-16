// ReservationForm.jsx - one form used for BOTH create and edit.
import { useState, useEffect } from 'react';

// Empty shape used when creating a new reservation.
const EMPTY = {
  customerName: '',
  phone: '',
  email: '',
  date: '',
  time: '19:00',
  guests: 2,
  notes: '',
  status: 'pending',
};


function validate(form) {
  if (!form.customerName.trim()) return 'Customer name is required';
  if (!form.phone.trim()) return 'Phone is required';
  const digits = form.phone.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return 'Phone must be 7-15 digits';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    return 'Email format is invalid';
  if (!form.date) return 'Date is required';
  if (form.date < new Date().toISOString().slice(0, 10)) return 'Date cannot be in the past';
  const [h, m] = form.time.split(':').map(Number);
  if (h * 60 + m < 12 * 60 || h * 60 + m > 23 * 60)
    return 'Time must be between 12:00 and 23:00';
  if (form.guests < 1 || form.guests > 20) return 'Guests must be between 1 and 20';
  return null;
}

export default function ReservationForm({ onSave, editing, onCancel }) {
  // Local form state.
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // When the "editing" prop changes, load that reservation into the form.
  useEffect(() => {
    if (editing) {
      setForm({
        customerName: editing.customerName,
        phone: editing.phone,
        email: editing.email || '',
        date: editing.date,
        time: editing.time,
        guests: editing.guests,
        notes: editing.notes || '',
        status: editing.status,
      });
    } else {
      setForm(EMPTY);
    }
  }, [editing]);


  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }


  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate(form);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave(form);
      if (!editing) setForm(EMPTY);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{editing ? `Edit reservation #${editing.id}` : 'New reservation'}</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <label>
        Customer name *
        <input
          name="customerName"
          value={form.customerName}
          onChange={handleChange}
          placeholder="Jane Doe"
        />
      </label>

      <label>
        Phone *
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="+1 555 123 4567"
        />
      </label>

      <label>
        Email (optional)
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="jane@example.com"
        />
      </label>

      <div className="row">
        <label>
          Date *
          <input type="date" name="date" value={form.date} onChange={handleChange} />
        </label>

        <label>
          Time *
          <input type="time" name="time" value={form.time} onChange={handleChange} />
        </label>

        <label>
          Guests *
          <input
            type="number"
            name="guests"
            min="1"
            max="20"
            value={form.guests}
            onChange={handleChange}
          />
        </label>
      </div>

      <label>
        Status
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>

      <label>
        Notes (optional)
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Allergies, birthday, window seat…"
        />
      </label>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : editing ? 'Update reservation' : 'Create reservation'}
        </button>
        {editing && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel edit
          </button>
        )}
      </div>
    </form>
  );
}
