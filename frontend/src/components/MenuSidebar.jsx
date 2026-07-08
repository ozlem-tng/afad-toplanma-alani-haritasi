import HomeIcon from '@mui/icons-material/Home';
import PlaceIcon from '@mui/icons-material/Place';
import LayersIcon from '@mui/icons-material/Layers';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from "@mui/icons-material/Info";

function Sidebar({ open }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 85,
        left: open ? 20 : -270,
        width: 250,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 8px 20px rgba(0,0,0,.2)',
        transition: '.3s',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      <MenuItem icon={<PlaceIcon />} text="Toplanma Alanları" />
      <MenuItem icon={<LayersIcon />} text="Katmanlar" />
      <MenuItem icon={<AnalyticsIcon />} text="Analizler" />
      <MenuItem icon={<InfoIcon />} text="Yardım / Bilgi" />
    </div>
  );
}

function MenuItem({ icon, text }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 15,
        padding: '16px 20px',
        cursor: 'pointer',
        borderBottom: '1px solid #eee',
      }}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}

export default Sidebar;
