import FilterAltIcon from '@mui/icons-material/FilterAlt';

function FilterButton({ open, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: 'absolute',
        top: 24,
        right: 24,
        zIndex: 1000,

        height: 56,
        padding: '0 22px',

        border: 'none',
        borderRadius: 16,

        background: '#0a3675',
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
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#12448f';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#0a3675';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <FilterAltIcon />
      Filtreler
    </button>
  );
}

export default FilterButton;
