import MyLocationIcon from "@mui/icons-material/MyLocation";

function LocationButton() {
  return (
    <button
      style={{
        position: "absolute",
        bottom: 110,
        right: 24,

        width: 56,
        height: 56,

        border: "none",
        borderRadius: "50%",

        background: "#fff",
        color: "#0a3675",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        cursor: "pointer",

        boxShadow: "0 10px 30px rgba(10,54,117,.12)",
        transition: "all .25s ease",

        zIndex: 1000,
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
      <MyLocationIcon />
    </button>
  );
}

export default LocationButton;