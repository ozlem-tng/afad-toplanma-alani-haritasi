import NearMeIcon from '@mui/icons-material/NearMe';
import { COLORS } from '../styles/colors';

function NearestAreasButton({ open, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={
        disabled
          ? 'Önce konumunuzu belirleyin.'
          : 'En yakın toplanma alanlarını göster'
      }
      style={{
        position: 'absolute',
        top: 100,
        right: 24,
        zIndex: 1000,

        display: 'flex',
        alignItems: 'center',
        gap: 8,

        padding: '10px 16px',

        border: 'none',
        borderRadius: 12,

        cursor: disabled ? 'not-allowed' : 'pointer',

        background: disabled ? '#e2e8f0' : open ? COLORS.primary : '#fff',

        color: disabled ? '#94a3b8' : open ? '#fff' : COLORS.primary,

        boxShadow: '0 8px 20px rgba(10,54,117,.12)',

        fontSize: 14,
        fontWeight: 600,

        opacity: disabled ? 0.7 : 1,

        transition: '.2s',
      }}
    >
      <NearMeIcon fontSize="small" />
      En Yakın Noktalar
    </button>
  );
}

export default NearestAreasButton;
