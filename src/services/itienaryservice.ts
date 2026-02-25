import type { Trip, Activity, ActivityCategory } from "../models/index.js";

// Add an activity to a trip
export const addActivity = (trip: Trip, activity: Activity): Trip => {
  trip.activities.push(activity);
  return trip;
};

// Remove an activity from a trip by ID
export const removeActivity = (trip: Trip, activityId: string): Trip => {
  trip.activities = trip.activities.filter((a) => a.id !== activityId);
  return trip;
};

// Filter activities by category
export const getActivitiesByCategory = (
  trip: Trip,
  category: ActivityCategory
): Activity[] => {
  return trip.activities.filter((a) => a.category === category);
};

// Get activities for a specific day (YYYY-MM-DD)
export const getActivitiesForDay = (
  trip: Trip,
  date: string
): Activity[] => {
  return trip.activities.filter((a) => a.date === date);
};

// Sort activities chronologically by date
export const sortActivitiesChronologically = (trip: Trip): Activity[] => {
  return [...trip.activities].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
};

// Group activities by day
export const groupActivitiesByDay = (
  trip: Trip
): Record<string, Activity[]> => {
  const grouped: Record<string, Activity[]> = {};

  const sorted = sortActivitiesChronologically(trip);

  for (const activity of sorted) {
    const day = activity.date;
    if (!grouped[day]) {
      grouped[day] = [];
    }
    grouped[day].push(activity);
  }

  return grouped;
};
