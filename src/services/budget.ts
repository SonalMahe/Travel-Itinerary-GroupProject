import type { Trip, Activity, ActivityCategory } from "../models/index.js";

// Calculate the total cost of a trip
export const getTotalTripCost = (trip: Trip): number => {
  return trip.activities.reduce((total, activity) => total + activity.cost, 0);
};

// Identify high-cost activities that exceed a threshold
export const getHighCostActivities = (
  trip: Trip,
  threshold: number
): Activity[] => {
  return trip.activities.filter((a) => a.cost > threshold);
};

// Get cost totals broken down per category
export const getTotalsPerCategory = (
  trip: Trip
): Record<ActivityCategory, number> => {
  const totals: Record<ActivityCategory, number> = {
    food: 0,
    transport: 0,
    sightseeing: 0,
    accommodation: 0,
  };

  for (const activity of trip.activities) {
    totals[activity.category] += activity.cost;
  }

  return totals;
};
