import MyLocationIcon from "@mui/icons-material/MyLocation";
import { COLORS } from "../styles/colors";

function LocationButton() {
  return (
    <button
      style={{
        position: "absolute",
        bottom: 110,
        right: 24,
        width: 56,
        height: 56,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "50%",
        background: COLORS.white,
        color: COLORS.primary,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        boxShadow: "0 10px 30px rgba(36,53,83,.15)",
        transition: "all .25s ease",
        zIndex: 1000,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.background = COLORS.primaryLight;
        e.currentTarget.style.boxShadow =
          "0 15px 35px rgba(36,53,83,.22)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.background = COLORS.white;
        e.currentTarget.style.boxShadow =
          "0 10px 30px rgba(36,53,83,.15)";
      }}
    >
      <MyLocationIcon fontSize="small" />
    </button>
  );
}

export default LocationButton;