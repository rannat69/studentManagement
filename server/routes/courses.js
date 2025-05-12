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

	const maxRetries = 5; // Maximum number of retry attempts
	let retryCount = 0;
	let delay = 100; // Initial delay in milliseconds

	const createCourse = () => {
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
					console.log("createcoure errno", err.errno);
					console.log("createcoure code", err.code);

					if (err.code === "SQLITE_BUSY" && retryCount < maxRetries) {
						retryCount++;
						console.log(
							`Database busy, retrying in ${delay}ms... (attempt ${retryCount}/${maxRetries})`
						);
						setTimeout(createCourse, delay);
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
					res.json({ id: this.lastID });
				}
			}
		);
	};

	createCourse(); // Initial call to createCourse
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

	const maxRetries = 20; // Maximum number of retry attempts
	let retryCount = 0;
	let delay = 100; // Initial delay in milliseconds

	const updateCourse = () => {
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
					console.log("updatecourse errno", err.errno);
					console.log("updatecourse code", err.code);

					if (err.code === "SQLITE_BUSY" && retryCount < maxRetries) {
						retryCount++;
						console.log(
							`Database busy, retrying in ${delay}ms... (attempt ${retryCount}/${maxRetries})`
						);
						setTimeout(updateCourse, delay);
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

	updateCourse();
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
