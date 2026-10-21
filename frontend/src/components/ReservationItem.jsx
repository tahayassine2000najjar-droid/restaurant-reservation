import { useEffect, useState } from 'react';

export default function ReservationItem({ item, onAccept, onDecline, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  // Safety net: never leave a row stuck in "confirm" mode.
  useEffect(() => {
    if (!confirming) return undefined;
    const t = setTimeout(() => setConfirming(false), 8000);
    return () => clearTimeout(t);
  }, [confirming]);

  async function handleDelete() {
    if (busy) return;

    // First click: ask for confirmation inside the row (no popup).
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setBusy(true);
    try {
      const ok = await onDelete(item);
      if (ok !== false) setConfirming(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr>
      <td>{item.date}</td>
      <td>{item.time}</td>
      <td>
        {item.customerName}
        {item.email && <div className="muted">{item.email}</div>}
      </td>
      <td>{item.phone}</td>
      <td>{item.guests}</td>
      <td>
        <span className={`badge badge-${item.status}`}>{item.status}</span>
      </td>
      <td className="notes">{item.notes || '—'}</td>
      <td className="actions">
        {item.status !== 'confirmed' && (
          <button type="button" className="btn btn-primary" onClick={() => onAccept(item)}>
            Accept
          </button>
        )}
        {item.status !== 'cancelled' && (
          <button type="button" className="btn btn-danger" onClick={() => onDecline(item)}>
            Decline
          </button>
        )}

        {confirming ? (
          <>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={busy}
            >
              {busy ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setConfirming(false)}
              disabled={busy}
            >
              No
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            title="Delete this reservation permanently"
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  );
}
