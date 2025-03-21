const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// Create or open the SQLite database
const db = new sqlite3.Database("sql.db");

// API to get all requests
router.get("/", (req, res) => {
	db.all("SELECT * FROM request", [], (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(rows);
		}
	});
});

// Get specific requests according to parameters
router.get("/:requestFrom/:want/:studentId/:courseId", (req, res) => {
	const { requestFrom, want, studentId, courseId } = req.params;
	db.get(
		"SELECT * FROM request WHERE want = ? AND request_from = ? AND student_id = ? AND course_id = ?",
		[want, requestFrom, studentId, courseId],
		(err, rows) => {
			if (err) {
				res.status(500).json({ error: err.message });
			} else {
				res.json(rows);
			}
		}
	);
});
// API to add a student
router.post("/", (req, res) => {
	const {
		student_id,
		teacher_id,
		course_id,
		message,
		status,
		request_from,
		want,
	} = req.body;

	db.run(
		`INSERT INTO request (student_id, teacher_id, course_id,message,status, request_from ,want) VALUES (?,?, ?,?,?,?,?)`,
		[student_id, teacher_id, course_id, message, status, request_from, want],
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
	const {
		student_id,
		teacher_id,
		course_id,
		message,
		status,
		request_from,
		want,
	} = req.body;
	db.run(
		`UPDATE request SET student_id = ?, teacher_id = ?, course_id = ?,message = ?,status = ?, request_from = ?,want = ? WHERE id = ?`,
		[
			student_id,
			teacher_id,
			course_id,
			message,
			status,
			request_from,
			want,
			id,
		],
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
	db.run(`DELETE FROM request WHERE id = ?`, [id], function (err) {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json({ id });
		}
	});
});

module.exports = router;
