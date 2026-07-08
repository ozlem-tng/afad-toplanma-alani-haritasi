function InfoCard() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: 24,

        width: 330,

        background: "#fff",

        padding: "18px 20px",

        borderRadius: 16,

        boxShadow: "0 10px 30px rgba(10,54,117,.12)",

        zIndex: 1000,
      }}
    >
      <h3
        style={{
          margin: 0,
          marginBottom: 12,
          color: "#0a3675",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        Toplanma Alanı
      </h3>

      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        Henüz bir alan seçilmedi.
      </p>
    </div>
  );
}

export default InfoCard;