import sqlite3 from "sqlite3";
import { open } from "sqlite";
import allowedOrigin from "../allowedOrigin";

export default async function handler(req, res) {
  const { course_id, teacher_id } = req.body;

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

  const createStudentTeacher = async () => {
    const db = await openDb();

    const result = await db.run(
      `INSERT INTO course_teacher
		(course_id , teacher_id ) VALUES (?, ?)`,
      [course_id, teacher_id],

      function (err) {
        console.log("function");

        if (err) {
          if (err.code === "SQLITE_BUSY" && retryCount < maxRetries) {
            retryCount++;
            setTimeout(createStudentQualif, delay);
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
    const result = await createStudentTeacher(); // Wait création
    res.status(200).json({ message: "Record created", id: result });
  } catch (err) {
    console.error("Error insert :", err);
    res.status(500).json({ error: err.message });
  }
}
