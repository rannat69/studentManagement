const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();



// Create or open the SQLite database
const db = new sqlite3.Database("sql.db");

// API to get all students and areas
router.get("/", (req, res) => {
	db.all("SELECT * FROM student_area", [], (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(rows);
		}
	});
});

router.get("/:id", (req, res) => {
	const studentId = req.params.id; // Get the ID from the request parameters
	db.all(
		"SELECT * FROM student_area WHERE student_id = ?",
		[studentId],
		(err, row) => {
			if (err) {
				res.status(500).json({ error: err.message });
			} else {
				res.json(row);
			}
		}
	);
});

// API to assign an area to a student
router.post("/", (req, res) => {
	const { area, studentId } = req.body;

	db.run(
		`INSERT INTO student_area
		(area , student_id ) VALUES (?, ?)`,
		[area, studentId],
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
	db.run(`DELETE FROM student_area WHERE student_id = ?`, [id], function (err) {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json({ id });
		}
	});
});

module.exports = router;
