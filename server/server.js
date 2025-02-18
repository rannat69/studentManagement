const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const studentRoutes = require("./routes/students"); // Adjust the path as necessary
const coursesRoutes = require("./routes/courses");
const teachersRoutes = require("./routes/teachers");
const studentCourseRoutes = require("./routes/studentCourse");
const requestsRoutes = require("./routes/requests");

const app = express();
const db = new sqlite3.Database("sql.db"); // Use a file instead for persistent storage

const cron = require("node-cron");

const fs = require("fs");

const path = require("path");

const { exec } = require("child_process");

app.use(cors());
app.use(express.json());

db.serialize(() => {
	db.run(`DROP TABLE student`);
	//db.run(`DROP TABLE course`);
	//db.run(`DROP TABLE student_course`);

	db.run(`DELETE FROM student_course`);
    db.run(`DELETE FROM request`);
});

// Create the student table
db.serialize(() => {
	db.run(`CREATE TABLE IF NOT EXISTS student (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_number INTEGER,
            l_name TEXT,
            f_names TEXT,
            unoff_name TEXT,
            date_joined DATE, 
        expected_grad_year INTEGER,
        expected_grad_semester TEXT,
        ta_available INTEGER
    )`);

	// course
	db.run(`CREATE TABLE IF NOT EXISTS course (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hkust_identifier TEXT,
            name TEXT,
            description TEXT,
            semester TEXT, 
            year INTEGER,

            ta_needed INTEGER,
            ta_assigned INTEGER,
            field TEXT,
            keywords TEXT
                    )`);

	db.run(`CREATE TABLE IF NOT EXISTS student_course (
            student_id INTEGER,
            course_id INTEGER,
            FOREIGN KEY (student_id) REFERENCES student(id),
            FOREIGN KEY (course_id) REFERENCES course(id)
        )`);

	db.run(`CREATE TABLE IF NOT EXISTS teacher (
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                               l_name TEXT,
            f_names TEXT,
            unoff_name TEXT,
            field TEXT
   
        )`);

	db.run(`CREATE TABLE IF NOT EXISTS request (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
               student_id INTEGER,
                        teacher_id INTEGER,
                        course_id INTEGER,
                        message TEXT,
                        status TEXT,
                        request_from TEXT, 
                        want BOOLEAN,
FOREIGN KEY (student_id) REFERENCES student(id),
FOREIGN KEY (teacher_id) REFERENCES teacher(id),
FOREIGN KEY (course_id) REFERENCES course(id)

 )`);
});

// Use the student routes
app.use("/students", studentRoutes);
app.use("/courses", coursesRoutes);
app.use("/studentcourse", studentCourseRoutes);
app.use("/teachers", teachersRoutes);
app.use("/requests", requestsRoutes);

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
