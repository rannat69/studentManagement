const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// Create or open the SQLite database
const db = new sqlite3.Database("sql.db");

// API to get all courses
router.get("/", (req, res) => {
	db.all("SELECT * FROM student_course", [], (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(rows);
		}
	});
});

// API to assign a student to a course
router.post("/", (req, res) => {
	const { student_id, course_id, year, semester } = req.body;

	db.run(
		`INSERT INTO student_course
		(student_id , course_id, year, semester ) VALUES (?, ?,?,?)`,
		[student_id, course_id, year, semester],
		function (err) {
			if (err) {
				res.status(500).json({ error: err.message });
			} else {
				res.json({ id: this.lastID });
			}
		}
	);
});

// API to delete a student from a course
router.post("/delete", (req, res) => {
	const { student_id, course_id } = req.body;

	db.run(
		`DELETE FROM student_course WHERE student_id = ? and course_id = ? `,

		[student_id, course_id],
		function (err) {
			if (err) {
				res.status(500).json({ error: err.message });
			} else {
				res.json({ id: this.lastID });
			}
		}
	);
});

module.exports = router;
