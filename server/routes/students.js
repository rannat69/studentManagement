const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// Create or open the SQLite database
const db = new sqlite3.Database("sql.db");

// API to get all students
router.get("/", (req, res) => {
	db.all("SELECT * FROM student", [], (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(rows);
		}
	});
});

// API to get all students with at least 1 TA
router.get("/ta_avail", (req, res) => {
	db.all("SELECT * FROM student where ta_available > 0", [], (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(rows);
		}
	});
});

// API to add a student
router.post("/", (req, res) => {
	const { l_name, f_names, unoff_name, date_joined, expected_grad_year, expected_grad_semester, ta_available } =
		req.body;

	db.run(
		`INSERT INTO student (l_name, f_names, unoff_name, date_joined, expected_grad_year, expected_grad_semester, ta_available) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		[l_name, f_names, unoff_name, date_joined, expected_grad_year, expected_grad_semester, ta_available],
		function (err) {
			if (err) {
				res.status(500).json({ error: err.message });
			} else {
				res.json({ id: this.lastID });
			}
		}
	);
});

// Modify student
router.put("/:id", (req, res) => {
	const { id } = req.params;
	const { l_name, f_names, unoff_name, date_joined, expected_grad_year, expected_grad_semester, ta_available } =
		req.body;
	db.run(
		`UPDATE student SET l_name = ?, f_names = ?, unoff_name = ?, date_joined = ?, expected_grad_year = ?, expected_grad_semester = ?, ta_available = ? WHERE id = ?`,
		[l_name, f_names, unoff_name, date_joined, expected_grad_year, expected_grad_semester, ta_available, id],
		function (err) {
			if (err) {
				res.status(500).json({ error: err.message });

				console.log(err);
			} else {
				res.json({ id });
			}
		}
	);
});

// Delete a student
router.delete("/:id", (req, res) => {
	const { id } = req.params;
	db.run(`DELETE FROM student WHERE id = ?`, [id], function (err) {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json({ id });
		}
	});
});

module.exports = router;
