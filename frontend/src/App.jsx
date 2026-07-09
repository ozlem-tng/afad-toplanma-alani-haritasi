import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/Login";
import UpdatePassword from "./pages/UpdatePassword.jsx"; 
import VerifyEntry from "./pages/VerifyLogIn.jsx"; // Keeps your import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/update-password" element={<UpdatePassword />} /> 
        <Route path="/verify-entry" element={<VerifyEntry />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;