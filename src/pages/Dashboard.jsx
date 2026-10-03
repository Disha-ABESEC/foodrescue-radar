
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRescue } from "../context/RescueContext";
import UrgencyBadge from "../components/UrgencyBadge";
import StatusBadge from "../components/StatusBadge";
import MatchModal from "../components/MatchModal";

const filterTabs = [
  { id: "All", label: "All Rescues" },
  { id: "Urgent", label: "🚨 Urgent Only" },
  { id: "Cooked Meals", label: "🍱 Cooked Meals" },
  { id: "Rice", label: "🍚 Rice" },
  { id: "Bread", label: "🍞 Bread" },
  { id: "Fruits & Vegetables", label: "🥗 Fruits & Veg" },
  { id: "Packaged Food", label: "🥫 Packaged" }
];

const urgencyWeight = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1
};

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    donations,
    activeDonations,
    stats,
    impact,
    openMatchModal,
    markPickedUp,
    markRescued,
    resetToDemoData
  } = useRescue();

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [sortBy, setSortBy] = useState("urgency");
  const [searchQuery, setSearchQuery] = useState("");
  const [devResetToast, setDevResetToast] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey &&
          e.shiftKey &&
          e.key.toLowerCase() === "r") ||
        (e.altKey && e.key.toLowerCase() === "d")
      ) {
        e.preventDefault();
        resetToDemoData();
        setDevResetToast(true);

        setTimeout(() => {
          setDevResetToast(false);
        }, 3000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [resetToDemoData]);

  const displayedDonations = useMemo(() => {
    return donations
      .filter((item) => {
        if (selectedFilter === "Urgent") {
          if (
            item.urgency !== "Critical" &&
            item.urgency !== "High"
          ) {
            return false;
          }
        } else if (selectedFilter !== "All") {
          if (item.foodType !== selectedFilter) {
            return false;
          }
        }

        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();

          const matchesType =
            item.foodType?.toLowerCase().includes(q);

          const matchesLocation =
            item.location?.toLowerCase().includes(q);

          const matchesDonor =
            item.donorName?.toLowerCase().includes(q);

          if (
            !matchesType &&
            !matchesLocation &&
            !matchesDonor
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "urgency") {
          return (
            (urgencyWeight[b.urgency] || 0) -
            (urgencyWeight[a.urgency] || 0)
          );
        }

        if (sortBy === "nearest") {
          const distA = a.approxDistanceKm || 3.0;
          const distB = b.approxDistanceKm || 3.0;

          return distA - distB;
        }

        if (sortBy === "quantity") {
          return (
            (Number(b.quantity) || 0) -
            (Number(a.quantity) || 0)
          );
        }

        if (sortBy === "newest") {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }

        return 0;
      });
  }, [
    donations,
    selectedFilter,
    sortBy,
    searchQuery
  ]);

  return (
    <div className="dashboard-container">

      {/* Dev Reset Toast */}
      {devResetToast && (
        <div className="dev-reset-toast" role="status">
          <span>
            ↺ Demo state reset to initial sample data
          </span>
        </div>
      )}

      {/* HERO */}
      <section className="dashboard-hero-section">
        <div className="hero-content-wrapper">

          <div className="hero-badge-pill">
            <span className="live-dot-pulse"></span>
            <span>
              REAL-TIME SURPLUS FOOD RESCUE PLATFORM
            </span>
          </div>

          <h1 className="hero-main-title">
            Rescue surplus food before it goes to waste.
          </h1>

          <p className="hero-main-subtitle">
            Algorithmic dispatch matching surplus meals from
            hotels, caterers, and canteens directly with verified
            relief organizations in need.
          </p>

          <div className="hero-cta-group">
            <button
              className="hero-secondary-btn"
              onClick={() => {
                const el = document.getElementById(
                  "food-available-section"
                );

                el?.scrollIntoView({
                  behavior: "smooth"
                });
              }}
            >
              Browse Food Opportunities ({activeDonations.length})
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section
        className="stats-cards-grid"
        aria-label="Key Rescue Metrics"
      >

        <div className="stat-card">
          <div className="stat-card-icon-wrap green-icon">
            <span>📦</span>
          </div>

          <div className="stat-card-body">
            <span className="stat-card-title">
              Active Food Rescues
            </span>

            <div className="stat-card-val-row">
              <strong className="stat-number">
                {stats.activeRescuesCount}
              </strong>

              <span className="stat-trend neutral">
                Active opportunities
              </span>
            </div>

            <span className="stat-card-sub">
              Surplus waiting for pickup
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon-wrap orange-icon">
            <span>🍽️</span>
          </div>

          <div className="stat-card-body">
            <span className="stat-card-title">
              Servings Available
            </span>

            <div className="stat-card-val-row">
              <strong className="stat-number">
                {stats.servingsAvailable.toLocaleString()}
              </strong>

              <span className="stat-trend positive">
                Ready Now
              </span>
            </div>

            <span className="stat-card-sub">
              Nutritious meals ready to dispatch
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon-wrap red-icon">
            <span>🚨</span>
          </div>

          <div className="stat-card-body">
            <span className="stat-card-title">
              Urgent Rescues
            </span>

            <div className="stat-card-val-row">
              <strong className="stat-number text-urgent">
                {stats.urgentRescuesCount}
              </strong>

              <span className="stat-trend negative">
                High / Critical
              </span>
            </div>

            <span className="stat-card-sub">
              Expiring within 1-2 hours
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon-wrap teal-icon">
            <span>🌿</span>
          </div>

          <div className="stat-card-body">
            <span className="stat-card-title">
              Food Rescued
            </span>

            <div className="stat-card-val-row">
              <strong className="stat-number">
                {stats.totalFoodRescuedServings.toLocaleString()}
              </strong>

              <span className="stat-trend positive">
                Servings Saved
              </span>
            </div>

            <span className="stat-card-sub">
              Successfully delivered to shelters
            </span>
          </div>
        </div>
      </section>

      {/* FOOD AVAILABLE */}
      <section
        className="food-available-section"
        id="food-available-section"
      >

        <div className="section-head-bar">
          <div>
            <div className="section-header-tagline-row">
              <span className="section-super-title">
                ACTIVE RESCUE FEED
              </span>

              <span className="sample-network-tag">
                Sample rescue opportunities
              </span>
            </div>

            <h2 className="section-main-heading">
              Food Available Near You
            </h2>

            <p className="section-main-subheading">
              Surplus donations evaluated by proximity,
              capacity, and urgency for immediate rescue.
            </p>
          </div>

          <div className="count-indicator">
            <strong>
              {displayedDonations.length}
            </strong>

            <span>
              rescues found
            </span>
          </div>
        </div>

        {/* FILTERS */}
        <div className="controls-toolbar">

          <div className="filter-tabs-scroll">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                className={`filter-pill-btn ${
                  selectedFilter === tab.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSelectedFilter(tab.id)
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="toolbar-right-controls">

            <div className="search-input-wrap">
              <span className="search-icon">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search food, location, donor..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                className="search-input"
              />

              {searchQuery && (
                <button
                  className="clear-search-btn"
                  onClick={() =>
                    setSearchQuery("")
                  }
                >
                  ✕
                </button>
              )}
            </div>

            <div className="sort-dropdown-wrap">
              <label
                htmlFor="sort-select"
                className="sort-label"
              >
                Sort:
              </label>

              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="sort-select"
              >
                <option value="urgency">
                  Highest Urgency 🚨
                </option>

                <option value="nearest">
                  Nearest First 📍
                </option>

                <option value="quantity">
                  Largest Quantity 🍽️
                </option>

                <option value="newest">
                  Recently Reported 🕒
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* EMPTY STATE / CARDS */}
        {displayedDonations.length === 0 ? (

          <div className="empty-state-card">

            <div className="empty-icon-wrap">
              🎉
            </div>

            <h3 className="empty-title">
              {activeDonations.length === 0
                ? "No active food rescues"
                : "No surplus food matches your filter"}
            </h3>

            <p className="empty-desc">
              {activeDonations.length === 0
                ? "There is currently no surplus food waiting for pickup."
                : "Try clearing search keywords or resetting category filters to see available donations."}
            </p>

            <div className="empty-actions">

              {activeDonations.length === 0 ? (

                <button
                  className="primary-action-btn"
                  onClick={() =>
                    navigate("/organizations")
                  }
                >
                  Browse Partner Organizations
                </button>

              ) : (

                <button
                  className="secondary-outline-btn"
                  onClick={() => {
                    setSelectedFilter("All");
                    setSearchQuery("");
                  }}
                >
                  Reset Filters
                </button>

              )}

            </div>
          </div>

        ) : (

          <div className="donations-cards-grid">

            {displayedDonations.map((donation) => {

              const distanceText =
                donation.approxDistanceKm
                  ? `${donation.approxDistanceKm} km away`
                  : "1.2 km away";

              const foodEmoji =
                donation.foodType === "Cooked Meals"
                  ? "🍱"
                  : donation.foodType === "Rice"
                  ? "🍚"
                  : donation.foodType === "Bread"
                  ? "🍞"
                  : donation.foodType ===
                    "Fruits & Vegetables"
                  ? "🥗"
                  : donation.foodType ===
                    "Packaged Food"
                  ? "🥫"
                  : "🍲";

              return (
                <article
                  key={donation.id}
                  className={`donation-card ${
                    donation.urgency === "Critical"
                      ? "is-critical-border"
                      : ""
                  } ${
                    donation.status === "Rescued"
                      ? "is-rescued-card"
                      : ""
                  }`}
                  onClick={() =>
                    openMatchModal(donation)
                  }
                  style={{
                    cursor: "pointer"
                  }}
                >

                  {/* CARD TOP */}
                  <div className="card-top-row">

                    <div className="food-type-header">

                      <span
                        className="card-food-emoji"
                        aria-hidden="true"
                      >
                        {foodEmoji}
                      </span>

                      <div>

                        <div className="card-food-title-row">

                          <h3 className="card-food-title">
                            {donation.foodType}
                          </h3>

                          {donation.isUserReported ? (
                            <span className="sample-data-chip live">
                              Newly Reported
                            </span>
                          ) : (
                            <span className="sample-data-chip">
                              Demo Opportunity
                            </span>
                          )}

                        </div>

                        <span className="card-donor-name">
                          From:{" "}
                          {donation.donorName ||
                            "Local Food Donor"}
                        </span>

                      </div>
                    </div>

                    <UrgencyBadge
                      urgency={donation.urgency}
                    />

                  </div>

                  {/* METRICS */}
                  <div className="card-metrics-block">

                    <div className="metric-box">
                      <span className="metric-label">
                        Quantity
                      </span>

                      <strong className="metric-number">
                        {donation.quantity}
                      </strong>

                      <span className="metric-unit">
                        servings
                      </span>
                    </div>

                    <div className="metric-box">

                      <span className="metric-label">
                        Location
                      </span>

                      <strong
                        className="metric-place"
                        title={donation.location}
                      >
                        📍{" "}
                        {donation.location.split(",")[0]}
                      </strong>

                      <span className="metric-dist">
                        {distanceText}
                      </span>

                    </div>

                    <div className="metric-box">

                      <span className="metric-label">
                        Pickup Window
                      </span>

                      <strong className="metric-deadline">
                        ⏱{" "}
                        {donation.pickupDeadline ||
                          "Within 1 hour"}
                      </strong>

                      <span className="metric-urgency-note">
                        Safe handling window
                      </span>

                    </div>

                  </div>

                  {/* DESCRIPTION */}
                  {donation.description && (
                    <p className="card-snippet">
                      {donation.description}
                    </p>
                  )}

                  {/* STATUS + SMART MATCH */}
                  <div className="card-status-strip">

                    <StatusBadge
                      status={donation.status}
                      organizationName={
                        donation.selectedOrganization?.name
                      }
                    />

                    {donation.matchScore && (
                      <span
                        className="card-match-badge"
                        title="Calculated using urgency, distance, capacity and food compatibility"
                      >
                        🧠 Best Match:{" "}
                        <strong>
                          {donation.matchScore}%
                        </strong>
                      </span>
                    )}

                  </div>

                  {/* ACTIONS */}
                  <div
                    className="card-footer-actions"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >

                    {donation.status === "Posted" ||
                    donation.status === "Matched" ? (

                      <button
                        className="match-cta-btn"
                        onClick={() =>
                          openMatchModal(donation)
                        }
                        title="Open smart matching interface"
                      >
                        🧠 View Best Match
                      </button>

                    ) : donation.status === "Accepted" ? (

                      <div className="card-workflow-group">

                        <button
                          className="sub-action-btn pickup"
                          onClick={() =>
                            markPickedUp(
                              donation.id
                            )
                          }
                        >
                          🚚 Mark as Picked Up
                        </button>

                        <button
                          className="sub-text-btn"
                          onClick={() =>
                            openMatchModal(
                              donation
                            )
                          }
                        >
                          🧠 View Best Match
                        </button>

                      </div>

                    ) : donation.status === "Picked Up" ? (

                      <div className="card-workflow-group">

                        <button
                          className="sub-action-btn rescue"
                          onClick={() =>
                            markRescued(
                              donation.id
                            )
                          }
                        >
                          ✅ Mark as Rescued
                        </button>

                        <button
                          className="sub-text-btn"
                          onClick={() =>
                            openMatchModal(
                              donation
                            )
                          }
                        >
                          View Details ➔
                        </button>

                      </div>

                    ) : (

                      <div className="card-rescued-state">

                        <span className="rescued-check">
                          ✓ Rescued &amp; Delivered
                        </span>

                        <button
                          className="sub-text-btn"
                          onClick={() =>
                            navigate("/history")
                          }
                        >
                          View in History ➔
                        </button>

                      </div>

                    )}

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>

      {/* IMPACT SECTION */}
      <section
        className="dashboard-impact-section"
        aria-label="This Month's Rescue Impact"
      >

        <div className="impact-section-header">

          <div>

            <div className="impact-section-tag">
              🌱 VERIFIED ECOLOGICAL &amp; COMMUNITY IMPACT
            </div>

            <h2 className="impact-section-title">
              This Month&apos;s Rescue Impact
            </h2>

            <p className="impact-section-subtitle">
              Dynamic metrics calculated in real-time
              from completed surplus dispatches across
              partner shelters and kitchens.
            </p>

          </div>

          <button
            className="impact-view-history-btn"
            onClick={() =>
              navigate("/history")
            }
          >
            View Verified Rescue History ➔
          </button>

        </div>

        <div className="impact-metrics-cards-grid">

          <div className="impact-card">

            <div className="impact-card-icon green">
              🌱
            </div>

            <div className="impact-card-data">

              <span className="impact-card-num">
                {impact.totalServingsRescued.toLocaleString()}
              </span>

              <span className="impact-card-label">
                Servings Rescued
              </span>

              <span className="impact-card-sub">
                Nutritious meals saved from waste
              </span>

            </div>
          </div>

          <div className="impact-card">

            <div className="impact-card-icon amber">
              ♻️
            </div>

            <div className="impact-card-data">

              <span className="impact-card-num">
                {impact.estimatedWasteAvoidedKg.toLocaleString()} kg
              </span>

              <span className="impact-card-label">
                Estimated Food Waste Avoided
              </span>

              <span className="impact-card-sub">
                ~0.45 kg edible food per serving
              </span>

            </div>
          </div>

          <div className="impact-card">

            <div className="impact-card-icon blue">
              🏢
            </div>

            <div className="impact-card-data">

              <span className="impact-card-num">
                {impact.distinctOrgs}
              </span>

              <span className="impact-card-label">
                Organizations Supported
              </span>

              <span className="impact-card-sub">
                Active shelter &amp; kitchen partners
              </span>

            </div>
          </div>

          <div className="impact-card">

            <div className="impact-card-icon teal">
              🌍
            </div>

            <div className="impact-card-data">

              <span className="impact-card-num">
                {impact.estimatedCo2AvoidedKg.toLocaleString()} kg
              </span>

              <span className="impact-card-label">
                Estimated CO₂ Impact Avoided
              </span>

              <span className="impact-card-sub">
                1.9 kg CO₂ avoided per kg food saved
              </span>

            </div>
          </div>

        </div>
      </section>

      {/* MATCH MODAL */}
      <MatchModal />

    </div>
  );
}