import inquirer from "inquirer";
import chalk from "chalk";
import type { Trip, Activity, ActivityCategory } from "./models/index.js";
import {
  addActivity,
  calculateTotalCost,
  removeActivity,
  sortActivitiesByTime,
} from "./services/itienaryservice.js";
import {
  getHighCostActivities,
  getTotalsPerCategory,
} from "./services/budget.js";
import { getAllDestinations } from "./services/destinationservices.js";
import activityData from "./db.json" with { type: "json" };


/* ─────────────────────────────────────────── */
/* Activity Data */
/* ─────────────────────────────────────────── */

type ActivityOption = {
  name: string;
  cost: number;
  // startTime?: "morning" | "afternoon" | "evening";
};

type CountryActivities = {
  food: ActivityOption[];
  transport: ActivityOption[];
  sightseeing: ActivityOption[];
};

const db = activityData

/* ─────────────────────────────────────────── */

let currentTrip: Trip | null = null;

/* ─────────────────────────────────────────── */
/* Main Menu */
/* ─────────────────────────────────────────── */

const mainMenu = async (): Promise<void> => {
  let exit = false;

  while (!exit) {
    console.log(chalk.blue.bold("\n=== Travel Itinerary Manager ==="));

    const { action } = await inquirer.prompt<{ action: string }>([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "Create Trip",
          "Add Activity",
          "Remove Activity",
          "View Activities",
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
      case "View Activities":
        viewActivities();
        break;
      case "Sort Activities by Time":
        sortActivitiesByTime(currentTrip);
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

const createTrip = async (): Promise<void> => {
  const answers = await inquirer.prompt<{
    destination: string;
    startDate: string;
  }>([
    {
      type: "list",
      name: "destination",
      message: "Select destination:",
      choices: ["India", "France", "Sweden", "Germany"],
    },
    {
      type: "input",
      name: "startDate",
      message: "Enter start date (YYYY-MM-DD):",
      validate: (value: string) =>
        /^\d{4}-\d{2}-\d{2}$/.test(value) ||
        "Please enter a valid date (YYYY-MM-DD)",
    },
  ]);

  currentTrip = {
    id: Date.now().toString(),
    destination: answers.destination,
    startDate: new Date(answers.startDate),
    activities: [],
    currency: activityData[answers.destination].currency,
  };

  console.log(chalk.green("Trip created successfully!\n"));
};

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
      choices: ["food", "transport", "sightseeing"],
    },
  ]);

  const options = activityData[currentTrip.destination][category];

  const { selected } = await inquirer.prompt<{ selected: ActivityOption }>([
    {
      type: "list",
      name: "selected",
      message: "Choose activity:",
      choices: options.map((o: any) => ({
        name: `${o.name} (${currentTrip?.currency} ${o.cost})` ,
        value: o,
      })),
    },
  ]);

  const { startTime } = await inquirer.prompt<{ startTime: string }>([
    {
      type: "input",
      name: "startDate",
      message: "Enter activity date (YYYY-MM-DD):",
    },
  ]);

  const sortTripsByDate = (): void => {
    if (!currentTrip) {
      console.log(chalk.red("No trip available.\n"));
      return;
    }
  };

  const activity: Activity = {
    id: Date.now().toString(),
    name: selected.name,
    cost: selected.cost,
    category,
    startTime: new Date(startTime),
  };

  currentTrip = addActivity(currentTrip, activity);

  console.log(chalk.green("Activity added successfully!\n"));
};

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
      choices: currentTrip.activities.map((activity) => ({
        name: `${activity.name} (€${activity.cost})`,
        value: activity.id,
      })),
    },
  ]);

  currentTrip = removeActivity(currentTrip, activityId);

  console.log(chalk.green("Activity removed successfully!\n"));
};

/* ─────────────────────────────────────────── */

const viewActivities = (): void => {
  if (!currentTrip || currentTrip.activities.length === 0) {
    console.log(chalk.red("No activities available.\n"));
    return;
  }

  console.log(chalk.yellow("\nYour Activities:\n"));

  currentTrip.activities.forEach((activity, index) => {
    console.log(
      `${index + 1}. ${chalk.cyan(activity.name)} | ${activity.category} | €${activity.cost}`,
    );
  });

  console.log("");
};

// const sortTripsByDate = (): void => {
//   if (!currentTrip) {
//     console.log(chalk.red("No trip available.\n"));
//     return;
//   }
// };
/* ─────────────────────────────────────────── */

const viewBudget = (): void => {
  if (!currentTrip) {
    console.log(chalk.red("No trip available.\n"));
    return;
  }

  const total = calculateTotalCost(currentTrip);
  const highCost = getHighCostActivities(currentTrip, 50);
  const totalsPerCategory = getTotalsPerCategory(currentTrip);

  console.log(chalk.magenta("\nBudget Overview"));
  console.log(`Total Cost: ${total}`);

  console.log("\nHigh Cost Activities (>50):");
  highCost.forEach((a: Activity) => console.log(a.name));

  console.log("\nTotals Per Category:");
  console.log(totalsPerCategory);
};

/* ─────────────────────────────────────────── */

const viewDestinationInfo = async (): Promise<void> => {
  try {
    const destinations = await getAllDestinations();

    console.log(chalk.blue("\nDestination Information:\n"));
    destinations.forEach((d) => {
      console.log(
        `${chalk.green(d.countryName)} | Capital: ${d.capital} | Currency: ${d.currency} | Region: ${d.region}`,
      );
    });
  } catch {
    console.log(chalk.red("Failed to fetch destination data."));
  }
};

/* ─────────────────────────────────────────── */

mainMenu().catch((error: Error) => {
  console.error(chalk.red(error.message));
});
