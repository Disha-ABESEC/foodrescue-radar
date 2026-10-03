import { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_DONATIONS,
  INITIAL_RESCUE_HISTORY
} from "../data/initialData";
import { calculateImpactMetrics } from "../utils/impact";

const RescueContext = createContext(null);

export function RescueProvider({ children }) {
  // 1. Initialize state from localStorage or initial seed data
  const [donations, setDonations] = useState(() => {
    try {
      const stored = localStorage.getItem("foodDonations");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to read foodDonations from localStorage", e);
    }
    return INITIAL_DONATIONS;
  });

  const [organizations, setOrganizations] = useState(() => {
    try {
      const stored = localStorage.getItem("organizations");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to read organizations from localStorage", e);
    }
    return INITIAL_ORGANIZATIONS;
  });

  const [rescueHistory, setRescueHistory] = useState(() => {
    try {
      const stored = localStorage.getItem("rescueHistory");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to read rescueHistory from localStorage", e);
    }
    return INITIAL_RESCUE_HISTORY;
  });

  // State for the "Where can this food go?" Match Modal
  const [activeModalDonation, setActiveModalDonation] = useState(null);

  // Sync back to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem("foodDonations", JSON.stringify(donations));
    } catch (e) {
      console.error("Error saving foodDonations", e);
    }
  }, [donations]);

  useEffect(() => {
    try {
      localStorage.setItem("organizations", JSON.stringify(organizations));
    } catch (e) {
      console.error("Error saving organizations", e);
    }
  }, [organizations]);

  useEffect(() => {
    try {
      localStorage.setItem("rescueHistory", JSON.stringify(rescueHistory));
    } catch (e) {
      console.error("Error saving rescueHistory", e);
    }
  }, [rescueHistory]);

  // Actions
  const addDonation = (newDonation) => {
    const donationWithDefaults = {
      id: Date.now(),
      status: "Posted",
      createdAt: new Date().toISOString(),
      selectedOrganization: null,
      matchScore: null,
      isUserReported: true,
      ...newDonation
    };

    setDonations((prev) => [donationWithDefaults, ...prev]);
    return donationWithDefaults;
  };

  const acceptRescue = (donationId, organization, matchScore) => {
    setDonations((prev) =>
      prev.map((d) => {
        if (d.id === donationId) {
          return {
            ...d,
            status: "Accepted",
            selectedOrganization: organization,
            matchScore: matchScore !== undefined ? matchScore : d.matchScore,
            acceptedAt: new Date().toISOString()
          };
        }
        return d;
      })
    );

    // Also update current active modal donation if it matches
    setActiveModalDonation((prev) => {
      if (prev && prev.id === donationId) {
        return {
          ...prev,
          status: "Accepted",
          selectedOrganization: organization,
          matchScore: matchScore !== undefined ? matchScore : prev.matchScore,
          acceptedAt: new Date().toISOString()
        };
      }
      return prev;
    });
  };

  const markPickedUp = (donationId) => {
    setDonations((prev) =>
      prev.map((d) => {
        if (d.id === donationId) {
          return {
            ...d,
            status: "Picked Up",
            pickedUpAt: new Date().toISOString()
          };
        }
        return d;
      })
    );

    setActiveModalDonation((prev) => {
      if (prev && prev.id === donationId) {
        return {
          ...prev,
          status: "Picked Up",
          pickedUpAt: new Date().toISOString()
        };
      }
      return prev;
    });
  };

  const markRescued = (donationId) => {
    let completedDonation = null;

    setDonations((prev) =>
      prev.map((d) => {
        if (d.id === donationId) {
          completedDonation = {
            ...d,
            status: "Rescued",
            rescuedAt: new Date().toISOString()
          };
          return completedDonation;
        }
        return d;
      })
    );

    if (completedDonation) {
      const historyEntry = {
        id: completedDonation.id,
        foodType: completedDonation.foodType,
        quantity: completedDonation.quantity,
        donorName: completedDonation.donorName || "Local Food Donor",
        donorLocation: completedDonation.location,
        organization:
          completedDonation.selectedOrganization?.name || "Partner Organization",
        organizationId: completedDonation.selectedOrganization?.id || null,
        date: new Date().toISOString(),
        status: "Rescued",
        durationMins: Math.floor(Math.random() * 20 + 25),
        co2AvoidedKg: Number((completedDonation.quantity * 0.45 * 1.9).toFixed(1)),
        mealsSaved: completedDonation.quantity
      };

      setRescueHistory((prev) => {
        const exists = prev.some((h) => h.id === historyEntry.id);
        if (exists) {
          return prev.map((h) => (h.id === historyEntry.id ? historyEntry : h));
        }
        return [historyEntry, ...prev];
      });
    }

    setActiveModalDonation((prev) => {
      if (prev && prev.id === donationId) {
        return {
          ...prev,
          status: "Rescued",
          rescuedAt: new Date().toISOString()
        };
      }
      return prev;
    });
  };

  const openMatchModal = (donation) => {
    setActiveModalDonation(donation);
  };

  const closeMatchModal = () => {
    setActiveModalDonation(null);
  };

  const resetToDemoData = () => {
    localStorage.removeItem("foodDonations");
    localStorage.removeItem("organizations");
    localStorage.removeItem("rescueHistory");
    setDonations(INITIAL_DONATIONS);
    setOrganizations(INITIAL_ORGANIZATIONS);
    setRescueHistory(INITIAL_RESCUE_HISTORY);
    setActiveModalDonation(null);
  };

  // Dynamic statistics
  const activeDonations = donations.filter((d) => d.status !== "Rescued");
  const activeRescuesCount = activeDonations.length;

  const servingsAvailable = activeDonations.reduce(
    (sum, d) => sum + (Number(d.quantity) || 0),
    0
  );

  const urgentRescuesCount = activeDonations.filter(
    (d) => d.urgency === "Critical" || d.urgency === "High"
  ).length;

  const impact = useMemo(() => {
    return calculateImpactMetrics(rescueHistory, donations);
  }, [rescueHistory, donations]);

  return (
    <RescueContext.Provider
      value={{
        donations,
        organizations,
        rescueHistory,
        activeDonations,
        activeModalDonation,
        openMatchModal,
        closeMatchModal,
        addDonation,
        acceptRescue,
        markPickedUp,
        markRescued,
        resetToDemoData,
        // Stats & Impact
        impact,
        stats: {
          activeRescuesCount,
          servingsAvailable,
          urgentRescuesCount,
          totalFoodRescuedServings: impact.totalServingsRescued,
          totalCompletedRescues: impact.totalCompletedRescues,
          impact
        }
      }}
    >
      {children}
    </RescueContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRescue() {
  const context = useContext(RescueContext);
  if (!context) {
    throw new Error("useRescue must be used within a RescueProvider");
  }
  return context;
}
