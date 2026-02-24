export type ActivityCategory =
  | "food"
  | "transport"
  | "sightseeing"
  | "accommodation";
 
export type Activity = {
  id: string;
  name: string;
  cost: number;
  category: ActivityCategory;
  startTime: Date;
  endTime: Date;
};
 
export type Trip = {
  id: string;
  name: any;
  destination: string;
  startDate: Date;
  endDate?: Date;
  activities: Activity[];
  currency: string;
};