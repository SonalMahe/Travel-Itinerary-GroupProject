import inquirer from "inquirer";
import chalk from "chalk";
import type {
  Trip,
  Activity,
  ActivityCategory,
} from "./models/index.js";

import {
  addActivity,
  removeActivity,
  getActivitiesByCategory,
  getActivitiesForDay,
  sortActivitiesChronologically,
  groupActivitiesByDay,
} from "./services/itienaryservice.js";

import {
  getTotalTripCost,
  getHighCostActivities,
  getTotalsPerCategory,
} from "./services/budget.js";

import { getDestinationInfo } from "./services/destinationservices.js";

import {
  getAllTrips,
  saveTrip,
} from "./services/dbService.js";

/* ─────────────────────────────────────────── */
/*  STATE                                      */
/* ─────────────────────────────────────────── */

let currentTrip: Trip | null = null;

/* ─────────────────────────────────────────── */
/*  HELPERS                                    */
/* ─────────────────────────────────────────── */

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const today = (): string => new Date().toISOString().slice(0, 10);

const requireTrip = async (): Promise<Trip | null> => {
  if (currentTrip) return currentTrip;

  const trips = getAllTrips();

  if (trips.length === 0) {
    console.log(chalk.red("\n⚠  No trips found. Create one first.\n"));
    return null;
  }

  if (trips.length === 1) {
    currentTrip = trips[0];
    console.log(
      chalk.gray(`  Auto-selected trip: ${currentTrip.flag} ${currentTrip.destination}`)
    );
    return currentTrip;
  }

  const { tripId } = await inquirer.prompt([
    {
      type: "list",
      name: "tripId",
      message: "Which trip?",
      choices: trips.map((t) => ({
        name: `${t.flag} ${t.destination} (${t.startDate} → ${t.endDate}) — ${t.activities.length} activities`,
        value: t.id,
      })),
    },
  ]);

  currentTrip = trips.find((t) => t.id === tripId) ?? null;
  return currentTrip;
};

/* ─────────────────────────────────────────── */
/*  MAIN MENU                                  */
/* ─────────────────────────────────────────── */

const mainMenu = async (): Promise<void> => {
  let exit = false;

  while (!exit) {
    console.log(chalk.blue.bold("\n======= Travel Itinerary Manager ======="));
    if (currentTrip) {
      console.log(
        chalk.gray(
          `  Current trip: ${currentTrip.flag} ${currentTrip.destination} (${currentTrip.startDate} → ${currentTrip.endDate})`
        )
      );
    }

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "1. Create a new trip",
          "2. View an existing trip",
          "3. Add activity",
          "4. Remove activity",
          "5. View activities for a specific day",
          "6. View all activities (sorted chronologically)",
          "7. Filter activities by category",
          "8. View budget (total + per category)",
          "9. Identify high-cost activities",
          "10. Fetch destination info",
          "11. Exit",
        ],
      },
    ]);

    switch (action) {
      case "1. Create a new trip":
        await createTrip();
        break;
      case "2. View an existing trip":
        await loadTrip();
        break;
      case "3. Add activity":
        await handleAddActivity();
        break;
      case "4. Remove activity":
        await handleRemoveActivity();
        break;
      case "5. View activities for a specific day":
        await viewActivitiesForDay();
        break;
      case "6. View all activities (sorted chronologically)":
        await viewActivitiesSorted();
        break;
      case "7. Filter activities by category":
        await viewActivitiesByCategory();
        break;
      case "8. View budget (total + per category)":
        await viewBudget();
        break;
      case "9. Identify high-cost activities":
        await viewHighCostActivities();
        break;
      case "10. Fetch destination info":
        await viewDestinationInfo();
        break;
      case "11. Exit":
        exit = true;
        console.log(chalk.green("\nGoodbye 👋\n"));
        break;
    }
  }
};

/* ─────────────────────────────────────────── */
/*  1. CREATE TRIP                             */
/* ─────────────────────────────────────────── */

const createTrip = async (): Promise<void> => {
  const { destination } = await inquirer.prompt([
    {
      type: "input",
      name: "destination",
      message: "Enter country name:",
      validate: (v: string) =>
        v.trim().length > 0 || "Country name cannot be empty",
    },
  ]);

  // Fetch destination info from API to validate country & get currency
  console.log(chalk.gray(`\n  Looking up "${destination}"...`));
  const info = await getDestinationInfo(destination.trim());

  if (!info) {
    console.log(
      chalk.red(
        `\n⚠  Could not find country "${destination}". Check spelling and try again.\n`
      )
    );
    return;
  }

  console.log(
    chalk.green(
      `  ✓ Found: ${info.countryName} ${info.flag} — Currency: ${info.currencyName} (${info.currencySymbol})`
    )
  );

  const { startDate, endDate } = await inquirer.prompt([
    {
      type: "input",
      name: "startDate",
      message: "Start date (YYYY-MM-DD):",
      default: today(),
      validate: (v: string) =>
        dateRegex.test(v) || "Format must be YYYY-MM-DD",
    },
    {
      type: "input",
      name: "endDate",
      message: "End date (YYYY-MM-DD):",
      default: today(),
      validate: (v: string, ans: Record<string, string>) => {
        if (!dateRegex.test(v)) return "Format must be YYYY-MM-DD";
        if (new Date(v) < new Date(ans.startDate))
          return "End date must be on or after start date";
        return true;
      },
    },
  ]);

  currentTrip = {
    id: Date.now().toString(),
    name: `${info.countryName} Trip`,
    destination: info.countryName,
    startDate,
    endDate,
    currency: info.currencySymbol,
    flag: info.flag,
    activities: [],
  };

  saveTrip(currentTrip);

  console.log(
    chalk.green(
      `\n✅ Trip to ${info.countryName} ${info.flag} created & saved! (${startDate} → ${endDate})\n`
    )
  );

  // Ask if user wants to add activities now
  const { addNow } = await inquirer.prompt([
    {
      type: "confirm",
      name: "addNow",
      message: "Add activities now?",
      default: true,
    },
  ]);

  if (addNow) {
    let addMore = true;
    while (addMore) {
      await promptAndAddActivity(currentTrip);
      // Refresh from state (addActivity returns a new trip)
      const { again } = await inquirer.prompt([
        {
          type: "confirm",
          name: "again",
          message: "Add another activity?",
          default: true,
        },
      ]);
      addMore = again;
    }
  }
};

/* ─────────────────────────────────────────── */
/*  2. LOAD EXISTING TRIP                      */
/* ─────────────────────────────────────────── */

const loadTrip = async (): Promise<void> => {
  const trips = getAllTrips();

  if (trips.length === 0) {
    console.log(chalk.yellow("\nNo saved trips found. Create one first.\n"));
    return;
  }

  const { tripId } = await inquirer.prompt([
    {
      type: "list",
      name: "tripId",
      message: "Select a trip to load:",
      choices: trips.map((t) => ({
        name: `${t.flag} ${t.destination} (${t.startDate} → ${t.endDate}) — ${t.activities.length} activities`,
        value: t.id,
      })),
    },
  ]);

  currentTrip = trips.find((t) => t.id === tripId) ?? null;

  if (currentTrip) {
    console.log(
      chalk.green(`\n✅ Loaded trip to ${currentTrip.flag} ${currentTrip.destination}\n`)
    );

    if (currentTrip.activities.length === 0) {
      console.log(chalk.yellow("  No activities yet.\n"));
    } else {
      const grouped = groupActivitiesByDay(currentTrip);
      console.log(
        chalk.blue.bold(
          `  📋 ${currentTrip.activities.length} activities:\n`
        )
      );
      for (const [day, acts] of Object.entries(grouped)) {
        const dayName = new Date(day).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        console.log(chalk.blue(`  ${dayName}`));
        for (const a of acts) {
          console.log(
            `    • ${chalk.cyan(a.name)} | ${a.category} | ${currentTrip.currency}${a.cost}`
          );
        }
      }
      console.log("");
    }
  }
};

/* ─────────────────────────────────────────── */
/*  SHARED: PROMPT AND ADD A SINGLE ACTIVITY   */
/* ─────────────────────────────────────────── */

const promptAndAddActivity = async (trip: Trip): Promise<void> => {
  const { category, name, cost, dateInput } = await inquirer.prompt([
    {
      type: "list",
      name: "category",
      message: "Select category:",
      choices: ["food", "transport", "sightseeing", "accommodation"],
    },
    {
      type: "input",
      name: "name",
      message: "Activity name:",
      validate: (v: string) =>
        v.trim().length > 0 || "Name cannot be empty",
    },
    {
      type: "input",
      name: "cost",
      message: `Cost (${trip.currency}):`,
      validate: (v: string) =>
        !isNaN(Number(v)) && Number(v) >= 0
          ? true
          : "Enter a valid positive number",
    },
    {
      type: "input",
      name: "dateInput",
      message: "Activity date (YYYY-MM-DD):",
      default: trip.startDate,
      validate: (v: string) => {
        if (!dateRegex.test(v)) return "Format must be YYYY-MM-DD";
        if (v < trip.startDate || v > trip.endDate)
          return `Date must be between ${trip.startDate} and ${trip.endDate}`;
        return true;
      },
    },
  ]);

  const activity: Activity = {
    id: Date.now().toString(),
    name: name.trim(),
    cost: Number(cost),
    category: category as ActivityCategory,
    date: dateInput,
  };

  currentTrip = addActivity(trip, activity);
  saveTrip(currentTrip);

  console.log(
    chalk.green(
      `  ✅ Added "${activity.name}" (${trip.currency}${activity.cost}) on ${dateInput}`
    )
  );
};

/* ─────────────────────────────────────────── */
/*  3. ADD ACTIVITY                            */
/* ─────────────────────────────────────────── */

const handleAddActivity = async (): Promise<void> => {
  const trip = await requireTrip();
  if (!trip) return;

  let addMore = true;
  while (addMore) {
    await promptAndAddActivity(trip);
    const { again } = await inquirer.prompt([
      {
        type: "confirm",
        name: "again",
        message: "Add another activity?",
        default: true,
      },
    ]);
    addMore = again;
  }
};

/* ─────────────────────────────────────────── */
/*  4. REMOVE ACTIVITY                         */
/* ─────────────────────────────────────────── */

const handleRemoveActivity = async (): Promise<void> => {
  const trip = await requireTrip();
  if (!trip || trip.activities.length === 0) {
    console.log(chalk.red("No activities to remove.\n"));
    return;
  }

  const { activityId } = await inquirer.prompt([
    {
      type: "list",
      name: "activityId",
      message: "Select activity to remove:",
      choices: trip.activities.map((a) => ({
        name: `${a.name} | ${a.category} | ${trip.currency}${a.cost} | ${a.date}`,
        value: a.id,
      })),
    },
  ]);

  currentTrip = removeActivity(trip, activityId);
  saveTrip(currentTrip);

  console.log(chalk.green("\n✅ Activity removed & saved!\n"));
};

/* ─────────────────────────────────────────── */
/*  5. VIEW ACTIVITIES FOR A SPECIFIC DAY      */
/* ─────────────────────────────────────────── */

const viewActivitiesForDay = async (): Promise<void> => {
  const trip = await requireTrip();
  if (!trip) return;

  const { dateInput } = await inquirer.prompt([
    {
      type: "input",
      name: "dateInput",
      message: "Enter date to view (YYYY-MM-DD):",
      default: trip.startDate,
      validate: (v: string) =>
        dateRegex.test(v) || "Format must be YYYY-MM-DD",
    },
  ]);

  const activities = getActivitiesForDay(trip, dateInput);

  if (activities.length === 0) {
    console.log(chalk.yellow(`\nNo activities on ${dateInput}.\n`));
    return;
  }

  console.log(chalk.blue.bold(`\n📅 Activities on ${dateInput}:\n`));
  activities.forEach((a) => {
    console.log(
      `  • ${chalk.cyan(a.name)} | ${a.category} | ${trip.currency}${a.cost}`
    );
  });
  console.log("");
};

/* ─────────────────────────────────────────── */
/*  6. VIEW ALL ACTIVITIES SORTED              */
/* ─────────────────────────────────────────── */

const viewActivitiesSorted = async (): Promise<void> => {
  const trip = await requireTrip();
  if (!trip || trip.activities.length === 0) {
    console.log(chalk.yellow("\nNo activities yet.\n"));
    return;
  }

  const grouped = groupActivitiesByDay(trip);

  console.log(chalk.yellow.bold("\n📋 All Activities (sorted by date):\n"));

  for (const [day, acts] of Object.entries(grouped)) {
    const dayName = new Date(day).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    console.log(chalk.blue.bold(`  ${dayName}`));
    for (const a of acts) {
      console.log(
        `    • ${chalk.cyan(a.name)} | ${a.category} | ${trip.currency}${a.cost}`
      );
    }
  }
  console.log("");
};

/* ─────────────────────────────────────────── */
/*  7. FILTER ACTIVITIES BY CATEGORY           */
/* ─────────────────────────────────────────── */

const viewActivitiesByCategory = async (): Promise<void> => {
  const trip = await requireTrip();
  if (!trip || trip.activities.length === 0) {
    console.log(chalk.yellow("\nNo activities yet.\n"));
    return;
  }

  const { category } = await inquirer.prompt([
    {
      type: "list",
      name: "category",
      message: "Select category:",
      choices: ["food", "transport", "sightseeing", "accommodation"],
    },
  ]);

  const activities = getActivitiesByCategory(
    trip,
    category as ActivityCategory
  );

  if (activities.length === 0) {
    console.log(chalk.yellow(`\nNo ${category} activities found.\n`));
    return;
  }

  console.log(
    chalk.blue.bold(`\n🏷  ${category.toUpperCase()} Activities:\n`)
  );
  activities.forEach((a) => {
    console.log(`  • ${a.name} | ${trip.currency}${a.cost} | ${a.date}`);
  });
  console.log("");
};

/* ─────────────────────────────────────────── */
/*  8. VIEW BUDGET                             */
/* ─────────────────────────────────────────── */

const viewBudget = async (): Promise<void> => {
  const trip = await requireTrip();
  if (!trip) return;

  const total = getTotalTripCost(trip);
  const perCategory = getTotalsPerCategory(trip);

  console.log(chalk.magenta.bold("\n======= 💰 Budget Overview =======\n"));

  console.log(
    chalk.green.bold(`  Total Trip Cost: ${trip.currency}${total}\n`)
  );

  console.log(chalk.blue("  Per Category:"));
  for (const [cat, amount] of Object.entries(perCategory)) {
    const bar = "█".repeat(Math.min(Math.round(amount / 10), 30));
    console.log(
      `    ${cat.padEnd(15)} ${trip.currency}${String(amount).padEnd(8)} ${chalk.cyan(bar)}`
    );
  }
  console.log("");
};

/* ─────────────────────────────────────────── */
/*  9. IDENTIFY HIGH-COST ACTIVITIES           */
/* ─────────────────────────────────────────── */

const viewHighCostActivities = async (): Promise<void> => {
  const trip = await requireTrip();
  if (!trip) return;

  const { threshold } = await inquirer.prompt([
    {
      type: "input",
      name: "threshold",
      message: `Enter cost threshold (${trip.currency}):`,
      default: "100",
      validate: (v: string) =>
        !isNaN(Number(v)) && Number(v) >= 0 ? true : "Enter a valid number",
    },
  ]);

  const expensive = getHighCostActivities(trip, Number(threshold));

  if (expensive.length === 0) {
    console.log(
      chalk.green(
        `\nNo activities exceed ${trip.currency}${threshold}. Budget looking good! 🎉\n`
      )
    );
    return;
  }

  console.log(
    chalk.red.bold(
      `\n⚠  ${expensive.length} activities above ${trip.currency}${threshold}:\n`
    )
  );
  expensive.forEach((a) => {
    console.log(
      `  • ${chalk.red(a.name)} | ${a.category} | ${trip.currency}${a.cost} | ${a.date}`
    );
  });
  console.log("");
};

/* ─────────────────────────────────────────── */
/*  10. FETCH DESTINATION INFO                 */
/* ─────────────────────────────────────────── */

const viewDestinationInfo = async (): Promise<void> => {
  const { country } = await inquirer.prompt([
    {
      type: "input",
      name: "country",
      message: "Enter country name:",
      default: currentTrip?.destination,
      validate: (v: string) =>
        v.trim().length > 0 || "Country name cannot be empty",
    },
  ]);

  console.log(chalk.gray(`\nFetching info for "${country}"...\n`));

  const info = await getDestinationInfo(country.trim());

  if (!info) {
    console.log(chalk.red("Could not find that country. Check spelling.\n"));
    return;
  }

  console.log(chalk.yellow.bold("  🌍 Destination Information:\n"));
  console.log(`    Country : ${chalk.green(info.countryName)} ${info.flag}`);
  console.log(`    Capital : ${info.capital}`);
  console.log(`    Currency: ${info.currencyName} (${info.currencySymbol})`);
  console.log(`    Region  : ${info.region}`);
  console.log("");
};

/* ─────────────────────────────────────────── */
/*  START                                      */
/* ─────────────────────────────────────────── */

mainMenu().catch((err: Error) => {
  console.error(chalk.red("Fatal error:"), err.message);
  process.exit(1);
});
