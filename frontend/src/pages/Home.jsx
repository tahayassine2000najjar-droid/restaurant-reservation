
export default function Home({ session, onNavigate }) {
  return (
    <section className="hero">
      <h1>Welcome to La Belle Table</h1>
      <p>
        Thank you for choosing us. Book a table in seconds, or manage the
        evening's reservations if you are part of the team.
      </p>

      <div className="entry-cards">
        <button
          type="button"
          className="entry-card"
          onClick={() => onNavigate('reservations')}
        >
          <h3>I am a guest</h3>
          <p>Send a reservation request in a few seconds.</p>
        </button>

        <button
          type="button"
          className="entry-card"
          onClick={() => onNavigate(session ? 'team' : 'login')}
        >
          <h3>Restaurant team</h3>
          <p>Login to search, filter, accept or decline reservations.</p>
        </button>
      </div>
    </section>
  );
}
