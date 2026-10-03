import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useRescue } from "../context/RescueContext";

export default function RescueHistory() {
  const navigate = useNavigate();
  const { rescueHistory, donations, impact } = useRescue();
  const [filterType, setFilterType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Aggregate all completed rescues using unified deduplication
  const allRescuedItems = useMemo(() => {
    const map = new Map();

    // First add items from rescueHistory state
    (rescueHistory || []).forEach((item) => {
      if (item && item.id) {
        map.set(String(item.id), {
          id: item.id,
          foodType: item.foodType,
          quantity: item.quantity,
          donorName: item.donorName || "Local Food Donor",
          donorLocation: item.donorLocation || item.location || "Central District",
          organization: item.organization || "Partner Organization",
          organizationId: item.organizationId || null,
          date: item.date || item.rescuedAt || new Date().toISOString(),
          status: "Rescued",
          durationMins: item.durationMins || 35,
          co2AvoidedKg: item.co2AvoidedKg || Number((Number(item.quantity) * 0.45 * 1.9).toFixed(1)),
          mealsSaved: item.mealsSaved || item.quantity
        });
      }
    });

    // Also include any donations marked 'Rescued' if not already in history
    (donations || []).forEach((d) => {
      if (d && d.status === "Rescued" && d.id) {
        const key = String(d.id);
        if (!map.has(key)) {
          map.set(key, {
            id: d.id,
            foodType: d.foodType,
            quantity: d.quantity,
            donorName: d.donorName || "Local Food Donor",
            donorLocation: d.location,
            organization: d.selectedOrganization?.name || "Partner Organization",
            organizationId: d.selectedOrganization?.id || null,
            date: d.rescuedAt || d.createdAt || new Date().toISOString(),
            status: "Rescued",
            durationMins: 32,
            co2AvoidedKg: Number((Number(d.quantity) * 0.45 * 1.9).toFixed(1)),
            mealsSaved: d.quantity
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [rescueHistory, donations]);

  // Impact metrics directly synchronized with shared impact logic
  const {
    totalServingsRescued,
    totalCompletedRescues,
    distinctOrgs,
    estimatedWasteAvoidedKg,
    estimatedCo2AvoidedKg
  } = impact;

  // Filtered Items
  const filteredItems = useMemo(() => {
    return allRescuedItems.filter((item) => {
      if (filterType !== "All" && item.foodType !== filterType) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mType = item.foodType?.toLowerCase().includes(q);
        const mOrg = item.organization?.toLowerCase().includes(q);
        const mLoc = item.donorLocation?.toLowerCase().includes(q);
        const mDonor = item.donorName?.toLowerCase().includes(q);
        if (!mType && !mOrg && !mLoc && !mDonor) return false;
      }

      return true;
    });
  }, [allRescuedItems, filterType, searchQuery]);

  return (
    <div className="history-page-container">
      {/* Page Header */}
      <div className="history-header-banner">
        <div className="history-tag-pill">📜 VERIFIED IMPACT LOG</div>
        <h1 className="history-title">Surplus Food Rescue History</h1>
        <p className="history-subtitle">
          Transparent, verifiable log of surplus meals rescued from waste and successfully delivered to relief partners. 
          
  
        </p>
      </div>

      {/* Summary Statistics Cards */}
      <div className="history-metrics-grid" aria-label="Rescue Impact Metrics">
        <div className="h-stat-card">
          <div className="h-icon green">🍽️</div>
          <div className="h-body">
            <span className="h-label">Total Servings Rescued</span>
            <strong className="h-val">{totalServingsRescued.toLocaleString()}</strong>
            <span className="h-sub">Fresh meals distributed</span>
          </div>
        </div>

        <div className="h-stat-card">
          <div className="h-icon blue">📦</div>
          <div className="h-body">
            <span className="h-label">Total Donations Rescued</span>
            <strong className="h-val">{totalCompletedRescues}</strong>
            <span className="h-sub">Successful dispatch runs</span>
          </div>
        </div>

        <div className="h-stat-card">
          <div className="h-icon purple">🏢</div>
          <div className="h-body">
            <span className="h-label">Organizations Helped</span>
            <strong className="h-val">{distinctOrgs}</strong>
            <span className="h-sub">Active beneficiary hubs</span>
          </div>
        </div>

        <div className="h-stat-card">
          <div className="h-icon amber">🌱</div>
          <div className="h-body">
            <span className="h-label">Est. Waste Avoided</span>
            <strong className="h-val">{estimatedWasteAvoidedKg.toLocaleString()} kg</strong>
            <span className="h-sub">~{estimatedCo2AvoidedKg.toLocaleString()} kg CO₂ avoided</span>
          </div>
        </div>
      </div>

      {/* Clear Demo Metrics Notice */}
      <div className="demo-notice-pill">
        <span>💡 <strong>Standard Impact Equivalencies:</strong> Ecological metrics benchmarked on FAO food loss equations (~0.45 kg edible food per serving, ~1.9 kg CO₂ avoided per kg food saved).</span>
      </div>

      {/* Toolbar / Search */}
      <div className="history-toolbar">
        <div className="history-search">
          <span className="s-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by food type, organization, donor location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="history-input"
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery("")}>✕</button>
          )}
        </div>

        <div className="history-filter-pills">
          {["All", "Cooked Meals", "Rice", "Bread", "Packaged Food"].map((type) => (
            <button
              key={type}
              className={`h-pill ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Rescues Table / Cards List */}
      <div className="history-list-wrapper">
        {filteredItems.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon-wrap">🍃</div>
            <h3 className="empty-title">
              {allRescuedItems.length === 0 ? "No completed rescues yet" : "No matching rescues found"}
            </h3>
            <p className="empty-desc">
              {allRescuedItems.length === 0
                ? "Your rescue history will appear here once food has been successfully rescued."
                : "Try clearing search filters or choosing 'All' categories to view all past records."}
            </p>
            <div className="empty-actions">
              {allRescuedItems.length === 0 ? (
                <button
                  className="primary-action-btn"
                  onClick={() => navigate("/")}
                >
                  View Active Dashboard
                </button>
              ) : (
                <button
                  className="secondary-outline-btn"
                  onClick={() => {
                    setFilterType("All");
                    setSearchQuery("");
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="history-cards-grid">
            {filteredItems.map((item) => {
              const formattedDate = new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              });

              return (
                <div key={item.id} className="history-card">
                  <div className="h-card-top">
                    <div className="h-food-type">
                      <span className="h-food-icon" aria-hidden="true">
                        {item.foodType?.includes("Meal") ? "🍱" :
                         item.foodType?.includes("Rice") ? "🍚" :
                         item.foodType?.includes("Bread") ? "🍞" :
                         item.foodType?.includes("Fruit") ? "🥗" : "🥫"}
                      </span>
                      <div>
                        <h4 className="h-food-name">{item.foodType}</h4>
                        <span className="h-donor-sub">From: {item.donorName || "Local Food Donor"}</span>
                      </div>
                    </div>

                    <span className="rescued-status-tag">
                      <span className="check-dot">✓</span> Rescued
                    </span>
                  </div>

                  <div className="h-card-details">
                    <div className="h-detail-item">
                      <span className="lbl">Quantity Rescued:</span>
                      <strong className="val highlight">{item.quantity} servings</strong>
                    </div>

                    <div className="h-detail-item">
                      <span className="lbl">Recipient Organization:</span>
                      <strong className="val">🏢 {item.organization}</strong>
                    </div>

                    <div className="h-detail-item">
                      <span className="lbl">Donor Pickup Location:</span>
                      <span className="val">📍 {item.donorLocation}</span>
                    </div>

                    <div className="h-detail-item">
                      <span className="lbl">Completed Date:</span>
                      <span className="val text-muted">🗓️ {formattedDate}</span>
                    </div>
                  </div>

                  <div className="h-card-footer">
                    <span className="eco-badge">
                      🌱 Avoided ~{item.co2AvoidedKg || Math.round(Number(item.quantity) * 0.45 * 1.9)} kg CO₂
                    </span>
                    <span className="duration-tag">
                      ⚡ Rescued in {item.durationMins || 35} mins
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
