import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Badge from '@mui/material/Badge';
import { COLORS } from '../styles/colors';

function FilterButton({ open, activeCount = 0, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Filtreleri aç veya kapat"
      aria-expanded={open}
      style={{
        position: 'absolute',
        top: 24,
        right: 24,
        zIndex: 1000,

        height: 56,
        padding: '0 22px',

        border: 'none',
        borderRadius: 16,

        background: open ? COLORS.primaryHover : COLORS.primary,
        color: '#fff',

        display: 'flex',
        alignItems: 'center',
        gap: 10,

        fontSize: 14,
        fontWeight: 700,

        cursor: 'pointer',

        boxShadow: '0 10px 30px rgba(10,54,117,.12)',
        transition: 'all .25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Badge
        badgeContent={activeCount}
        color="error"
        invisible={activeCount === 0}
      >
        <FilterAltIcon />
      </Badge>

      <span>Filtreler</span>
    </button>
  );
}

export default FilterButton;