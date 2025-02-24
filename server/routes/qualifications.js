const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// Create or open the SQLite database
const db = new sqlite3.Database("sql.db");

// API to get all qualification
router.get("/", (req, res) => {
	db.all("SELECT * FROM qualification", [], (err, rows) => {
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
		"SELECT * FROM qualification WHERE student_id = ?",
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

// API to assign a qualification to a student
router.post("/", (req, res) => {
	const { studentId, qualification } = req.body;

	db.run(
		`INSERT INTO qualification
		(student_id , qualification ) VALUES (?, ?)`,
		[studentId, qualification],
		function (err) {
			if (err) {
				res.status(500).json({ error: err.message });
			} else {
				res.json({ id: this.lastID });
			}
		}
	);
});

// API to delete all qualifications of a student
router.delete("/:id", (req, res) => {
	const { id } = req.params;
	db.run(
		`DELETE FROM qualification WHERE student_id = ?`,
		[id],
		function (err) {
			if (err) {
				res.status(500).json({ error: err.message });
			} else {
				res.json({ id });
			}
		}
	);
});

module.exports = router;
