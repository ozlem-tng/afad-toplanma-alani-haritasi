import "../styles/Navbar.css";
import logo from "../assets/logo.png";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

function Navbar({ onNavigate }) {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <img
          src={logo}
          alt="AFAD Logo"
          className="logo"
        />

        <div className="logo-text">
          <h2>AFAD</h2>
          <p>Afet Toplanma Alanları</p>
        </div>
      </div>

      <button
        type="button"
        className="admin-btn"
        onClick={onNavigate}
      >
        <AdminPanelSettingsIcon fontSize="small" />
        Yönetici Girişi
      </button>
    </nav>
  );
}

export default Navbar;