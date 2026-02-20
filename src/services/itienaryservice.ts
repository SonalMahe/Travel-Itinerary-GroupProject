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

console.log(
  "\nItinerary service functions have been implemented successfully.\n",
);

// Filters activities in the trip itinerary by a specified category.
export const getActivitiesByCategory = (
  trip: Trip,
  category: Activity["category"],
): Activity[] => {
  return trip.activities.filter((activity) => activity.category === category);
};

// Sorts activities in the trip itinerary by their start time in ascending order.
export const sortActivitiesByTime = (trip: Trip): Activity[] => {
  return trip.activities.sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
  );
};

// Sorts trips by their start date in ascending order.
export const sortTripsByDate = (trips: Trip[]): Trip[] => {
  return trips.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
};

console.log(
  "\nAdditional itinerary service functions (filtering and sorting) have been implemented successfully.\n",
);

// This PR adds the itinerary service with core functions:
// - Add activity to trip
// - Remove activity from trip
// - Calculate total cost of activities in the trip
// - Filter activities by category
