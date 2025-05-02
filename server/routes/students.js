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

router.get("/:id", (req, res) => {
	const studentId = req.params.id; // Get the ID from the request parameters

	db.get("SELECT * FROM student WHERE id = ?", [studentId], (err, row) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(row);
		}
	});
});

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
	const {
		student_number,
		l_name,
		f_names,
		unoff_name,
		program,
		date_joined,
		expected_grad_year,
		expected_grad_semester,
		ta_available,
		available,
	} = req.body;

	db.run(
		`INSERT INTO student (student_number, l_name, f_names, unoff_name, program, date_joined, expected_grad_year, expected_grad_semester, ta_available, available) VALUES (?, ?,?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			student_number,
			l_name,
			f_names,
			unoff_name,
			program,
			date_joined,
			expected_grad_year,
			expected_grad_semester,
			ta_available,
			available,
		],
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
		student_number,
		l_name,
		f_names,
		unoff_name,
		program,
		date_joined,
		expected_grad_year,
		expected_grad_semester,
		ta_available,
		available,
	} = req.body;

	const maxRetries = 20; // Maximum number of retry attempts
	let retryCount = 0;
	let delay = 100; // Initial delay in milliseconds

	const updateStudent = () => {
		console.log("updateStudent called", l_name);

		db.run(
			`UPDATE student SET student_number = ? ,  l_name = ?, f_names = ?, unoff_name = ?, program = ?, date_joined = ?, expected_grad_year = ?, expected_grad_semester = ?, ta_available = ?, available = ? WHERE id = ?`,
			[
				student_number,
				l_name,
				f_names,
				unoff_name,
				program,
				date_joined,
				expected_grad_year,
				expected_grad_semester,
				ta_available,
				available,
				id,
			],
			function (err) {
				if (err) {
					//console.log("err", err);
					console.log("updatestudent errno", err.errno);
					console.log("updatestudent code", err.code);

					if (err.code === "SQLITE_BUSY" && retryCount < maxRetries) {
						retryCount++;
						console.log(
							`Database busy, retrying in ${delay}ms... (attempt ${retryCount}/${maxRetries})`
						);
						setTimeout(updateStudent, delay);
						delay *= 2; // Exponential backoff: double the delay for the next retry
					} else {
						// If max retries exceeded or other error, return a 500 error
						console.error(
							"Failed to update student after multiple retries or due to a non-busy error:",
							err
						); // Log the error
						res.status(500).json({ error: err.message });
					}
				} else {
					res.json({ id });
				}
			}
		);
	};

	updateStudent(); // Initial call to updateStudent
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
