
import React, { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  return (
    <>
      {/* Sayfa 'login' ise Login bileşenini göster */}
      {currentPage === 'login' && <Login onNavigate={setCurrentPage} />}

      {/* Sayfa 'register' ise Register bileşenini göster */}
      {currentPage === 'register' && <Register onNavigate={setCurrentPage} />}

      {/* Sayfa 'dashboard' ise Dashboard bileşenini göster */}
      {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
    </>
  );
}

export default App;