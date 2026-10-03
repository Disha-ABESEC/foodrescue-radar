export default function StatusBadge({ status = "Posted", organizationName = null }) {
  const getBadgeConfig = () => {
    switch (status) {
      case "Accepted":
        return {
          label: organizationName ? `Accepted by ${organizationName}` : "Accepted",
          icon: "🤝",
          className: "status-accepted"
        };
      case "Picked Up":
        return {
          label: "In Transit / Picked Up",
          icon: "🚚",
          className: "status-picked-up"
        };
      case "Rescued":
        return {
          label: "Rescued & Delivered",
          icon: "✅",
          className: "status-rescued"
        };
      case "Matched":
        return {
          label: "Smart Matched",
          icon: "🧠",
          className: "status-matched"
        };
      case "Posted":
      default:
        return {
          label: "Available for Rescue",
          icon: "🟢",
          className: "status-posted"
        };
    }
  };

  const { label, icon, className } = getBadgeConfig();

  return (
    <span className={`status-badge ${className}`}>
      <span className="status-icon">{icon}</span>
      <span className="status-label">{label}</span>
    </span>
  );
}
