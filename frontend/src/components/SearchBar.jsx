import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';

function SearchBar({ onMenuClick }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
      }}
    >
      <button
        onClick={onMenuClick}
        style={{
          width: 54,
          height: 54,
          borderRadius: 12,
          border: '1px solid #ddd',
          background: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,.15)',
        }}
      >
        <MenuIcon />
      </button>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: 400,
          height: 54,
          background: '#fff',
          borderRadius: 12,
          padding: '0 15px',
          boxShadow: '0 4px 12px rgba(0,0,0,.15)',
        }}
      >
        <SearchIcon style={{ color: '#777' }} />

        <input
          type="text"
          placeholder="Toplanma alanı ara..."
          style={{
            border: 'none',
            outline: 'none',
            marginLeft: 10,
            width: '100%',
            fontSize: 15,
          }}
        />
      </div>
    </div>
  );
}

export default SearchBar;
