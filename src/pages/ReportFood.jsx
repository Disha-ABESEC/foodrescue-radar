import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRescue } from "../context/RescueContext";
import UrgencyBadge from "../components/UrgencyBadge";
import MatchModal from "../components/MatchModal";

export default function ReportFood() {
  const navigate = useNavigate();
  const { addDonation, openMatchModal } = useRescue();

  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [urgency, setUrgency] = useState("High");
  const [location, setLocation] = useState("");
  const [donorName, setDonorName] = useState("");
  const [pickupDeadline, setPickupDeadline] = useState("Pickup within 1 hour");
  const [description, setDescription] = useState("");

  const [submittedDonation, setSubmittedDonation] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!foodType) {
      setErrorMsg("Please select a valid food type.");
      return;
    }

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setErrorMsg("Please enter a valid number of servings (at least 1).");
      return;
    }

    if (!location.trim()) {
      setErrorMsg("Please specify the pickup location.");
      return;
    }

    const newDonation = {
      foodType,
      quantity: parsedQty,
      urgency,
      location: location.trim(),
      donorName: donorName.trim() || "Independent Surplus Donor",
      donorType: "Community Donor",
      pickupDeadline: pickupDeadline.trim() || "Immediate pickup",
      description: description.trim() || "Surplus food in safe, hygienic containers.",
      approxDistanceKm: Number((Math.random() * 2.5 + 0.8).toFixed(1))
    };

    const saved = addDonation(newDonation);
    setSubmittedDonation(saved);
  };

  const handleResetForm = () => {
    setFoodType("");
    setQuantity("");
    setUrgency("High");
    setLocation("");
    setDonorName("");
    setPickupDeadline("Pickup within 1 hour");
    setDescription("");
    setSubmittedDonation(null);
  };

  return (
    <div className="report-page-container">
      {/* Page Header */}
      <div className="report-hero-head">
        <div className="report-badge">🍃 QUICK SURPLUS RESCUE INTAKE</div>
        <h1 className="report-hero-title">Report Surplus Food</h1>
        <p className="report-hero-sub">
          Connect your excess food with nearby shelters, kitchens, and food banks before it goes to waste.
        </p>
      </div>

      {submittedDonation ? (
        /* ================= SUCCESS STATE ================= */
        <div className="report-success-card">
          <div className="success-icon-banner">
            <span className="success-emoji">🎉</span>
          </div>

          <span className="success-tag">SUBMISSION CONFIRMED</span>
          <h2 className="success-title">Food rescue posted successfully.</h2>
          <p className="success-desc">
            Your surplus opportunity is now live on the FoodRescue Radar. Nearby organizations are being matched in real-time.
          </p>

          {/* Receipt Preview Box */}
          <div className="success-receipt-box">
            <div className="receipt-header">
              <span className="receipt-food-name">🍱 {submittedDonation.foodType}</span>
              <UrgencyBadge urgency={submittedDonation.urgency} />
            </div>

            <div className="receipt-grid">
              <div className="receipt-item">
                <span className="r-label">Quantity:</span>
                <strong>{submittedDonation.quantity} servings</strong>
              </div>
              <div className="receipt-item">
                <span className="r-label">Pickup Location:</span>
                <strong>{submittedDonation.location}</strong>
              </div>
              <div className="receipt-item">
                <span className="r-label">Deadline:</span>
                <strong>{submittedDonation.pickupDeadline}</strong>
              </div>
              <div className="receipt-item">
                <span className="r-label">Status:</span>
                <span className="green-text">● Available for Rescue</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="success-actions-row">
            <button
              className="primary-action-btn pulse-glow"
              onClick={() => openMatchModal(submittedDonation)}
            >
              ⚡ Find Best Match Now
            </button>

            <button
              className="secondary-dashboard-btn"
              onClick={() => navigate("/")}
            >
              View Rescue Dashboard
            </button>

            <button
              className="link-plain-btn"
              onClick={handleResetForm}
            >
              + Report Another Donation
            </button>
          </div>
        </div>
      ) : (
        /* ================= INTAKE FORM & LIVE PREVIEW ================= */
        <div className="report-layout-columns">
          {/* Left: Input Form */}
          <div className="form-card-wrapper">
            <div className="form-header-bar">
              <h2 className="form-header-title">Surplus Details</h2>
              <span className="form-header-sub">Takes under 60 seconds</span>
            </div>

            {errorMsg && (
              <div className="form-error-banner">
                <span className="err-icon">⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="custom-report-form">
              {/* Food Type */}
              <div className="form-field-group">
                <label htmlFor="foodTypeSelect" className="field-label">
                  Food Type <span className="req">*</span>
                </label>
                <select
                  id="foodTypeSelect"
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  className="field-input"
                  required
                >
                  <option value="">Select category...</option>
                  <option value="Cooked Meals">Cooked Meals (curry, rice, platters)</option>
                  <option value="Rice">Rice & Lentils / Biryani</option>
                  <option value="Bread">Bread, Buns & Bakery</option>
                  <option value="Fruits & Vegetables">Fruits & Fresh Vegetables</option>
                  <option value="Packaged Food">Packaged / Canned Food & Dairy</option>
                  <option value="Other">Other Fresh Edibles</option>
                </select>
              </div>

              {/* Quantity and Urgency in 2 columns */}
              <div className="form-two-col">
                <div className="form-field-group">
                  <label htmlFor="quantityInput" className="field-label">
                    Approximate Quantity (Servings) <span className="req">*</span>
                  </label>
                  <input
                    id="quantityInput"
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="field-input"
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="urgencySelect" className="field-label">
                    Pickup Urgency <span className="req">*</span>
                  </label>
                  <select
                    id="urgencySelect"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="field-input"
                  >
                    <option value="Critical">Critical — ASAP (within 45 mins)</option>
                    <option value="High">High — within 1-2 hours</option>
                    <option value="Medium">Medium — within 3-4 hours</option>
                    <option value="Low">Low — within 6+ hours</option>
                  </select>
                </div>
              </div>

              {/* Pickup Location */}
              <div className="form-field-group">
                <label htmlFor="locationInput" className="field-label">
                  Pickup Location <span className="req">*</span>
                </label>
                <input
                  id="locationInput"
                  type="text"
                  placeholder="e.g. Royal Banquet Hall, Sector 14, Ghaziabad"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="field-input"
                  required
                />
              </div>

              {/* Donor Name & Pickup Deadline */}
              <div className="form-two-col">
                <div className="form-field-group">
                  <label htmlFor="donorInput" className="field-label">
                    Donor / Venue Name (Optional)
                  </label>
                  <input
                    id="donorInput"
                    type="text"
                    placeholder="e.g. Metro Caterers / University Mess"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="field-input"
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="deadlinInput" className="field-label">
                    Pickup Deadline (Optional)
                  </label>
                  <input
                    id="deadlinInput"
                    type="text"
                    placeholder="e.g. Before 9:30 PM tonight"
                    value={pickupDeadline}
                    onChange={(e) => setPickupDeadline(e.target.value)}
                    className="field-input"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-field-group">
                <label htmlFor="descriptionInput" className="field-label">
                  Optional Food Description & Packaging Details
                </label>
                <textarea
                  id="descriptionInput"
                  rows="3"
                  placeholder="e.g. Untouched buffet items, paneer butter masala and parathas packed in sealed aluminum containers. Needs refrigeration."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="field-input"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-rescue-btn"
                id="submit-food-rescue-btn"
              >
                🚨 Submit Food Rescue
              </button>
            </form>
          </div>

          {/* Right: Live Radar Card Preview */}
          <div className="preview-card-sidebar">
            <div className="preview-sticky-wrap">
              <div className="preview-label-tag">
                <span>👁️ LIVE RADAR PREVIEW</span>
              </div>

              <div className="donation-card preview-card">
                <div className="card-top-row">
                  <div className="food-type-header">
                    <span className="card-food-emoji">
                      {foodType === "Cooked Meals" ? "🍱" :
                       foodType === "Rice" ? "🍚" :
                       foodType === "Bread" ? "🍞" :
                       foodType === "Fruits & Vegetables" ? "🥗" :
                       foodType === "Packaged Food" ? "🥫" : "🍲"}
                    </span>
                    <div>
                      <h3 className="card-food-title">
                        {foodType || "Surplus Food Category"}
                      </h3>
                      <span className="card-donor-name">
                        {donorName || "Your Organization / Venue"}
                      </span>
                    </div>
                  </div>
                  <UrgencyBadge urgency={urgency} />
                </div>

                <div className="card-metrics-block">
                  <div className="metric-box">
                    <span className="metric-label">Servings</span>
                    <strong className="metric-number">{quantity || "0"}</strong>
                    <span className="metric-unit">servings</span>
                  </div>

                  <div className="metric-box">
                    <span className="metric-label">Location</span>
                    <strong className="metric-place">
                      {location ? location.split(",")[0] : "Location specified"}
                    </strong>
                    <span className="metric-dist">📍 1.2 km away</span>
                  </div>

                  <div className="metric-box">
                    <span className="metric-label">Pickup</span>
                    <strong className="metric-deadline">
                      {pickupDeadline || "ASAP"}
                    </strong>
                  </div>
                </div>

                <p className="card-snippet">
                  {description || "Surplus food details and dietary safety notes will appear here."}
                </p>

                <div className="card-status-strip">
                  <span className="status-badge status-posted">
                    <span className="status-icon">🟢</span>
                    <span className="status-label">Ready for Smart Matching</span>
                  </span>
                </div>

                <div className="preview-tip-box">
                  <span>💡 Once posted, FoodRescue Radar will score and rank compatible NGOs automatically.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Modal */}
      <MatchModal />
    </div>
  );
}