import FilterAltIcon from "@mui/icons-material/FilterAlt";

function FilterButton() {
  return (
    <button
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 1000,
        height: 54,
        padding: "0 22px",
        borderRadius: 12,
        border: "none",
        background: "#d32f2f",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,.15)",
      }}
    >
      <FilterAltIcon />
      Filtreler
    </button>
  );
}

export default FilterButton;