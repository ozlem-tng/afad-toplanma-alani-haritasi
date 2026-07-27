import PlaceIcon from "@mui/icons-material/Place";
import LayersIcon from "@mui/icons-material/Layers";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import InfoIcon from "@mui/icons-material/Info";
import { COLORS } from "../styles/colors";

function MenuSidebar({ open }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 94,
        left: open ? 24 : -280,
        width: 260,
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(36,53,83,.15)",
        transition: "all .3s ease",
        zIndex: 1000,
        overflow: "hidden",
      }}
    >
      <MenuItem icon={<PlaceIcon />} text="Toplanma Alanları" />
      <MenuItem icon={<LayersIcon />} text="Katmanlar" />
      <MenuItem icon={<AnalyticsIcon />} text="Analizler" />
      <MenuItem icon={<InfoIcon />} text="Yardım / Bilgi" />
    </div>
  );
}

function MenuItem({ icon, text }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "18px 22px",
        cursor: "pointer",
        borderBottom: `1px solid ${COLORS.border}`,
        color: COLORS.textPrimary,
        fontWeight: 500,
        transition: "all .2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = COLORS.secondaryLight;
        e.currentTarget.style.color = COLORS.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = COLORS.white;
        e.currentTarget.style.color = COLORS.textPrimary;
      }}
    >
      <span style={{ color: COLORS.primary }}>
        {icon}
      </span>

      <span>{text}</span>
    </div>
  );
}

export default MenuSidebar;