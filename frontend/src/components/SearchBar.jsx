import SearchIcon from "@mui/icons-material/Search";

function SearchBar({
  searchText,
  setSearchText,
  filteredAreas,
  onSelectArea,
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 24,
        left: 24,
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        zIndex: 1000,
      }}
    >
     
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: 430,
            height: 56,
            background: "#fff",
            borderRadius: 16,
            padding: "0 18px",
            boxShadow: "0 10px 30px rgba(10,54,117,.12)",
          }}
        >
          <SearchIcon style={{ color: "#7b8aa5" }} />

          <input
            type="text"
            placeholder="Toplanma alanı, ilçe veya mahalle ara..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: "100%",
              marginLeft: 12,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 15,
            }}
          />
        </div>

        {searchText && filteredAreas.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: 62,
              left: 0,
              width: "100%",
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 10px 30px rgba(10,54,117,.14)",
              overflow: "hidden",
            }}
          >
            {filteredAreas.slice(0, 6).map((area) => (
              <div
                key={area.id}
                onClick={() => {
                  onSelectArea(area);
                  setSearchText(area.name);
                }}
                style={{
                  padding: "13px 16px",
                  cursor: "pointer",
                  borderBottom: "1px solid #edf2f7",
                }}
              >
                <strong style={{ color: "#0a3675", fontSize: 14 }}>
                  {area.name}
                </strong>

                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 12,
                    color: "#64748b",
                  }}
                >
                  {area.neighborhood} / {area.district}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;