import "./../styles/InfoCard.css";

function InfoRow({ icon, title, value }) {
  return (
    <div className="info-row">
      <div className="info-row-left">
        {icon}
        <span className="info-row-title">{title}</span>
      </div>

      <span className="info-row-value">{value}</span>
    </div>
  );
}

export default InfoRow;