import { useState, useMemo } from "react";
import { useRescue } from "../context/RescueContext";

export default function Organizations() {
  const { organizations } = useRescue();

  const [foodTypeFilter, setFoodTypeFilter] = useState("All");
  const [distanceFilter, setDistanceFilter] = useState("All");
  const [capacityFilter, setCapacityFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      // Food Type filter
      if (foodTypeFilter !== "All") {
        const accepts = org.acceptedFoodTypes.some(
          (t) => t.toLowerCase() === foodTypeFilter.toLowerCase()
        );
        if (!accepts) return false;
      }

      // Distance filter
      if (distanceFilter === "near") {
        if (org.distanceKm > 2.5) return false;
      } else if (distanceFilter === "mid") {
        if (org.distanceKm > 5.0) return false;
      }

      // Capacity filter
      if (capacityFilter === "small" && org.capacity > 90) return false;
      if (capacityFilter === "medium" && (org.capacity < 90 || org.capacity > 180)) return false;
      if (capacityFilter === "large" && org.capacity <= 180) return false;

      // Availability filter
      if (availabilityFilter === "emergency" && !org.isEmergencyReady) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = org.name.toLowerCase().includes(q);
        const matchLoc = org.location.toLowerCase().includes(q);
        const matchType = org.type.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchType) return false;
      }

      return true;
    });
  }, [organizations, foodTypeFilter, distanceFilter, capacityFilter, availabilityFilter, searchQuery]);

  return (
    <div className="organizations-page-container">
      {/* Page Header */}
      <div className="orgs-header-banner">
        <div className="orgs-header-content">
          <div className="orgs-tag-pill">🏢 VERIFIED RESCUE NETWORK</div>
          <h1 className="orgs-page-title">Partner Organizations & Food Banks</h1>
          <p className="orgs-page-subtitle">
            Community kitchens, shelters, and relief foundations equipped to accept and safely distribute surplus meals across the district.
          </p>
        </div>

        {/* Quick Summary Pill Bar */}
        <div className="network-quick-stats">
          <div className="n-stat">
            <strong>{organizations.length}</strong>
            <span>Verified Partners</span>
          </div>
          <div className="n-stat">
            <strong>980+</strong>
            <span>Total Servings Capacity</span>
          </div>
          <div className="n-stat">
            <strong>28 mins</strong>
            <span>Avg Response Time</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="orgs-controls-panel">
        <div className="orgs-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search organizations, locations, or facilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="orgs-search-input"
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        <div className="orgs-filters-row">
          {/* Food Type */}
          <div className="filter-select-wrap">
            <label>Food Category:</label>
            <select
              value={foodTypeFilter}
              onChange={(e) => setFoodTypeFilter(e.target.value)}
            >
              <option value="All">All Food Types</option>
              <option value="Cooked Meals">Cooked Meals</option>
              <option value="Rice">Rice & Lentils</option>
              <option value="Bread">Bread & Buns</option>
              <option value="Fruits & Vegetables">Fruits & Vegetables</option>
              <option value="Packaged Food">Packaged Goods</option>
            </select>
          </div>

          {/* Distance */}
          <div className="filter-select-wrap">
            <label>Distance Radius:</label>
            <select
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
            >
              <option value="All">Any Distance</option>
              <option value="near">&lt; 2.5 km (Fastest)</option>
              <option value="mid">&lt; 5.0 km (Mid Range)</option>
            </select>
          </div>

          {/* Capacity */}
          <div className="filter-select-wrap">
            <label>Batch Capacity:</label>
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
            >
              <option value="All">All Capacities</option>
              <option value="small">Up to 90 servings</option>
              <option value="medium">90 - 180 servings</option>
              <option value="large">180+ servings</option>
            </select>
          </div>

          {/* Availability */}
          <div className="filter-select-wrap">
            <label>Availability:</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="All">All Organizations</option>
              <option value="emergency">Emergency Ready Only</option>
            </select>
          </div>

          {(foodTypeFilter !== "All" || distanceFilter !== "All" || capacityFilter !== "All" || availabilityFilter !== "All" || searchQuery) && (
            <button
              className="reset-filters-btn"
              onClick={() => {
                setFoodTypeFilter("All");
                setDistanceFilter("All");
                setCapacityFilter("All");
                setAvailabilityFilter("All");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Organizations Grid */}
      {filteredOrgs.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon-wrap">🏢</div>
          <h3 className="empty-title">No organizations match this criteria</h3>
          <p className="empty-desc">Try resetting your filters to view all partner centers.</p>
        </div>
      ) : (
        <div className="organizations-grid">
          {filteredOrgs.map((org) => (
            <div key={org.id} className="org-profile-card">
              <div className="org-card-top">
                <div className="org-avatar">
                  <span>🏢</span>
                </div>
                <div className="org-title-group">
                  <div className="name-badge-row">
                    <h3 className="org-name">{org.name}</h3>
                    {org.verified && (
                      <span className="verified-check" title="Verified NGO Partner">✓ Verified</span>
                    )}
                  </div>
                  <span className="org-type-text">{org.type}</span>
                </div>
              </div>

              {/* Location, Distance & Smart Match */}
<div className="org-geo-info">
  <span className="geo-location">
    📍 {org.location}
  </span>

  <span className="geo-distance">
    {org.distanceKm} km away
  </span>
</div>
<div className="org-smart-match-badge">
  🧠 Smart Match Ready
  <span className="smart-match-score">
    Based on distance, capacity & food compatibility
  </span>
</div>

              {/* Core Details Grid */}
              <div className="org-stats-grid">
                <div className="org-stat-box">
                  <span className="stat-lbl">Capacity</span>
                  <strong className="stat-val">{org.capacity} servings</strong>
                </div>

                <div className="org-stat-box">
                  <span className="stat-lbl">Active Rescues</span>
                  <strong className="stat-val highlight">{org.activeRescues} in transit</strong>
                </div>

                <div className="org-stat-box">
                  <span className="stat-lbl">Total Rescued</span>
                  <strong className="stat-val">{org.rescuesCompleted}+ completed</strong>
                </div>

                <div className="org-stat-box">
                  <span className="stat-lbl">Rating</span>
                  <strong className="stat-val gold-star">★ {org.rating}</strong>
                </div>
              </div>

              {/* Accepted Food Types */}
              <div className="org-accepted-section">
                <span className="accepted-title">Accepted Food Categories:</span>
                <div className="accepted-tags-wrap">
                  {org.acceptedFoodTypes.map((type) => (
                    <span key={type} className="accepted-tag">
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Availability & Logistics Footer */}
              <div className="org-card-footer">
                <div className="logistics-row">
                  <span className="avail-status">● {org.availability}</span>
                  <span className="vehicle-info">🚚 {org.vehicleType}</span>
                </div>
                <div className="contact-preview">
                  <span>Contact: <strong>{org.contactPerson}</strong> ({org.phone})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
