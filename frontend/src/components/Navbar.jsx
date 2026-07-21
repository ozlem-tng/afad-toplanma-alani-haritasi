import "../styles/Navbar.css";
import logo from "../assets/logo.png";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import { Link } from "react-router-dom";

function Navbar() {
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

      <Link
        to="/admin"
        className="admin-entry-icon"
        aria-label="Yönetici girişini aç"
        title="Yönetici Girişi"
      >
        <AdminPanelSettingsRoundedIcon className="admin-entry-symbol" />
      </Link>

    </nav>
  );
}

export default Navbar;
