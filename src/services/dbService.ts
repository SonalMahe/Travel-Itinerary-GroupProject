// src/services/dbService.ts
// Handles reading and writing to db.json for persistent storage

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Database, Trip } from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, "..", "db.json");

// Read the entire database
export const readDb = (): Database => {
  const raw = readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as Database;
};

// Write the entire database
const writeDb = (db: Database): void => {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
};

// Get all saved trips
export const getAllTrips = (): Trip[] => {
  const db = readDb();
  return db.trips;
};

// Get a single trip by ID
export const getTripById = (id: string): Trip | undefined => {
  const db = readDb();
  return db.trips.find((t) => t.id === id);
};

// Save a new trip (or update existing)
export const saveTrip = (trip: Trip): void => {
  const db = readDb();
  const index = db.trips.findIndex((t) => t.id === trip.id);
  if (index >= 0) {
    db.trips[index] = trip;
  } else {
    db.trips.push(trip);
  }
  writeDb(db);
};

// Delete a trip by ID
export const deleteTrip = (id: string): void => {
  const db = readDb();
  db.trips = db.trips.filter((t) => t.id !== id);
  writeDb(db);
};
