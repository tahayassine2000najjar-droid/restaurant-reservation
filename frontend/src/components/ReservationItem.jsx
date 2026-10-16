// ReservationItem.jsx - one table row with Edit / Delete actions.
export default function ReservationItem({ item, onEdit, onDelete }) {
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
        <button type="button" className="btn btn-ghost" onClick={() => onEdit(item)}>
          Edit
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onDelete(item.id)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
