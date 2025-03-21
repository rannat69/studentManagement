const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// Create or open the SQLite database
const db = new sqlite3.Database("sql.db");

// API to get all courses
router.get("/", (req, res) => {
	db.all("SELECT * FROM course", [], (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(rows);
		}
	});
});

// API to get a specific course by ID
router.get("/:id", (req, res) => {
	const { id } = req.params;
	db.get("SELECT * FROM course WHERE id = ?", [id], (err, row) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(row);
		}
	});
});

// API to add a course
router.post("/", (req, res) => {
	const {
		hkust_identifier,
		name,
		description,
		semester,
		year,
		field,
		keywords,
		ta_needed,
		ta_assigned,
	} = req.body;

	db.run(
		`INSERT INTO course (hkust_identifier, name, description, semester, year, field, keywords, ta_needed, ta_assigned) VALUES (?, ?, ?,?, ?,?,?,?,?)`,
		[
			hkust_identifier,
			name,
			description,
			semester,
			year,
			field,
			keywords,
			ta_needed,
			ta_assigned,
		],
		function (err) {
			if (err) {
				console.log(err);

				res.status(500).json({ error: err.message });
			} else {
				res.json({ id: this.lastID });
			}
		}
	);
});

// Modify course
router.put("/:id", (req, res) => {
	const { id } = req.params;
	const {
		hkust_identifier,
		name,
		description,
		semester,
		year,
		field,
		keywords,
		ta_needed,
		ta_assigned,
	} = req.body;
	db.run(
		`UPDATE course SET hkust_identifier = ?,  name = ?, description = ?, semester = ?, year = ?, field = ?, keywords = ?, ta_needed = ?, ta_assigned = ? WHERE id = ?`,
		[
			hkust_identifier,
			name,
			description,
			semester,
			year,
			field,
			keywords,
			ta_needed,
			ta_assigned,
			id,
		],
		function (err) {
			if (err) {
				res.status(500).json({ error: err.message });
			} else {
				res.json({ id });
			}
		}
	);
});

// Delete a course
router.delete("/:id", (req, res) => {
	const { id } = req.params;
	db.run(`DELETE FROM course WHERE id = ?`, [id], function (err) {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json({ id });
		}
	});
});

module.exports = router;
