export default function UrgencyBadge({ urgency = "Medium", size = "normal" }) {
  const normalized = (urgency || "Medium").toLowerCase();

  const badgeConfig = {
    critical: {
      label: "🚨 Critical (ASAP)",
      shortLabel: "Critical",
      className: "urgency-critical",
      ariaLabel: "Critical urgency: needs immediate pickup within 45 minutes"
    },
    high: {
      label: "⚡ High Urgency",
      shortLabel: "High",
      className: "urgency-high",
      ariaLabel: "High urgency: pickup needed within 1 to 2 hours"
    },
    medium: {
      label: "⏱ Medium Urgency",
      shortLabel: "Medium",
      className: "urgency-medium",
      ariaLabel: "Medium urgency: pickup within 3 to 4 hours"
    },
    low: {
      label: "🌿 Low Urgency",
      shortLabel: "Low",
      className: "urgency-low",
      ariaLabel: "Low urgency: flexible pickup within 6+ hours"
    }
  };

  const current = badgeConfig[normalized] || badgeConfig.medium;

  return (
    <span
      className={`urgency-pill ${current.className} size-${size}`}
      aria-label={current.ariaLabel}
      title={current.ariaLabel}
    >
      <span className="urgency-dot" aria-hidden="true"></span>
      <span className="urgency-text">
        {size === "small" ? current.shortLabel : current.label}
      </span>
    </span>
  );
}
