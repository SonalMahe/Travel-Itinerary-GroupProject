export type ActivityCategory =
  | "food"
  | "transport"
  | "sightseeing"
  | "accommodation";

// Activity in a trip
export type Activity = {
  id: string;
  name: string;
  cost: number;
  category: ActivityCategory;
  date: string; // YYYY-MM-DD
};

// Trip
export type Trip = {
  id: string;
  name: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  currency: string;
  flag: string;
  activities: Activity[];
};

// The full database structure
export type Database = {
  trips: Trip[];
};
