import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/Login";
import UpdatePassword from "./pages/UpdatePassword.jsx"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/update-password" element={<UpdatePassword />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;