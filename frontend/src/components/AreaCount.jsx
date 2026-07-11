import PlaceIcon from '@mui/icons-material/Place';
import { COLORS } from '../styles/colors';

function AreaCount({ count }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 96,
        right: 24,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#fff',
        padding: '10px 16px',
        borderRadius: 14,
        boxShadow: '0 10px 30px rgba(10,54,117,.12)',
      }}
    >
      <PlaceIcon
        sx={{
          color: COLORS.primary,
          fontSize: 22,
        }}
      />

      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: COLORS.textPrimary,
        }}
      >
        Aktif Toplanma Alanı: <strong>{count}</strong>
      </span>
    </div>
  );
}

export default AreaCount;