import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";

function SearchBar({ onMenuClick }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 24,
        left: 24,
        display: "flex",
        alignItems: "center",
        gap: 14,
        zIndex: 1000,
      }}
    >
      <button
        onClick={onMenuClick}
        style={{
          width: 56,
          height: 56,
          border: "none",
          borderRadius: 16,
          background: "#fff",
          color: "#0a3675",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(10,54,117,.12)",
          transition: "all .25s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow =
            "0 15px 35px rgba(10,54,117,.18)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 10px 30px rgba(10,54,117,.12)";
        }}
      >
        <MenuIcon />
      </button>

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
          placeholder="Toplanma alanı ara..."
          style={{
            width: "100%",
            marginLeft: 12,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 15,
            color: "#1f2937",
          }}
        />
      </div>
    </div>
  );
}

export default SearchBar;