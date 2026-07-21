import SearchIcon from '@mui/icons-material/Search';
import { COLORS } from '../styles/colors';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';

function SearchBar({
  searchText,
  setSearchText,
  filteredAreas,
  onSelectArea,
  showSuggestions,
  setShowSuggestions,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 24,
        left: 60,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        zIndex: 1000,
      }}
    >
      <div style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: 460,
            height: 56,
            padding: '0 18px',
            background: COLORS.white,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            boxShadow: '0 10px 30px rgba(36, 53, 83, 0.14)',
          }}
        >
          <SearchIcon
            style={{
              color: COLORS.secondary,
              fontSize: 24,
            }}
          />

          <input
            type="text"
            placeholder="Toplanma alanı, ilçe veya mahalle ara..."
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
              setShowSuggestions(true);
            }}
            style={{
              width: '100%',
              marginLeft: 12,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: COLORS.textPrimary,
              fontSize: 15,
            }}
          />
          {searchText && (
            <IconButton
              size="small"
              onClick={() => {
                setSearchText('');
                onSelectArea(null);
              }}
            >
              <ClearIcon
                sx={{
                  fontSize: 18,
                  color: COLORS.textSecondary,
                  '&:hover': {
                    color: COLORS.primary,
                  },
                }}
              />
            </IconButton>
          )}
        </div>

        {showSuggestions && searchText && filteredAreas.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 62,
              left: 0,
              width: '100%',
              overflow: 'hidden',
              background: COLORS.white,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 16,
              boxShadow: '0 14px 34px rgba(36, 53, 83, 0.16)',
            }}
          >
            {filteredAreas.slice(0, 6).map((area, index) => (
              <div
                key={area.recordKey || area.id}
                onClick={() => {
                  onSelectArea(area);
                  setSearchText(area.name);
                  setShowSuggestions(false);
                }}
                style={{
                  padding: '13px 16px',
                  cursor: 'pointer',
                  background: COLORS.white,
                  borderBottom:
                    index === Math.min(filteredAreas.length, 6) - 1
                      ? 'none'
                      : `1px solid ${COLORS.border}`,

                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = COLORS.secondaryLight;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = COLORS.white;
                }}
              >
                <strong
                  style={{
                    color: COLORS.primary,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {area.name}
                </strong>

                <p
                  style={{
                    margin: '4px 0 0',
                    color: COLORS.textSecondary,
                    fontSize: 12,
                  }}
                >
                  {area.district || area.neighborhood
                    ? [area.neighborhood, area.district].filter(Boolean).join(' / ')
                    : `${area.type} · ${Number(area.capacity || 0).toLocaleString('tr-TR')} kişi`}
                </p>
              </div>
            ))}
          </div>
        )}

        {searchText && filteredAreas.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: 62,
              left: 0,
              width: '100%',
              padding: '16px',
              boxSizing: 'border-box',
              background: COLORS.white,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 16,
              color: COLORS.textSecondary,
              fontSize: 13,
              textAlign: 'center',
              boxShadow: '0 14px 34px rgba(36, 53, 83, 0.16)',
            }}
          >
            Aramanızla eşleşen toplanma alanı bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
