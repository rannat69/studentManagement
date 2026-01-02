// pages/api/data.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import allowedOrigin from "../allowedOrigin";

async function openDb() {
  return open({
    filename: "src/pages/api/sql.db",
    driver: sqlite3.Database,
  });
}

export default async function handler(req, res) {
  allowedOrigin(req, res);

  const db = await openDb();

  const data = await db.all("SELECT * FROM student_course"); // Remplacez par votre requête

  res.status(200).json(data);
}
