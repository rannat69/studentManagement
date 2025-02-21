const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// Create or open the SQLite database
const db = new sqlite3.Database("sql.db");

// API to get all teacher
router.get("/", (req, res) => {
	db.all("SELECT * FROM teacher", [], (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(rows);
		}
	});
});


router.get("/:id", (req, res) => {
	const teacherId = req.params.id; // Get the ID from the request parameters
	db.all("SELECT * FROM teacher WHERE id = ?", [teacherId], (err, row) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(row);
		}
	});
});

// API to add a student
router.post("/", (req, res) => {
	const { l_name, f_names, unoff_name, field } = req.body;

	db.run(
		`INSERT INTO teacher (l_name, f_names, unoff_name,field) VALUES (?,?, ?,?)`,
		[l_name, f_names, unoff_name, field],
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
	const { l_name, f_names, unoff_name, field } = req.body;
	db.run(
		`UPDATE teacher SET l_name = ?, f_names = ?, unoff_name = ?,  field = ? WHERE id = ?`,
		[l_name, f_names, unoff_name, field, id],
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
	db.run(`DELETE FROM teacher WHERE id = ?`, [id], function (err) {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json({ id });
		}
	});
});

module.exports = router;
