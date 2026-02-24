import type { Trip, Activity, ActivityCategory } from "../models/index.js";

// add an activity to a trip
export const addActivity = (trip: Trip, activity: Activity): Trip => {
  trip.activities.push(activity);
  return trip;
};

// remove an activity from a trip
export const removeActivity = (trip: Trip, activityId: string): Trip => {
  trip.activities = trip.activities.filter(
    (activity) => activity.id !== activityId,
  );
  return trip;
};

// export const calculateTotalCost = (trip: Trip): number => {
//   return trip.activities.reduce((sum, activity) => sum + activity.cost, 0);
// };

export const getActivitiesByCategory = (
  trip: Trip,
  category: Activity["category"],
): Activity[] => {
  return trip.activities.filter((activity) => activity.category === category);
};

// export const sortActivitiesByTime = (trip: Trip): Activity[] => {
//   return trip.activities.sort(
//     (a, b) => a.startTime.getTime() - b.startTime.getTime(),
//   );
// };

// sort trips by start date
export const sortTripsByDate = (trips: Trip[]): Trip[] => {
  return trips.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
};

// sort activities by weekday and time
// export const sortActivitiesByWeekdayAndTime = (trip: Trip): Activity[] => {
//   return trip.activities.sort((a, b) => {
//     const dayA = a.startTime.getDay(); // 0 = Sunday
//     const dayB = b.startTime.getDay();

//     if (dayA !== dayB) {
//       return dayA - dayB; // sort by weekday
//     }

//     // If same weekday → sort by time
//     return a.startTime.getTime() - b.startTime.getTime();
//   });
// };

export const sortActivitiesByWeekday = (trip: Trip): Activity[] => {
  return [...trip.activities].sort((a, b) => {
    const getWeekday = (date: Date) => {
      const day = new Date(date).getDay();
      return day === 0 ? 7 : day; // Sunday becomes 7
    };

    const dayA = getWeekday(a.startTime);
    const dayB = getWeekday(b.startTime);

    return dayA - dayB; // Only sort by weekday
  });
};
