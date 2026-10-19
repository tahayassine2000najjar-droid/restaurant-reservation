
export default function ReservationItem({ item, onAccept, onDecline }) {
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
      </td>
    </tr>
  );
}
