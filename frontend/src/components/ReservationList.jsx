
import ReservationItem from './ReservationItem.jsx';

export default function ReservationList({ items, loading, onAccept, onDecline, onDelete }) {
  if (loading) return <div className="alert">Loading reservations…</div>;

  if (items.length === 0)
    return <div className="alert">No reservations found.</div>;

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
            <th>Decision</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <ReservationItem
              key={item.id}
              item={item}
              onAccept={onAccept}
              onDecline={onDecline}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
