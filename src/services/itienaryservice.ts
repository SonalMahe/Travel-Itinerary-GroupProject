import type { Trip, Activity } from "../models/index.js";

// Manages trip itineraries, including adding/removing activities and calculating total costs.
export const addActivity = (trip: Trip, activity: Activity): Trip => {
  trip.activities.push(activity);
  return trip;
};

// Removes an activity from the trip itinerary based on the activity ID.
export const removeActivity = (trip: Trip, activityId: string): Trip => {
  trip.activities = trip.activities.filter(
    (activity) => activity.id !== activityId,
  );
  return trip;
};

// Calculates the total cost of all activities in the trip itinerary.
export const calculateTotalCost = (trip: Trip): number => {
  return trip.activities.reduce((sum, activity) => sum + activity.cost, 0);
};

// This PR adds the itinerary service with core functions:
// - Add activity to trip
// - Remove activity from trip
// - Calculate total cost of activities in the trip
// - Filter activities by category

// store data in json file
// create a pr
