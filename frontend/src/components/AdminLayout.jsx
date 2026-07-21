import { useState } from 'react';
import {
  BarChart3,
  Grid2X2,
  Lightbulb,
  List,
  LogOut,
  Menu,
  History,
  Shield,
  UserRound,
} from 'lucide-react';
import '../styles/AdminLayout.css';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard / Harita', icon: Grid2X2 },
  { key: 'list', label: 'Toplanma Alanı Listesi', icon: List },
  { key: 'suggestions', label: 'Aday Alan Önerileri', icon: Lightbulb },
  { key: 'stats', label: 'Analizler & İstatistikler', icon: BarChart3 },
  { key: 'activity', label: 'Son İşlemler', icon: History },
];

function AdminLayout({
  activePage = 'dashboard',
  onNavigate = () => { },
  pageTitle = 'Yönetici Paneli',
  headerAction = null,
  onLogout = () => { },
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`adl-layout ${collapsed ? 'adl-collapsed' : ''}`}>
      <aside className="adl-sidebar">
        <div className="adl-brand">
          <span className="adl-brand-icon"><Shield size={20} /></span>
          <span className="adl-brand-text">
            <strong>AFAD</strong>
            <small>Yönetici Paneli</small>
          </span>
        </div>

        <div className="adl-profile">
          <span className="adl-profile-avatar">
            <UserRound size={22} />
          </span>
          <span className="adl-profile-text">
            <strong>AFAD Görevlisi</strong>
          </span>
        </div>

        <nav className="adl-menu" aria-label="Yönetici menüsü">
          <span className="adl-menu-title">YÖNETİM MENÜSÜ</span>
          {menuItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={`adl-menu-item ${activePage === key ? 'adl-active' : ''}`}
              onClick={() => onNavigate(key)}
              aria-current={activePage === key ? 'page' : undefined}
            >
              <span className="adl-menu-icon"><Icon size={17} /></span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button type="button" className="adl-logout" onClick={onLogout}>
          <LogOut size={18} />
          <span>Çıkış Yap</span>
        </button>
      </aside>

      <section className="adl-main">
        <header className="adl-topbar">
          <button
            type="button"
            className="adl-hamburger"
            onClick={() => setCollapsed((current) => !current)}
            aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
            title={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
          >
            <Menu size={19} />
          </button>
          <h1>{pageTitle}</h1>
          {headerAction && <div className="adl-header-action">{headerAction}</div>}
        </header>
        <main className="adl-content">{children}</main>
      </section>
    </div>
  );
}

export default AdminLayout;
