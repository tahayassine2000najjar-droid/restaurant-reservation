// App.jsx - holds the current page and renders the navbar + the right page.
import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Reservations from './pages/Reservations.jsx';

export default function App() {
  // Which page is open: 'home' or 'reservations'. This replaces a router.
  const [page, setPage] = useState('home');

  return (
    <div className="app">
      <Navbar page={page} onNavigate={setPage} />

      {page === 'home' ? <Home onNavigate={setPage} /> : <Reservations />}
    </div>
  );
}
