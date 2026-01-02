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
  const { year, semester } = req.body;

  allowedOrigin(req, res);

  const db = await openDb();

  const deleteAllStudentCourse = async () => {
    if (req.method === "POST") {
      try {
        await db.run(
          `DELETE FROM student_course WHERE year = ? AND semester = ?`,
          year,
          semester
        );
        return "ok";
      } catch (error) {
        console.error("Error delete all :", error);
        throw "error : " + error;
      }
    }
  };

  try {
    await deleteAllStudentCourse(); // Wait création
    res.status(200).json({ message: "Records deleted" });
  } catch (err) {
    console.error("Error delete all :", err);
    res.status(500).json({ error: err.message });
  }
}
