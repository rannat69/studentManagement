const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// Create or open the SQLite database
const db = new sqlite3.Database("sql.db");

// API to get all courses
router.get("/", (req, res) => {
	console.log("Received a GET request to /courses");

	db.all("SELECT * FROM course", [], (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(rows);
		}
	});
});

// API to add a course
router.post("/", (req, res) => {
	const { name, description, semester, year, field, keywords, ta_needed } =
		req.body;


	db.run(
		`INSERT INTO course (name, description, semester, year, field, keywords, ta_needed) VALUES (?, ?, ?, ?,?,?,?)`,
		[name, description, semester, year, field, keywords, ta_needed],
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
	const { name, description, semester, year, field, keywords, ta_needed } =
		req.body;
	db.run(
		`UPDATE course SET name = ?, description = ?, semester = ?, year = ?, field = ?, keywords = ?, ta_needed = ?  WHERE id = ?`,
		[name, description, semester, year, field, keywords, ta_needed, id],
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
