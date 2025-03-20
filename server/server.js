const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const studentRoutes = require("./routes/students"); // Adjust the path as necessary
const coursesRoutes = require("./routes/courses");
const teachersRoutes = require("./routes/teachers");
const studentCourseRoutes = require("./routes/studentCourse");
const requestsRoutes = require("./routes/requests");
const courseAreaRoutes = require("./routes/courseArea");
const studentAreaRoutes = require("./routes/studentArea");
const userRoutes = require("./routes/users");
const studentQualificationRoutes = require("./routes/studentQualification");
const courseQualificationRoutes = require("./routes/courseQualification");

const { createTables } = require("./createTables");

const app = express();
const db = new sqlite3.Database("sql.db"); // Use a file instead for persistent storage

const cron = require("node-cron");

const fs = require("fs");

const path = require("path");

const { exec } = require("child_process");
const bcrypt = require("bcrypt");

app.use(cors());
app.use(express.json());

createTables(db, bcrypt);

// Use the student routes
app.use("/students", studentRoutes);
app.use("/courses", coursesRoutes);
app.use("/studentcourse", studentCourseRoutes);
app.use("/teachers", teachersRoutes);
app.use("/requests", requestsRoutes);
app.use("/course_areas", courseAreaRoutes);
app.use("/student_areas", studentAreaRoutes);
app.use("/student_qualifications", studentQualificationRoutes);
app.use("/course_qualifications", courseQualificationRoutes);
app.use("/user", userRoutes);

// cronjob that copies and renames sql.db every day at 23:50

cron.schedule("50 23 * * *", () => {
	const currentDate = new Date().toISOString().slice(0, 10);

	const newFileName = `sql_${currentDate}.db`;

	const newFilePath = path.join(__dirname, newFileName);

	const oldFilePath = path.join(__dirname, "sql.db");

	fs.copyFileSync(oldFilePath, newFilePath);

	console.log(`Database copied to ${newFilePath}`);
});

// cronjob that sends a console log every minute
/*cron.schedule("* * * * *", () => {
	console.log("This message is logged every minute");

	const currentDate = new Date().toISOString().slice(0, 10);

	const newFileName = `sql_${currentDate}.db`;

	const newFilePath = path.join(__dirname, newFileName);

	const oldFilePath = path.join(__dirname, "sql.db");

	fs.copyFileSync(oldFilePath, newFilePath);

	console.log(`Database copied to ${newFilePath}`);


});*/

// Start the server
app.listen(5000, () => {
	console.log("Server is running on http://localhost:5000");
});
