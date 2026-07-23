import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/Login";
import UpdatePassword from "./pages/UpdatePassword.jsx"; 

function AdminRoute() {
  // 'adminUser' yerine 'token' varlığını kontrol ediyoruz
  const hasAdminSession = Boolean(localStorage.getItem('token'));

  return hasAdminSession
    ? <Home adminMode />
    : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={<AdminRoute />}
        />
        <Route path="/update-password" element={<UpdatePassword />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;