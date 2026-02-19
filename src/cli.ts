import inquirer from "inquirer";
import chalk from "chalk";

import { getAllDestinations } from "./services/destinationservices.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import type { DestinationInfo } from "./services/destinationservices";
import {
  getIndiaInfo,
  getFranceInfo,
  getSwedenInfo,
  getGermanyInfo,
} from "./services/destinationservices";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prompt = inquirer.createPromptModule();

//types:
type UserPreferences = {
  favouriteCountry: string;
  currency: string;
  startDate: Date;
};

type Database = {
  userPreferences: UserPreferences;
};

//DB file path
const DB_PATH = path.join(__dirname, "..", "db.json");

// ─── Load Preferences ─────────────────────────────────────────────────────────

const loadPreferences = (): UserPreferences => {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      const db: Database = JSON.parse(raw);
      return db.userPreferences;
    }
  } catch (error) {
    console.log("Could not load preferences, using defaults.");
  }

  // Default preferences if db.json doesn't exist yet
  return {
    favouriteCountry: "None",
    currency: "None",
    startDate: new Date("2024-12-12"),
  };
};

// ─── Save Preferences ─────────────────────────────────────────────────────────

const savePreferences = (prefs: UserPreferences): void => {
  const db: Database = { userPreferences: prefs };
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  console.log("\n✅ Preferences saved!\n");
};

// ─── Display Country Info ─────────────────────────────────────────────────────

const displayCountry = (info: DestinationInfo): void => {
  console.log("\n─────────────────────────────────");
  console.log(`${info.flag}  ${info.countryName}`);
  console.log(`  Capital  : ${info.capital}`);
  console.log(`  Currency : ${info.currency}`);
  console.log(`  Region   : ${info.region}`);
  console.log("─────────────────────────────────\n");
};

// ─── Country Menu ─────────────────────────────────────────────────────────────

const countryMenu = async (): Promise<void> => {
  const { country } = await prompt([
    {
      type: "rawlist",
      name: "country",
      message: "Which country do you want to see?",
      choices: ["India", "France", "Sweden", "Germany", "Back"],
    },
  ]);

  if (country === "Back") return;

  console.log("\nFetching data...");

  if (country === "All Countries") {
    const all = await getAllDestinations();
    all.forEach(displayCountry);
    return;
  }

  const fetchers: Record<string, () => Promise<DestinationInfo>> = {
    India: getIndiaInfo,
    France: getFranceInfo,
    Sweden: getSwedenInfo,
    Germany: getGermanyInfo,
  };

  const info = await fetchers[country]();
  displayCountry(info);
};

// ─── Preferences Menu ─────────────────────────────────────────────────────────

const preferencesMenu = async (): Promise<void> => {
  const current = loadPreferences();

  console.log("\n── Current Preferences ──────────");
  console.log(`  Favourite Country : ${current.favouriteCountry}`);
  console.log(`  Currency          : ${current.currency}`);
  console.log(`  Last Visited      : ${current.startDate}`);
  console.log("─────────────────────────────────\n");

  const { action } = await prompt([
    {
      type: "rawlist",
      name: "action",
      message: "What do you want to do?",
      choices: ["Update Preferences", "Back"],
    },
  ]);

  if (action === "Back") return;

  const answers = await prompt([
    {
      type: "rawlist",
      name: "favouriteCountry",
      message: "Pick your favourite country:",
      choices: ["India", "France", "Sweden", "Germany"],
      default: current.favouriteCountry,
    },
    // {
    //   type: "rawlist",
    //   name: "currency",
    //   message: "Pick your preferred currency:",
    //   choices: ["INR", "EUR", "SEK"],
    //   default: current.currency,
    // },
    {
      type: "rawlist",
      name: "startDate",
      message: "Which country did you last visit?",
      choices: ["India", "France", "Sweden", "Germany", "None"],
      default: current.startDate,
    },
  ]);

  savePreferences(answers);
};

// ─── Main Menu ────────────────────────────────────────────────────────────────

const mainMenu = async (): Promise<void> => {
  console.log("\n🌍 Welcome to the Travel Itinerary Manager\n");

  let running = true;

  while (running) {
    const { action } = await prompt([
      {
        type: "rawlist",
        name: "action",
        message: "What would you like to do?",
        choices: ["View Country Info", "My Preferences", "Exit"],
      },
    ]);

    if (action === "View Country Info") {
      await countryMenu();
    } else if (action === "My Preferences") {
      await preferencesMenu();
    } else {
      console.log("\n👋 Goodbye!\n");
      running = false;
    }
  }
};

// ─── Start ────────────────────────────────────────────────────────────────────

mainMenu().catch((error: Error) => {
  console.error(chalk.red("Something went wrong:", error.message));
});
