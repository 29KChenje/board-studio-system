const StatCard = ({ label, value, hint }) => (
  <article className="stat-card">
    <span className="muted">{label}</span>
    <strong>{value}</strong>
    <small>{hint}</small>
  </article>
);

export default StatCard;
