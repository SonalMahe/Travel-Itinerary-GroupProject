import inquirer from "inquirer";
import chalk from "chalk";
import type { Trip, Activity, ActivityCategory } from "./models/index.js";

import {
  addActivity,
  removeActivity,
  sortActivitiesByWeekday,
  getActivitiesByCategory,
} from "./services/itienaryservice.js";

import {
  getTotalTripCost,
  getHighCostActivities,
  getTotalsPerCategory,
} from "./services/budget.js";

import { getDestinationInfo } from "./services/destinationservices.js";
import type { DestinationInfo } from "./services/destinationservices.js";
import activityData from "./db.json" with { type: "json" };

type ActivityOption = { name: string; cost: number };

let currentTrip: Trip | null = null;

/* ─────────────────────────────────────────── */
/* MAIN MENU */
/* ─────────────────────────────────────────── */

const mainMenu = async (): Promise<void> => {
  let exit = false;

  while (!exit) {
    console.log(chalk.blue.bold("\n======= Travel Itinerary Manager ======="));

    const { action } = await inquirer.prompt<{ action: string }>([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "Create Trip",
          "Add Activity",
          "Remove Activity",
          "View Activities (Grouped by Day)",
          "View Activities by Category",
          "View Budget",
          "View Destination Info",
          "Exit",
        ],
      },
    ]);

    switch (action) {
      case "Create Trip":
        await createTrip();
        break;
      case "Add Activity":
        await handleAddActivity();
        break;
      case "Remove Activity":
        await handleRemoveActivity();
        break;
      case "View Activities (Grouped by Day)":
        viewActivitiesGrouped();
        break;
      case "View Activities by Category":
        await viewActivitiesByCategory();
        break;
      case "View Budget":
        viewBudget();
        break;
      case "View Destination Info":
        await viewDestinationInfo();
        break;
      case "Exit":
        exit = true;
        console.log(chalk.green("Goodbye 👋"));
        break;
    }
  }
};

/* ─────────────────────────────────────────── */
/* CREATE TRIP */
/* ─────────────────────────────────────────── */

const createTrip = async (): Promise<void> => {
  const answers = await inquirer.prompt<{
    destination: string;
    startDate: string;
    endDate: string;
  }>([
    {
      type: "list",
      name: "destination",
      message: "Select destination:",
      choices: Object.keys(activityData),
    },
    {
      type: "input",
      name: "startDate",
      message: "Start date (YYYY-MM-DD):",
      default: new Date().toISOString().split("T")[0],
      validate: (value) =>
        /^\d{4}-\d{2}-\d{2}$/.test(value) || "Invalid date format",
    },
    {
      type: "input",
      name: "endDate",
      message: "End date (YYYY-MM-DD):",
      default: new Date().toISOString().split("T")[0],
      validate: (value, answers) =>
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        new Date(value) >= new Date(answers.startDate)
          ? true
          : "End date must be after start date",
    },
  ]);

  currentTrip = {
    id: Date.now().toString(),
    destination: answers.destination,
    startDate: new Date(answers.startDate),
    endDate: new Date(answers.endDate),
    activities: [],
    currency: activityData[answers.destination].currency,
  };

  console.log(chalk.green("\nTrip created successfully!\n"));
};

/* ─────────────────────────────────────────── */
/* ADD ACTIVITY */
/* ─────────────────────────────────────────── */

const handleAddActivity = async (): Promise<void> => {
  if (!currentTrip) {
    console.log(chalk.red("Create a trip first.\n"));
    return;
  }

  const { category } = await inquirer.prompt<{ category: ActivityCategory }>([
    {
      type: "list",
      name: "category",
      message: "Select category:",
      choices: ["food", "transport", "sightseeing", "accommodation"],
    },
  ]);

  const options = activityData[currentTrip.destination][category];

  const { selected } = await inquirer.prompt<{ selected: ActivityOption }>([
    {
      type: "list",
      name: "selected",
      message: "Choose activity:",
      choices: options.map((o: ActivityOption) => ({
        name: `${o.name} (${currentTrip?.currency} ${o.cost})`,
        value: o,
      })),
    },
  ]);

  const { dateInput } = await inquirer.prompt<{ dateInput: string }>([
    {
      type: "input",
      name: "dateInput",
      message: "Enter activity date (YYYY-MM-DD):",
      validate: (value) =>
        /^\d{4}-\d{2}-\d{2}$/.test(value) || "Format must be YYYY-MM-DD",
    },
  ]);

  const activityDate = new Date(dateInput);

  if (
    activityDate < currentTrip.startDate ||
    activityDate > currentTrip.endDate
  ) {
    console.log(
      chalk.red("Activity must be within trip start and end date.\n"),
    );
    return;
  }

  const activity: Activity = {
    id: Date.now().toString(),
    name: selected.name,
    cost: selected.cost,
    category,
    startTime: activityDate,
    endTime: activityDate,
  };

  currentTrip = addActivity(currentTrip, activity);

  console.log(chalk.green("Activity added successfully!\n"));
};

/* ─────────────────────────────────────────── */
/* REMOVE ACTIVITY */
/* ─────────────────────────────────────────── */

const handleRemoveActivity = async (): Promise<void> => {
  if (!currentTrip || currentTrip.activities.length === 0) {
    console.log(chalk.red("No activities to remove.\n"));
    return;
  }

  const { activityId } = await inquirer.prompt<{ activityId: string }>([
    {
      type: "list",
      name: "activityId",
      message: "Select activity to remove:",
      choices: currentTrip.activities.map((a) => ({
        name: `${a.name} (${currentTrip?.currency} ${a.cost})`,
        value: a.id,
      })),
    },
  ]);

  currentTrip = removeActivity(currentTrip, activityId);

  console.log(chalk.green("Activity removed successfully!\n"));
};

/* ─────────────────────────────────────────── */
/* VIEW GROUPED ACTIVITIES BY WEEKDAY */
/* ─────────────────────────────────────────── */

const viewActivitiesGrouped = (): void => {
  if (!currentTrip || currentTrip.activities.length === 0) {
    console.log(chalk.red("No activities available.\n"));
    return;
  }

  const sorted = sortActivitiesByWeekday(currentTrip);

  const grouped: Record<string, Activity[]> = {};

  sorted.forEach((activity) => {
    const day = activity.startTime.toDateString();
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(activity);
  });

  console.log(chalk.yellow("\nActivities by Day:\n"));

  Object.keys(grouped).forEach((day) => {
    console.log(chalk.blue.bold(day));
    grouped[day].forEach((activity) => {
      console.log(
        `- ${chalk.cyan(activity.name)} | ${activity.category} | ${currentTrip?.currency} ${activity.cost}`,
      );
    });
    console.log("");
  });
};

/* ─────────────────────────────────────────── */
/* VIEW ACTIVITIES BY CATEGORY */
/* ─────────────────────────────────────────── */

const viewActivitiesByCategory = async (): Promise<void> => {
  if (!currentTrip || currentTrip.activities.length === 0) {
    console.log(chalk.red("No activities available.\n"));
    return;
  }

  const { category } = await inquirer.prompt<{ category: ActivityCategory }>([
    {
      type: "list",
      name: "category",
      message: "Select category:",
      choices: ["food", "transport", "sightseeing", "accommodation"],
    },
  ]);

  const activities = getActivitiesByCategory(currentTrip, category);

  if (activities.length === 0) {
    console.log(chalk.yellow("No activities in this category.\n"));
    return;
  }

  console.log(chalk.blue(`\n${category.toUpperCase()} Activities:\n`));

  activities.forEach((activity) => {
    console.log(
      `- ${activity.name} | ${currentTrip?.currency} ${activity.cost}`,
    );
  });

  console.log("");
};

/* ─────────────────────────────────────────── */
/* VIEW BUDGET */
/* ─────────────────────────────────────────── */

const viewBudget = (): void => {
  if (!currentTrip) {
    console.log(chalk.red("No trip available.\n"));
    return;
  }

  const total = getTotalTripCost(currentTrip);
  const highCost = getHighCostActivities(currentTrip, 100);
  const totalsPerCategory = getTotalsPerCategory(currentTrip);

  console.log(chalk.magenta("\n======= Budget Overview =======\n"));

  console.log(
    chalk.green(`Total Trip Cost: ${currentTrip.currency} ${total}\n`),
  );

  console.log(chalk.red("High Cost Activities (>100):"));
  highCost.forEach((a) =>
    console.log(`- ${a.name} (${currentTrip?.currency} ${a.cost})`),
  );

  console.log("\nCategory Totals:");
  console.log(totalsPerCategory);

  console.log("");
};

/* VIEW DESTINATION INFO (API */
/* ─────────────────────────────────────────── */

const viewDestinationInfo = async (): Promise<void> => {
  if (!currentTrip) {
    console.log(chalk.red("Create a trip first.\n"));
    return;
  }

  const country = currentTrip.destination;

  // Fetch live info from API
  const info: DestinationInfo | null = await getDestinationInfo(country);

  if (!info) {
    console.log(chalk.red("Could not fetch country info.\n"));
    return;
  }

  console.log(chalk.yellow("\nDestination Information:\n"));
  console.log(`Country: ${chalk.green(info.countryName)}`);
  console.log(`Capital: ${info.capital}`);
  console.log(`Currency: ${info.currency}`);
  console.log(`Region: ${info.region}`);
  console.log(`Flag: ${info.flag}\n`);
};

/* ─────────────────────────────────────────── */

mainMenu().catch((error: Error) => {
  console.error(chalk.red(error.message));
});
