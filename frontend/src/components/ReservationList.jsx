// ReservationList.jsx - table of reservations (one ReservationItem per row).
import ReservationItem from './ReservationItem.jsx';

export default function ReservationList({ items, loading, onEdit, onDelete }) {
  if (loading) return <div className="alert">Loading reservations…</div>;

  if (items.length === 0)
    return <div className="alert">No reservations yet. Create the first one!</div>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Guests</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <ReservationItem
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
