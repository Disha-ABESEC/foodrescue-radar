/**
 * Sustainability Impact Calculations for FoodRescue Radar
 * Uses FAO benchmarks:
 * - ~0.45 kg of edible food waste avoided per meal serving
 * - ~1.9 kg of CO2 avoided per kg of food saved from landfill decomposition
 */

export function calculateImpactMetrics(rescueHistoryList = [], donationsList = []) {
  // Combine rescue history and any rescued donations without duplication
  const rescuedMap = new Map();

  // Add history entries first
  if (Array.isArray(rescueHistoryList)) {
    rescueHistoryList.forEach((item) => {
      if (item && item.id) {
        rescuedMap.set(String(item.id), {
          id: item.id,
          foodType: item.foodType,
          quantity: Number(item.quantity) || 0,
          organization: item.organization || item.selectedOrganization?.name || "Partner Shelter",
          date: item.date || item.rescuedAt || item.createdAt || new Date().toISOString()
        });
      }
    });
  }

  // Also include any donations marked 'Rescued' if not already in history
  if (Array.isArray(donationsList)) {
    donationsList.forEach((d) => {
      if (d && d.status === "Rescued" && d.id) {
        const key = String(d.id);
        if (!rescuedMap.has(key)) {
          rescuedMap.set(key, {
            id: d.id,
            foodType: d.foodType,
            quantity: Number(d.quantity) || 0,
            organization: d.selectedOrganization?.name || "Partner Shelter",
            date: d.rescuedAt || d.createdAt || new Date().toISOString()
          });
        }
      }
    });
  }

  const allRescued = Array.from(rescuedMap.values());

  const totalServingsRescued = allRescued.reduce(
    (acc, curr) => acc + (Number(curr.quantity) || 0),
    0
  );

  const totalCompletedRescues = allRescued.length;

  const distinctOrgs = new Set(
    allRescued.map((item) => item.organization).filter(Boolean)
  ).size;

  // Approx ~0.45 kg food waste avoided per serving
  const estimatedWasteAvoidedKg = Math.round(totalServingsRescued * 0.45);

  // Approx ~1.9 kg CO2 avoided per kg of food saved (FAO benchmark)
  const estimatedCo2AvoidedKg = Math.round(estimatedWasteAvoidedKg * 1.9);

  return {
    allRescued,
    totalServingsRescued,
    totalCompletedRescues,
    distinctOrgs,
    estimatedWasteAvoidedKg,
    estimatedCo2AvoidedKg
  };
}
