import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Reservations from './pages/Reservations.jsx';
import Login from './pages/Login.jsx';
import Team from './pages/Team.jsx';
import { loadSession, saveSession, clearSession } from './auth.js';

export default function App() {
  const [page, setPage] = useState('home');
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

  function renderPage() {
    // Signed-in reception staff only ever reach the reservations dashboard.
    if (session) {
      return <Team session={session} onLogout={handleLogout} />;
    }

    if (page === 'reservations') {
      return <Reservations />;
    }

    if (page === 'team' || page === 'login') {
      return <Login onLogin={handleLogin} />;
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
