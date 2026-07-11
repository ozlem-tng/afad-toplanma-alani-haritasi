import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { COLORS } from '../styles/colors';
import Badge from '@mui/material/Badge';

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

        background: COLORS.primary,
        color: '#fff',

        display: 'flex',
        alignItems: 'center',
        gap: 8,

        fontSize: 14,
        fontWeight: 700,

        cursor: 'pointer',

        boxShadow: '0 10px 30px rgba(10,54,117,.12)',
        transition: 'all .25s ease',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = COLORS.primaryHover;
        event.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = COLORS.primary;
        event.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <FilterAltIcon />
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
