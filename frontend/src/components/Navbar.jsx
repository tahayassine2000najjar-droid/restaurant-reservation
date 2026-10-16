// Navbar.jsx - top navigation. No router: it just calls onNavigate.
// The "Team" link only exists for a logged-in admin or reception.
export default function Navbar({ page, session, onNavigate, onLogout }) {
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

        {session ? (
          <>
            <button
              type="button"
              className={page === 'team' ? 'nav-link active' : 'nav-link'}
              onClick={() => onNavigate('team')}
            >
              Team
            </button>
            <span className="nav-role">
              {session.username} · {session.role}
            </span>
            <button type="button" className="btn btn-ghost" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <button
            type="button"
            className={page === 'login' ? 'nav-link active' : 'nav-link'}
            onClick={() => onNavigate('login')}
          >
            Team login
          </button>
        )}
      </div>
    </nav>
  );
}
