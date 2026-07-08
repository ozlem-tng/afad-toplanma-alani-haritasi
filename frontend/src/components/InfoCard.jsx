function InfoCard() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        width: 320,
        background: "#fff",
        padding: "15px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,.2)",
        zIndex: 1000,
      }}
    >
      <h3>Toplanma Alanı</h3>

      <p>Henüz bir alan seçilmedi.</p>
    </div>
  );
}

export default InfoCard;