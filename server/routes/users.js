const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");



// Create or open the SQLite database
const db = new sqlite3.Database("sql.db");

// API to get all user

router.get("/", (req, res) => {
	db.all("SELECT * FROM user", [], (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(rows);
		}
	});
});

router.post("/login", (req, res) => {
	const { login, password } = req.body; // Get the ID and password from the request body

	db.all("SELECT * FROM user WHERE login = ?", [login], (err, rows) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}

		if (rows.length > 0) {
			// Compare the hashed password with the input password
			bcrypt.compare(password, rows[0].password, (err, result) => {
				if (err) throw err;

				if (result) {
					console.log("Password is valid!");
					// Proceed with login
					res.json(rows[0]); // Return user data
				} else {
					console.log("Invalid password.");
					res.json({ error: "Invalid password." });
				}
			});
		} else {
			console.log("User does not exist.");
			res.json({ error: "User does not exist." });
		}
	});
});

// API to add a student
/*router.post("/", (req, res) => {
	const { name, password, type } = req.body;

	db.run(
		`INSERT INTO user (login, password, type) VALUES (?,?, ?)`,
		[name, password, type],
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
router.put("/", (req, res) => {
	const { name, password, type } = req.body;
	db.run(
		`UPDATE user SET name = ?, password = ?, type = ?`,
		[name, password, type],
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
*/
// Delete a user
/*
router.delete("/:name", (req, res) => {
	const { name } = req.params;
	db.run(`DELETE FROM user WHERE name = ?`, [name], function (err) {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json({ name });
		}
	});
});
*/
module.exports = router;
