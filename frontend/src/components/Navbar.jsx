import './Navbar.css';
import logo from '../assets/logo.png';
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

function Navbar({ onNavigate }) {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src={logo} alt="AFAD Logo" className="logo" />
        <h2>
          <span>AFAD</span> Afet Toplanma Alanları
        </h2>
      </div>

     <button
  className="admin-btn"
  onClick={() => onNavigate("login")}
>
  <AdminPanelSettingsIcon style={{ fontSize: 20 }} />
  <span>Yönetici</span>
</button>
    </nav>
  );
}

export default Navbar;
