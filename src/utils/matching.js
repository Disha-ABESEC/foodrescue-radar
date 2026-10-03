/**
 * Smart Matching Engine for FoodRescue Radar
 *
 * Scoring model weights:
 * - Urgency: 35%
 * - Distance: 25%
 * - Capacity fit: 25%
 * - Food type compatibility: 15%
 * Total = 100%
 */

/**
 * Generate a dynamic human-readable explanation based on actual score and parameters
 */
export function generateMatchExplanation(donation, organization, breakdown, totalScore) {
  const parts = [];

  // Proximity
  const dist = breakdown.distance.distanceKm;
  if (dist <= 1.8) {
    parts.push(`is very close (${dist} km away)`);
  } else if (dist <= 3.5) {
    parts.push(`is nearby (${dist} km away)`);
  } else {
    parts.push(`is within reachable dispatch distance (${dist} km)`);
  }

  // Food compatibility
  if (breakdown.foodType.accepted) {
    parts.push(`accepts this food type (${donation.foodType || "prepared food"})`);
  } else {
    parts.push(`has flexible intake provisions`);
  }

  // Capacity fit
  const cap = organization.capacity || 100;
  const qty = donation.quantity || 50;
  if (cap >= qty) {
    parts.push(`has enough capacity (${cap} servings for ${qty} needed)`);
  } else {
    parts.push(`can absorb a significant portion (${cap} of ${qty} servings)`);
  }

  // Urgency
  if (donation.urgency === "Critical" || donation.urgency === "High") {
    if (organization.isEmergencyReady) {
      parts.push("the donation is time-sensitive with rapid dispatch readiness");
    } else {
      parts.push("the donation is time-sensitive");
    }
  }

  let strength = "Strong match";
  if (totalScore >= 90) strength = "Prime match";
  else if (totalScore >= 80) strength = "Strong match";
  else if (totalScore >= 65) strength = "Moderate match";
  else strength = "Partial match";

  if (parts.length === 0) {
    return `${strength} based on geographic proximity and capacity.`;
  }

  if (parts.length === 1) {
    return `${strength} because this organization ${parts[0]}.`;
  }

  const allExceptLast = parts.slice(0, -1).join(", ");
  const last = parts[parts.length - 1];

  return `${strength} because this organization ${allExceptLast}, and ${last}.`;
}

export function calculateMatchScore(donation, organization) {
  // 1. Food Type Compatibility (15% weight)
  let foodTypePoints = 0;
  const donationType = (donation.foodType || "").toLowerCase();
  const acceptsDirectly = (organization.acceptedFoodTypes || []).some(
    (type) => type.toLowerCase() === donationType
  );
  const acceptsOther = (organization.acceptedFoodTypes || []).includes("Other");

  if (acceptsDirectly) {
    foodTypePoints = 15;
  } else if (acceptsOther) {
    foodTypePoints = 10;
  } else {
    foodTypePoints = 3;
  }

  // 2. Capacity Fit (25% weight)
  let capacityPoints = 0;
  const capacity = organization.capacity || 100;
  const quantity = donation.quantity || 50;

  if (capacity >= quantity) {
    const ratio = capacity / quantity;
    if (ratio <= 2.0) {
      capacityPoints = 25;
    } else if (ratio <= 4.0) {
      capacityPoints = 22;
    } else {
      capacityPoints = 18;
    }
  } else {
    const fillRatio = capacity / quantity;
    capacityPoints = Math.max(6, Math.round(fillRatio * 20));
  }

  // 3. Distance Proximity (25% weight)
  const dist = organization.distanceKm || 3.0;
  let distancePoints = 0;
  if (dist <= 1.5) {
    distancePoints = 25;
  } else if (dist <= 2.5) {
    distancePoints = 22;
  } else if (dist <= 4.0) {
    distancePoints = 19;
  } else if (dist <= 6.0) {
    distancePoints = 14;
  } else if (dist <= 8.0) {
    distancePoints = 10;
  } else {
    distancePoints = 5;
  }

  // 4. Urgency Alignment (35% weight)
  let urgencyPoints = 0;
  const urgency = donation.urgency || "Medium";
  const isEmergencyReady = Boolean(organization.isEmergencyReady);

  switch (urgency) {
    case "Critical":
      urgencyPoints = isEmergencyReady ? 35 : 30;
      break;
    case "High":
      urgencyPoints = isEmergencyReady ? 32 : 28;
      break;
    case "Medium":
      urgencyPoints = isEmergencyReady ? 25 : 22;
      break;
    case "Low":
    default:
      urgencyPoints = 18;
      break;
  }

  const rawScore = foodTypePoints + capacityPoints + distancePoints + urgencyPoints;
  const finalScore = Math.min(99, Math.max(15, Math.round(rawScore)));

  // Generate suitability label
  let suitabilityLabel = "Standard Match";
  if (finalScore >= 90) suitabilityLabel = "Prime Match (Recommended)";
  else if (finalScore >= 80) suitabilityLabel = "Strong Match";
  else if (finalScore >= 65) suitabilityLabel = "Compatible";
  else suitabilityLabel = "Low Match";

  const breakdown = {
    urgency: {
      points: urgencyPoints,
      max: 35,
      percent: Math.round((urgencyPoints / 35) * 100),
      weight: "35%"
    },
    distance: {
      points: distancePoints,
      max: 25,
      percent: Math.round((distancePoints / 25) * 100),
      weight: "25%",
      distanceKm: dist
    },
    capacity: {
      points: capacityPoints,
      max: 25,
      percent: Math.round((capacityPoints / 25) * 100),
      weight: "25%",
      orgCapacity: capacity,
      donationQuantity: quantity
    },
    foodType: {
      points: foodTypePoints,
      max: 15,
      percent: Math.round((foodTypePoints / 15) * 100),
      weight: "15%",
      accepted: acceptsDirectly
    }
  };

  const explanation = generateMatchExplanation(donation, organization, breakdown, finalScore);

  return {
    organization,
    score: finalScore,
    suitabilityLabel,
    explanation,
    breakdown
  };
}

/**
 * Rank all organizations for a given donation
 */
export function rankOrganizationsForDonation(donation, organizations) {
  if (!organizations || organizations.length === 0) return [];

  const evaluated = organizations.map((org) => calculateMatchScore(donation, org));

  // Sort descending by match score
  evaluated.sort((a, b) => b.score - a.score);

  return evaluated;
}
