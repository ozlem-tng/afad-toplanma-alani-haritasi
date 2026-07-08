import MyLocationIcon from "@mui/icons-material/MyLocation";
function LocationButton() {
  return (
    <button
      style={{
        position: "absolute",
        bottom: 110,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: "none",
        background: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,.15)",
        zIndex: 1000,
      }}
    >
      <MyLocationIcon style={{ color: "#d32f2f" }} />
    </button>
  );
}

export default LocationButton;