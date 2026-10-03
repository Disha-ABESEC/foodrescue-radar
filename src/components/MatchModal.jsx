import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRescue } from "../context/RescueContext";
import { rankOrganizationsForDonation } from "../utils/matching";
import UrgencyBadge from "./UrgencyBadge";
import StatusBadge from "./StatusBadge";

export default function MatchModal() {
  const navigate = useNavigate();
  const {
    activeModalDonation,
    closeMatchModal,
    organizations,
    acceptRescue,
    markPickedUp,
    markRescued
  } = useRescue();

  const [expandedBreakdownId, setExpandedBreakdownId] = useState(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeMatchModal();
      }
    };
    if (activeModalDonation) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalDonation, closeMatchModal]);

  if (!activeModalDonation) return null;

  const donation = activeModalDonation;
  const rankedResults = rankOrganizationsForDonation(donation, organizations);
  const topMatch = rankedResults[0];
  const otherMatches = rankedResults.slice(1);

  const handleAccept = (org, score) => {
    acceptRescue(donation.id, org, score);
    setActionSuccessMessage(`Rescue accepted by ${org.name}! Next step: arrange pickup.`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handlePickUp = () => {
    markPickedUp(donation.id);
    setActionSuccessMessage("Food marked as Picked Up! Volunteer/driver is in transit.");
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleRescued = () => {
    markRescued(donation.id);
    setActionSuccessMessage("Rescue marked complete! Servings delivered and recorded in Rescue History.");
    setTimeout(() => {
      setActionSuccessMessage(null);
      closeMatchModal();
    }, 2200);
  };

  const toggleBreakdown = (orgId) => {
    setExpandedBreakdownId(expandedBreakdownId === orgId ? null : orgId);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={closeMatchModal}
      role="presentation"
    >
      <div
        className="modal-window smart-match-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div className="modal-tagline">
              <span className="spark-icon">✨</span> SMART MATCHING ENGINE
            </div>
            <h2 className="modal-title" id="modal-headline">Where can this food go?</h2>
            <p className="modal-subtitle">
              Algorithmic proximity &amp; capacity evaluation across nearby verified relief shelters, kitchens, and food banks.
            </p>
          </div>
          <button
            className="modal-close-btn"
            onClick={closeMatchModal}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Action feedback alert banner */}
        {actionSuccessMessage && (
          <div className="modal-action-alert" role="alert">
            <span className="alert-icon">✓</span>
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        <div className="modal-body-content">
          {/* Section 1: Food Details & Workflow progression */}
          <div className="donation-detail-panel">
            <div className="panel-header">
              <span className="panel-title-tag">SURPLUS FOOD TO RESCUE</span>
              <StatusBadge
                status={donation.status}
                organizationName={donation.selectedOrganization?.name}
              />
            </div>

            <div className="food-summary-grid">
              <div className="food-main-meta">
                <div className="food-type-hero">
                  <span className="food-icon-lg" aria-hidden="true">
                    {donation.foodType === "Cooked Meals" ? "🍱" :
                     donation.foodType === "Rice" ? "🍚" :
                     donation.foodType === "Bread" ? "🍞" :
                     donation.foodType === "Fruits & Vegetables" ? "🥗" :
                     donation.foodType === "Packaged Food" ? "🥫" : "🍲"}
                  </span>
                  <div>
                    <h3 className="food-name-hero">{donation.foodType}</h3>
                    <p className="donor-subname">
                      {donation.donorName || "Reported Surplus Donor"} • {donation.donorType || "Surplus Source"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="food-stats-pills">
                <div className="stat-pill">
                  <span className="pill-label">Quantity</span>
                  <span className="pill-value highlight">{donation.quantity} servings</span>
                </div>
                <div className="stat-pill">
                  <span className="pill-label">Urgency</span>
                  <UrgencyBadge urgency={donation.urgency} size="small" />
                </div>
                <div className="stat-pill">
                  <span className="pill-label">Pickup Location</span>
                  <span className="pill-value">📍 {donation.location}</span>
                </div>
                <div className="stat-pill">
                  <span className="pill-label">Deadline</span>
                  <span className="pill-value warning">⏱ {donation.pickupDeadline || "Immediate"}</span>
                </div>
              </div>
            </div>

            {donation.description && (
              <p className="donation-description-text">
                <strong>Donor Notes:</strong> {donation.description}
              </p>
            )}

            {/* Workflow status progression bar */}
            <div className="workflow-steps-container">
              <span className="workflow-header-label">Rescue Progression Status:</span>
              <div className="workflow-stepper" aria-label="Rescue Progression Steps">
                <div className={`step-node ${['Posted', 'Matched', 'Accepted', 'Picked Up', 'Rescued'].includes(donation.status) ? 'completed' : ''}`}>
                  <span className="step-num">1</span>
                  <span className="step-label">Posted</span>
                </div>
                <div className={`step-line ${['Matched', 'Accepted', 'Picked Up', 'Rescued'].includes(donation.status) ? 'active' : ''}`}></div>
                <div className={`step-node ${['Matched', 'Accepted', 'Picked Up', 'Rescued'].includes(donation.status) ? 'completed' : ''}`}>
                  <span className="step-num">2</span>
                  <span className="step-label">Matched</span>
                </div>
                <div className={`step-line ${['Accepted', 'Picked Up', 'Rescued'].includes(donation.status) ? 'active' : ''}`}></div>
                <div className={`step-node ${['Accepted', 'Picked Up', 'Rescued'].includes(donation.status) ? 'completed' : ''}`}>
                  <span className="step-num">3</span>
                  <span className="step-label">Accepted</span>
                </div>
                <div className={`step-line ${['Picked Up', 'Rescued'].includes(donation.status) ? 'active' : ''}`}></div>
                <div className={`step-node ${['Picked Up', 'Rescued'].includes(donation.status) ? 'completed' : ''}`}>
                  <span className="step-num">4</span>
                  <span className="step-label">Picked Up</span>
                </div>
                <div className={`step-line ${donation.status === 'Rescued' ? 'active' : ''}`}></div>
                <div className={`step-node ${donation.status === 'Rescued' ? 'completed' : ''}`}>
                  <span className="step-num">5</span>
                  <span className="step-label">Rescued ✓</span>
                </div>
              </div>

              {/* Status Action Workflow Boxes */}
              {donation.status === "Accepted" && (
                <div className="active-workflow-action-box">
                  <div className="workflow-info">
                    <strong>Rescue accepted by {donation.selectedOrganization?.name}.</strong>
                    <p>Dispatch in progress. Mark as picked up once collection starts.</p>
                  </div>
                  <button
                    className="primary-action-btn pickup-btn"
                    onClick={handlePickUp}
                  >
                    🚚 Mark as Picked Up
                  </button>
                </div>
              )}

              {donation.status === "Picked Up" && (
                <div className="active-workflow-action-box rescue-box">
                  <div className="workflow-info">
                    <strong>Surplus In Transit to {donation.selectedOrganization?.name}.</strong>
                    <p>Confirm safe delivery and meal distribution to beneficiaries.</p>
                  </div>
                  <button
                    className="primary-action-btn rescue-btn"
                    onClick={handleRescued}
                  >
                    ✅ Mark as Rescued
                  </button>
                </div>
              )}

              {donation.status === "Rescued" && (
                <div className="active-workflow-action-box completed-box">
                  <span className="check-badge">🎉</span>
                  <div className="workflow-info">
                    <strong>Rescue Completed &amp; Verified!</strong>
                    <p>
                      {donation.quantity} servings were saved and handed over to{" "}
                      {donation.selectedOrganization?.name || "recipient shelter"}. Impact recorded in Rescue History.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Best Places to Rescue This Food */}
          <div className="matching-results-section">
            <div className="section-title-wrap">
              <h3 className="section-title">
                WHERE CAN THIS FOOD GO?
              </h3>
              <span className="scoring-tag">
                Scoring Model: Urgency 35% • Proximity 25% • Capacity Fit 25% • Food Compatibility 15%
              </span>
            </div>

            {/* Check if no organizations match at all */}
            {rankedResults.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-icon-wrap">🏢</div>
                <h4 className="empty-title">No suitable organization found</h4>
                <p className="empty-desc">
                  No registered partner organizations are currently available that match the required food category or capacity for this donation. Try reviewing batch quantities or exploring all registered relief partners.
                </p>
                <div className="empty-actions">
                  <button
                    className="primary-action-btn"
                    onClick={() => {
                      closeMatchModal();
                      navigate("/organizations");
                    }}
                  >
                    Browse All Organizations
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Top Match Card (🥇 #1 SMART MATCH) */}
                {topMatch && (
                  <div className={`top-match-card ${donation.status === 'Accepted' && donation.selectedOrganization?.id === topMatch.organization.id ? 'is-currently-selected' : ''}`}>
                    <div className="top-match-header">
                      <div className="rank-badge gold">
                        <span>🥇 #1 SMART MATCH</span>
                      </div>
                      <div className="match-score-badge gold-score">
                        <span className="score-label">Match Score</span>
                        <strong className="score-num">{topMatch.score}%</strong>
                      </div>
                    </div>

                    <div className="org-main-info">
                      <div className="org-header-left">
                        <h4 className="org-name-title">{topMatch.organization.name}</h4>
                        <span className="org-type-tag">{topMatch.organization.type}</span>
                        <span className="org-location-text">📍 {topMatch.organization.location}</span>
                      </div>

                      <div className="org-metrics-row">
                        <div className="metric-chip">
                          <span className="chip-label">Distance</span>
                          <strong className="chip-val">📍 {topMatch.organization.distanceKm} km away</strong>
                        </div>
                        <div className="metric-chip">
                          <span className="chip-label">Capacity</span>
                          <strong className="chip-val">📦 {topMatch.organization.capacity} servings</strong>
                        </div>
                        <div className="metric-chip">
                          <span className="chip-label">Food Compatibility</span>
                          <strong className="chip-val">
                            🍱 {topMatch.breakdown.foodType.accepted ? `Accepts ${donation.foodType}` : "Flexible"}
                          </strong>
                        </div>
                        <div className="metric-chip">
                          <span className="chip-label">Urgency Fit</span>
                          <span className="chip-val green-text">
                            🚨 {topMatch.breakdown.urgency.points} / 35 pts {topMatch.organization.isEmergencyReady ? "(Emergency Ready)" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Compatibility Tags */}
                    <div className="compatibility-row">
                      <span className="comp-label">Accepts Food Categories:</span>
                      <div className="food-tags-list">
                        {topMatch.organization.acceptedFoodTypes.map((type) => (
                          <span
                            key={type}
                            className={`type-tag ${type.toLowerCase() === donation.foodType?.toLowerCase() ? 'active-match' : ''}`}
                          >
                            {type.toLowerCase() === donation.foodType?.toLowerCase() ? `✓ ${type}` : type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Suitability summary bar */}
                    <div className="suitability-bar">
                      <span className="suitability-indicator">⚡ {topMatch.suitabilityLabel}</span>
                      <span className="suitability-detail">
                        {topMatch.organization.vehicleType} • Verified Relief Partner
                      </span>
                      <button
                        className="toggle-breakdown-btn"
                        onClick={() => toggleBreakdown(topMatch.organization.id)}
                        aria-expanded={expandedBreakdownId !== topMatch.organization.id}
                      >
                        {expandedBreakdownId === topMatch.organization.id ? "Hide Detailed Breakdown ▲" : "Why This Match? ▼"}
                      </button>
                    </div>

                    {/* Transparent "WHY THIS MATCH?" Score Breakdown Tray */}
                    {/* Always visible or toggled */}
                    <div className="score-breakdown-tray">
                      <div className="why-match-title-row">
                        <span className="why-match-label">WHY THIS MATCH?</span>
                        <span className="why-match-score-pill">Total: {topMatch.score}%</span>
                      </div>

                      {/* Dynamic human-readable explanation */}
                      <p className="match-explanation-quote">
                        &ldquo;{topMatch.explanation}&rdquo;
                      </p>

                      <div className="breakdown-grid">
                        <div className="breakdown-col">
                          <div className="b-head">
                            <span>🚨 Urgency (35%)</span>
                            <strong>{topMatch.breakdown.urgency.points} / 35 pts</strong>
                          </div>
                          <div className="b-progress-bg">
                            <div
                              className="b-progress-fill"
                              style={{ width: `${topMatch.breakdown.urgency.percent}%` }}
                            ></div>
                          </div>
                          <span className="b-sub">{donation.urgency} urgency requirement</span>
                        </div>

                        <div className="breakdown-col">
                          <div className="b-head">
                            <span>📍 Distance (25%)</span>
                            <strong>{topMatch.breakdown.distance.points} / 25 pts</strong>
                          </div>
                          <div className="b-progress-bg">
                            <div
                              className="b-progress-fill"
                              style={{ width: `${topMatch.breakdown.distance.percent}%` }}
                            ></div>
                          </div>
                          <span className="b-sub">{topMatch.organization.distanceKm} km proximity</span>
                        </div>

                        <div className="breakdown-col">
                          <div className="b-head">
                            <span>📦 Capacity Fit (25%)</span>
                            <strong>{topMatch.breakdown.capacity.points} / 25 pts</strong>
                          </div>
                          <div className="b-progress-bg">
                            <div
                              className="b-progress-fill"
                              style={{ width: `${topMatch.breakdown.capacity.percent}%` }}
                            ></div>
                          </div>
                          <span className="b-sub">Can absorb {topMatch.organization.capacity} servings</span>
                        </div>

                        <div className="breakdown-col">
                          <div className="b-head">
                            <span>🍱 Compatibility (15%)</span>
                            <strong>{topMatch.breakdown.foodType.points} / 15 pts</strong>
                          </div>
                          <div className="b-progress-bg">
                            <div
                              className="b-progress-fill"
                              style={{ width: `${topMatch.breakdown.foodType.percent}%` }}
                            ></div>
                          </div>
                          <span className="b-sub">
                            {topMatch.breakdown.foodType.accepted ? `Accepts ${donation.foodType}` : "Compatible food types"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Action Button */}
                    <div className="top-match-actions">
                      {donation.status === "Posted" || donation.status === "Matched" ? (
                        <button
                          className="primary-accept-btn"
                          onClick={() => handleAccept(topMatch.organization, topMatch.score)}
                        >
                          🤝 Accept Rescue with {topMatch.organization.name}
                        </button>
                      ) : donation.selectedOrganization?.id === topMatch.organization.id ? (
                        <div className="selected-confirmation-pill">
                          <span>✓ Rescue accepted by {topMatch.organization.name}</span>
                        </div>
                      ) : (
                        <button
                          className="secondary-reassign-btn"
                          onClick={() => handleAccept(topMatch.organization, topMatch.score)}
                        >
                          Re-assign Rescue to {topMatch.organization.name}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Other Suitable Organizations Ranked Below */}
                {otherMatches.length > 0 && (
                  <div className="other-matches-list">
                    <h4 className="other-matches-title">
                      Alternative Organizations Ranked by Match Score ({otherMatches.length} options)
                    </h4>

                    <div className="alternative-cards-grid">
                      {otherMatches.map((item, index) => {
                        const isSelected =
                          donation.selectedOrganization?.id === item.organization.id;

                        return (
                          <div
                            key={item.organization.id}
                            className={`alt-org-card ${isSelected ? 'is-currently-selected' : ''}`}
                          >
                            <div className="alt-org-top">
                              <div className="alt-title-area">
                                <span className="rank-bullet">#{index + 2}</span>
                                <div>
                                  <h5 className="alt-org-name">{item.organization.name}</h5>
                                  <span className="alt-sub-meta">
                                    📍 {item.organization.location} • {item.organization.distanceKm} km away
                                  </span>
                                </div>
                              </div>

                              <div className="alt-score-badge">
                                <span className="alt-score-val">{item.score}%</span>
                                <span className="alt-score-txt">Match</span>
                              </div>
                            </div>

                            <div className="alt-org-details">
                              <div className="alt-row">
                                <span>Capacity:</span>
                                <strong>{item.organization.capacity} servings</strong>
                              </div>
                              <div className="alt-row">
                                <span>Accepts:</span>
                                <div className="alt-food-tags">
                                  {item.organization.acceptedFoodTypes.map((t) => (
                                    <span
                                      key={t}
                                      className={`mini-tag ${t.toLowerCase() === donation.foodType?.toLowerCase() ? 'active' : ''}`}
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="alt-row">
                                <span>Availability:</span>
                                <span className="green-text">{item.organization.availability}</span>
                              </div>
                            </div>

                            {/* Toggle breakdown */}
                            <div className="alt-breakdown-toggle">
                              <button
                                className="mini-text-btn"
                                onClick={() => toggleBreakdown(item.organization.id)}
                              >
                                {expandedBreakdownId === item.organization.id ? "Hide Score Breakdown ▲" : "Why This Match? ▼"}
                              </button>
                            </div>

                            {expandedBreakdownId === item.organization.id && (
                              <div className="mini-breakdown-box">
                                <p className="mini-explanation">&ldquo;{item.explanation}&rdquo;</p>
                                <div className="mini-b-row">
                                  <span>🚨 Urgency (35%):</span>
                                  <strong>{item.breakdown.urgency.points} / 35 pts</strong>
                                </div>
                                <div className="mini-b-row">
                                  <span>📍 Distance (25%):</span>
                                  <strong>{item.breakdown.distance.points} / 25 pts</strong>
                                </div>
                                <div className="mini-b-row">
                                  <span>📦 Capacity (25%):</span>
                                  <strong>{item.breakdown.capacity.points} / 25 pts</strong>
                                </div>
                                <div className="mini-b-row">
                                  <span>🍱 Compatibility (15%):</span>
                                  <strong>{item.breakdown.foodType.points} / 15 pts</strong>
                                </div>
                              </div>
                            )}

                            <div className="alt-actions">
                              {isSelected ? (
                                <span className="alt-assigned-pill">✓ Currently Assigned</span>
                              ) : (
                                <button
                                  className="alt-accept-btn"
                                  onClick={() => handleAccept(item.organization, item.score)}
                                >
                                  Accept Rescue
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
