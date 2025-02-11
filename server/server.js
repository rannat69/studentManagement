const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const studentRoutes = require("./routes/students"); // Adjust the path as necessary
const coursesRoutes = require("./routes/courses");

const app = express();
const db = new sqlite3.Database("sql.db"); // Use a file instead for persistent storage

app.use(cors());
app.use(express.json());

// Create the student table
db.serialize(() => {
	db.run(`CREATE TABLE IF NOT EXISTS student (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        expected_grad_date DATE,
        ta_available INTEGER
    )`);

	// course
	db.run(`CREATE TABLE IF NOT EXISTS course (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            semester INTEGER, 
            year INTEGER,

            ta_needed INTEGER,
            ta_assigned INTEGER,
            field TEXT,
            keywords TEXT
                    )`);
});

// Use the student routes
app.use("/students", studentRoutes);
app.use("/courses", coursesRoutes);

// Start the server
app.listen(5000, () => {
	console.log("Server is running on http://localhost:5000");
});
