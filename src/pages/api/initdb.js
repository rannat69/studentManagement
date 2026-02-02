import sqlite3 from "sqlite3";

import { createTables } from "./createTables";
import { createTriggers } from "./createTriggers";
import { createSchedTasks } from "./createSchedTasks";
import bcrypt from "bcrypt";
export function initdb() {
  console.log("initDB");

  const db = new sqlite3.Database("src/pages/api/sql.db"); // Use a file instead for persistent storage

  createTables(db, bcrypt);
  createTriggers(db, bcrypt);
  createSchedTasks(db, bcrypt);
}
