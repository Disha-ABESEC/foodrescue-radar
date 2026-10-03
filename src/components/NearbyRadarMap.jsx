import { useState } from "react";
import { useRescue } from "../context/RescueContext";

export default function NearbyRadarMap() {
  const { activeDonations, organizations, openMatchModal } = useRescue();
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Position coordinates mapped inside a 100x100 viewBox for clean scalable SVG
  const centerFood = activeDonations[0] || {
    id: 999,
    foodType: "Surplus Food",
    quantity: 100,
    urgency: "High",
    location: "Central Hub, Ghaziabad"
  };

  const orgPositions = [
    { id: 1, x: 42, y: 35, name: "Seva Foundation", dist: "1.2 km", color: "#16a34a", type: "NGO Hub" },
    { id: 2, x: 68, y: 38, name: "Community Kitchen", dist: "2.1 km", color: "#059669", type: "Kitchen" },
    { id: 3, x: 28, y: 62, name: "Shanti Shelter", dist: "3.4 km", color: "#0d9488", type: "Shelter" },
    { id: 4, x: 74, y: 72, name: "Aahar Food Bank", dist: "4.8 km", color: "#2563eb", type: "Food Bank" },
    { id: 5, x: 82, y: 25, name: "Anand Orphanage", dist: "5.6 km", color: "#7c3aed", type: "Orphanage" },
    { id: 6, x: 22, y: 80, name: "Hope Night Shelter", dist: "6.2 km", color: "#d97706", type: "Shelter" }
  ];

  return (
    <div className="radar-map-wrapper">
      <div className="radar-map-header">
        <div className="map-title-block">
          <div className="map-badge">
            <span className="pulsing-radar-dot"></span>
            <span>PROTOTYPE VISUAL MAP • SIMULATED RADAR PROXIMITY</span>
          </div>
          <h3 className="map-heading">Live Rescue Radar Map</h3>
          <p className="map-subheading">
            Visualizing proximity between active surplus food donors (📍) and verified emergency recipient organizations (🏢).
          </p>
        </div>

        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-marker food-pin">🍱</span>
            <span>Active Surplus Food</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker org-pin">🏢</span>
            <span>Recipient Organization</span>
          </div>
          <div className="legend-item">
            <span className="legend-ring-dot"></span>
            <span>Proximity Rings (1km - 6km)</span>
          </div>
        </div>
      </div>

      <div className="radar-canvas-container">
        {/* SVG Interactive Proximity Radar */}
        <svg viewBox="0 0 100 100" className="radar-svg-plane">
          {/* Concentric distance circles */}
          <circle cx="50" cy="50" r="15" className="radar-ring r1" />
          <circle cx="50" cy="50" r="28" className="radar-ring r2" />
          <circle cx="50" cy="50" r="42" className="radar-ring r3" />

          {/* Distance Labels */}
          <text x="50" y="34" className="ring-text">1.5 km</text>
          <text x="50" y="21" className="ring-text">3.5 km</text>
          <text x="50" y="7" className="ring-text">6.0 km</text>

          {/* Radar Sweep Line */}
          <line x1="50" y1="50" x2="85" y2="15" className="radar-sweep-beam" />

          {/* Center Point - Main Food Donor */}
          <g
            className="radar-center-group"
            onClick={() =>
              setSelectedEntity({
                type: "food",
                title: `${centerFood.foodType} (${centerFood.quantity} servings)`,
                subtitle: centerFood.location,
                urgency: centerFood.urgency,
                raw: centerFood
              })
            }
          >
            <circle cx="50" cy="50" r="4" className="center-pulse-glow" />
            <circle cx="50" cy="50" r="2.2" className="center-core-point" />
            <text x="50" y="56" className="point-caption center-caption">
              Surplus Hub (You)
            </text>
          </g>

          {/* Connecting dashed lines and Org Pins */}
          {orgPositions.map((org) => {
            const orgData = organizations.find((o) => o.id === org.id);
            return (
              <g
                key={org.id}
                className="radar-org-group"
                onClick={() =>
                  setSelectedEntity({
                    type: "org",
                    title: org.name,
                    subtitle: `${org.dist} away • ${org.type}`,
                    capacity: orgData?.capacity,
                    accepted: orgData?.acceptedFoodTypes?.join(", "),
                    raw: orgData
                  })
                }
              >
                {/* Distance line from center to org */}
                <line
                  x1="50"
                  y1="50"
                  x2={org.x}
                  y2={org.y}
                  className="connector-line"
                />

                {/* Org Pin Circle */}
                <circle
                  cx={org.x}
                  cy={org.y}
                  r="2.8"
                  className="org-circle"
                  style={{ fill: org.color }}
                />
                <circle
                  cx={org.x}
                  cy={org.y}
                  r="4.5"
                  className="org-halo"
                  style={{ stroke: org.color }}
                />

                {/* Distance text on pin */}
                <text x={org.x} y={org.y - 4} className="point-caption">
                  {org.name} ({org.dist})
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected entity floating preview card */}
        {selectedEntity ? (
          <div className="map-selected-popover">
            <div className="popover-top">
              <span className="popover-tag">
                {selectedEntity.type === "food" ? "🍱 SURPLUS LOCATION" : "🏢 PARTNER RESCUE CENTER"}
              </span>
              <button
                className="popover-close-btn"
                onClick={() => setSelectedEntity(null)}
              >
                ✕
              </button>
            </div>
            <h4 className="popover-title">{selectedEntity.title}</h4>
            <p className="popover-subtitle">{selectedEntity.subtitle}</p>

            {selectedEntity.type === "org" && (
              <div className="popover-meta">
                <span>Capacity: <strong>{selectedEntity.capacity} servings</strong></span>
                <span>Accepts: <strong>{selectedEntity.accepted}</strong></span>
              </div>
            )}

            {selectedEntity.type === "food" && activeDonations.length > 0 && (
              <button
                className="popover-action-btn"
                onClick={() => openMatchModal(activeDonations[0])}
              >
                Find Best Match for this Surplus ➔
              </button>
            )}
          </div>
        ) : (
          <div className="map-hint-pill">
            💡 Click on any radar pin or organization to inspect distance & match suitability
          </div>
        )}
      </div>
    </div>
  );
}
