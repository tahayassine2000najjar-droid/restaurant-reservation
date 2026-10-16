// App.jsx - holds the current page + the team session, renders the right page.
import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Reservations from './pages/Reservations.jsx';
import Login from './pages/Login.jsx';
import Team from './pages/Team.jsx';
import { loadSession, saveSession, clearSession } from './auth.js';

export default function App() {
  // Which page: 'home', 'reservations' (guest form), 'login' or 'team'.
  const [page, setPage] = useState('home');
  // The team session ({ token, username, role }) or null when logged out.
  const [session, setSession] = useState(loadSession);

  function handleLogin(data) {
    saveSession(data);
    setSession(data);
    setPage('team');
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    setPage('home');
  }

  // The team page is private: without a session we show the login instead.
  function renderPage() {
    if (page === 'reservations') return <Reservations />;

    if (page === 'team' || page === 'login') {
      if (!session) return <Login onLogin={handleLogin} />;
      return <Team session={session} onLogout={handleLogout} />;
    }

    return <Home session={session} onNavigate={setPage} />;
  }

  return (
    <div className="app">
      <Navbar page={page} session={session} onNavigate={setPage} onLogout={handleLogout} />
      {renderPage()}
    </div>
  );
}
