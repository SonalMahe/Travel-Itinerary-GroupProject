import type { Trip, Activity, ActivityCategory } from "../models/index.js";

// I Want To calculate The total cost of my trip so that i can manage  my  budget

export const getTotalTripCost = (trip: Trip): number => {
  return trip.activities.reduce((total, activity) => {
    return total + activity.cost;
  }, 0);
};

// I want to filler activities by category like(food transport sightseeing)
// so that i can easily find specific types of activites.

/*export const getActivitiesByCategory = (
  trip: Trip,
  category: ActivityCategory,
): Activity[] => {
  return trip.activities.filter((a) => a.category === category);
};*/

// i want to  identify  heigh cost activities that exceed
// a certain threshold so that i can review my expenses.

export const getHighCostActivities = (
  trip: Trip,
  threshold: number,
): Activity[] => {
  return trip.activities.filter((a) => a.cost > threshold);
};

// Get totals per category

export function getTotalsPerCategory(trip: Trip) {
  const totals = {
    food: 0,
    transport: 0,
    sightseeing: 0,
  };

  for (const activity of trip.activities) {
    if (activity.category === "food") {
      totals.food += activity.cost;
    } else if (activity.category === "transport") {
      totals.transport += activity.cost;
    } else if (activity.category === "sightseeing") {
      totals.sightseeing += activity.cost;
    }
  }

  return totals;
}
