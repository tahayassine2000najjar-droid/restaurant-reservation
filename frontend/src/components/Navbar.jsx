// Navbar.jsx - simple top navigation. No router: it just calls onNavigate.
export default function Navbar({ page, onNavigate }) {
  return (
    <nav className="navbar">
      <span className="brand">La Belle Table</span>

      <div className="nav-links">
        <button
          type="button"
          className={page === 'home' ? 'nav-link active' : 'nav-link'}
          onClick={() => onNavigate('home')}
        >
          Home
        </button>
        <button
          type="button"
          className={page === 'reservations' ? 'nav-link active' : 'nav-link'}
          onClick={() => onNavigate('reservations')}
        >
          Reservations
        </button>
      </div>
    </nav>
  );
}
