import sqlite3 from "sqlite3";
import { open } from "sqlite";
import allowedOrigin from "../allowedOrigin";
export default async function handler(req, res) {
  const {
    student_number,
    l_name,
    f_names,
    unoff_name,
    program,
    email,
    date_joined,
    expected_grad_year,
    expected_grad_semester,
    ta_available,
    available,
    manual_match_only,
  } = req.body;

  allowedOrigin(req, res);

  const maxRetries = 5; // Maximum number of retry attempts
  let retryCount = 0;
  let delay = 100; // Initial delay in milliseconds

  async function openDb() {
    return open({
      filename: "src/pages/api/sql.db",
      driver: sqlite3.Database,
    });
  }

  const createStudent = async () => {
    const db = await openDb();

    if (
      (!l_name || l_name.length === 0) &&
      (!f_names || f_names.length === 0)
    ) {
      console.log("No name provided");
      return null;
    }

    function formatYMD(date) {
      if (!date) return "";

      // If it's a string or serial number, parse it into a Date first
      const d = date instanceof Date ? date : new Date(date);

      // Guard against invalid dates
      if (isNaN(d.getTime())) return "";

      // Extract local year, month, and day to avoid UTC timezone shifts
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    // Usage:
    const date_joined_format = formatYMD(date_joined);

    console.log("date joined format", date_joined_format);

    const result = await db.run(
      `INSERT INTO student (student_number, l_name, f_names, unoff_name, program, email, date_joined, expected_grad_year, expected_grad_semester, ta_available, available, manual_match_only) VALUES (?,?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_number,
        l_name,
        f_names,
        unoff_name,
        program,
        email,
        date_joined_format,
        expected_grad_year,
        expected_grad_semester,
        ta_available,
        available,
        manual_match_only,
      ],

      function (err) {
        console.log("function");

        if (err) {
          if (err.code === "SQLITE_BUSY" && retryCount < maxRetries) {
            retryCount++;
            setTimeout(createStudent, delay);
            delay *= 2;
          } else {
            console.error("Error insert:", err);
            res.status(500).json({ error: err.message });
          }
        } else {
          res.json({ id: this.lastID });
          res.status(200).json({ message: "Record created" });
        }
      },
    );

    return result.lastID;
  };

  try {
    const result = await createStudent(); // Wait création
    res.status(200).json({ message: "Record created", id: result });
  } catch (err) {
    console.error("Error insert :", err);
    res.status(500).json({ error: err.message });
  }
}
