export type ActivityCategory =
  | "food"
  | "transport"
  | "sightseeing"
  | "accommodation";

export type Activity = {
  id: string;
  name: string;
  description?: string;
  cost: number;
  category: ActivityCategory;
  startTime: Date;
};

export type Trip = {
  id: string;
  destination: string;
  startDate: Date;
  endDate?: Date;
  activities: Activity[];
};
