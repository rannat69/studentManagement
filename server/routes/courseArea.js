const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// Create or open the SQLite database
const db = new sqlite3.Database("sql.db");

// API to get all courses and areas
router.get("/", (req, res) => {
	db.all("SELECT * FROM course_area", [], (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(rows);
		}
	});
});

router.get("/:id", (req, res) => {
	const courseId = req.params.id; // Get the ID from the request parameters
	db.all(
		"SELECT * FROM course_area WHERE course_id = ?",
		[courseId],
		(err, row) => {
			if (err) {
				res.status(500).json({ error: err.message });
			} else {
				res.json(row);
			}
		}
	);
});

// API to assign an area to a course
router.post("/", (req, res) => {
	const { area, course_id } = req.body;

	db.run(
		`INSERT INTO course_area
		(area , course_id ) VALUES (?, ?)`,
		[area, course_id],
		function (err) {
			if (err) {
				res.status(500).json({ error: err.message });
			} else {
				res.json({ id: this.lastID });
			}
		}
	);
});

// API to delete all areas of a student
router.delete("/:id", (req, res) => {
	const { id } = req.params;
	db.run(`DELETE FROM course_area WHERE course_id = ?`, [id], function (err) {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json({ id });
		}
	});
});

module.exports = router;
