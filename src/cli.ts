import inquirer from "inquirer";
import type { Trip, Activity } from "./models/index.js";
import {
  addActivity,
  removeActivity,
  sortTripsByDate,
  sortActivitiesByWeekdayAndTime,
} from "./services/itienaryservice.js";

// Temporary in-memory storage
let trips: Trip[] = [];

// MAIN MENU FUNCTION
const mainMenu = async () => {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "Choose an option:",
      choices: [
        "Create Trip",
        "Add Activity",
        "Remove Activity",
        "Sort Trips by Date",
        "Sort Activities by Weekday & Time",
        "Exit",
      ],
    },
  ]);

  switch (action) {
    case "Create Trip":
      await createTrip();
      break;

    case "Add Activity":
      await addActivityToTrip();
      break;

    case "Remove Activity":
      await removeActivityFromTrip();
      break;

    case "Sort Trips by Date":
      sortTrips();
      break;

    case "Sort Activities by Weekday & Time":
      await sortActivitiesByWeekdayAndTimeInTrip();
      break;

    case "Exit":
      console.log("Goodbye 👋");
      return;
  }

  mainMenu();
};

// CREATE TRIP
const createTrip = async () => {
  const answers = await inquirer.prompt([
    { type: "input", name: "id", message: "Trip ID:" },
    { type: "input", name: "name", message: "Trip Name:" },
    { type: "input", name: "startDate", message: "Start Date (YYYY-MM-DD):" },
  ]);

  const newTrip: Trip = {
    id: answers.id,
    name: answers.name,
    startDate: new Date(answers.startDate),
    activities: [],
    destination: "",
  };

  trips.push(newTrip);
  console.log("Trip created successfully ✅");
};

// ADD ACTIVITY
const addActivityToTrip = async () => {
  if (trips.length === 0) {
    console.log("No trips available.");
    return;
  }

  const { tripId } = await inquirer.prompt([
    {
      type: "list",
      name: "tripId",
      message: "Select Trip:",
      choices: trips.map((trip) => trip.id),
    },
  ]);

  const trip = trips.find((t) => t.id === tripId);
  if (!trip) return;

  const answers = await inquirer.prompt([
    { type: "input", name: "id", message: "Activity ID:" },
    { type: "input", name: "name", message: "Activity Name:" },
    {
      type: "input",
      name: "dateTime",
      message: "Activity Date & Time (YYYY-MM-DD HH:mm):",
    },
  ]);

  const newActivity: Activity = {
    id: answers.id,
    name: answers.name,
    startTime: new Date(answers.dateTime),
    cost: 0,
    endTime: new Date(answers.dateTime), // Placeholder, can be updated later
    category: "sightseeing", // Default category, can be updated later
  };

  addActivity(trip, newActivity);
  console.log("Activity added ✅");
};

// REMOVE ACTIVITY
const removeActivityFromTrip = async () => {
  const { tripId } = await inquirer.prompt([
    {
      type: "list",
      name: "tripId",
      message: "Select Trip:",
      choices: trips.map((trip) => trip.id),
    },
  ]);

  const trip = trips.find((t) => t.id === tripId);
  if (!trip || trip.activities.length === 0) return;

  const { activityId } = await inquirer.prompt([
    {
      type: "list",
      name: "activityId",
      message: "Select Activity to Remove:",
      choices: trip.activities.map((a) => a.id),
    },
  ]);

  removeActivity(trip, activityId);
  console.log("Activity removed");
};

// SORT TRIPS
const sortTrips = () => {
  sortTripsByDate(trips);
  console.log("Trips sorted by date 📅");

  trips.forEach((trip) => {
    console.log(`${trip.name} - ${trip.startDate.toDateString()}`);
  });
};

// SORT ACTIVITIES
const weekdayOrder = (date: Date): number => {
  return (date.getDay() + 6) % 7; // 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
};

const sortActivitiesByWeekdayAndTimeInTrip = async () => {
  const { tripId } = await inquirer.prompt([
    {
      type: "list",
      name: "tripId",
      message: "Select Trip:",
      choices: trips.map((trip) => trip.id),
    },
  ]);

  const trip = trips.find((t) => t.id === tripId);
  if (!trip) return;

  trip.activities = sortActivitiesByWeekdayAndTime(trip);

  console.log("Activities sorted by weekday & time 🗓️");

  trip.activities.forEach((activity) => {
    console.log(
      `${activity.name} - ${activity.startTime.toDateString()} ${activity.startTime.toLocaleTimeString()}`,
    );
  });
};

// START APP
mainMenu();
