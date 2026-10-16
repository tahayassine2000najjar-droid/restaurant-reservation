// Home.jsx - welcome / landing page.
export default function Home({ onNavigate }) {
  return (
    <section className="hero">
      <h1>Welcome to La Belle Table</h1>
      <p>
        Thank you for choosing us. Book a table in seconds, keep track of your
        guests, and let us take care of the rest.
      </p>
      <button type="button" className="btn btn-primary" onClick={() => onNavigate('reservations')}>
        Make a reservation
      </button>
    </section>
  );
}
