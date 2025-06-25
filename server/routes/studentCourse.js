const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// Create or open the SQLite database
const db = new sqlite3.Database("sql.db");
var admin = require("firebase-admin");
var serviceAccount = require("../firebase.json");
const dbFirebase = admin.firestore();
// API to get all courses
router.get("/", (req, res) => {

	// get all records from students where course.length > 0 
	dbFirebase.collection("student").where("courses", ">", []).get().then((querySnapshot) => {
		const students = [];
		querySnapshot.forEach((doc) => {
			students.push(doc.data());

		});

		res.json(students);
	}).catch((error) => {
		console.log("error 6", error.message);
		res.status(500).json({ error: error.message });
	});


	/*db.all("SELECT * FROM student_course", [], (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(rows);
		}
	});*/
});

router.get("/:student_id/:course_id", (req, res) => {
	const studentId = req.params.student_id; // Get the ID from the request parameters
	const courseId = req.params.course_id; // Get the ID from the request parameters

	dbFirebase.collection("student").where("id", "==", Number(studentId)).get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {

			const courses = doc.data().courses;

			// Find the course with the id 

			if (courses && courses.length > 0) {
				const course = courses.find(course => course.course_id === courseId);

				if (course) {
					res.json(course);
				}
			} else {
				res.json(null);
			}
		});
	}).catch((error) => {
		console.log("error 5", error.message);
		res.status(500).json({ error: error.message });
	});

});

// API to assign a student to a course
router.post("/", (req, res) => {
	const { student_id, course_id, year, semester } = req.body;


	dbFirebase.collection("student").where("id", "==", Number(student_id)).get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			doc.ref.update({
				courses: admin.firestore.FieldValue.arrayUnion({
					course_id: course_id,
					year: year,
					semester: semester,
				})
			});

		});
	}).catch((error) => {
		console.log("error 4", error.message);
		res.status(500).json({ error: error.message });
	});


	dbFirebase.collection("course").where("id", "==", Number(course_id)).get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			doc.ref.update({
				students: admin.firestore.FieldValue.arrayUnion({
					student_id: student_id,
					year: year,
					semester: semester,
				})
			});

		});
	}).catch((error) => {
		console.log("error 3", error.message);
		res.status(500).json({ error: error.message });
	});
});




// API to delete a student from a course
router.post("/delete", (req, res) => {
	const { student_id, course_id } = req.body;


	dbFirebase.collection("student").where("id", "==", Number(student_id)).get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {

			const courses = doc.data().courses;

			// Find the course to remove
			const courseToRemove = courses.find(course => course.course_id === course_id);

			if (courseToRemove) {
				doc.ref.update({
					courses: admin.firestore.FieldValue.arrayRemove(courseToRemove)
				});
			}

		});
	}).catch((error) => {
		console.log("error 2", error.message);
		res.status(500).json({ error: error.message });
	});

	dbFirebase.collection("course").where("id", "==", Number(course_id)).get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {

			const students = doc.data().students;

			// Find the course to remove
			const studentToRemove = students.find(student => student.student_id === student_id);

			if (studentToRemove) {
				doc.ref.update({
					students: admin.firestore.FieldValue.arrayRemove(studentToRemove)
				});
			}

		});
	}).catch((error) => {
		console.log("error 1", error.message);
		res.status(500).json({ error: error.message });
	});

});

module.exports = router;
