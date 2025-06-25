const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// Create or open the SQLite database
const db = new sqlite3.Database("sql.db");

var admin = require("firebase-admin");
var serviceAccount = require("../firebase.json");
const dbFirebase = admin.firestore();

// API to get all students and areas
router.get("/", (req, res) => {
	dbFirebase.collection("student").get().then((querySnapshot) => {
		const students = [];
		querySnapshot.forEach((doc) => {
			students.push(doc.data());

		});
		res.json(students);
	}).catch((error) => {
		res.status(500).json({ error: error.message });
	});
});

router.get("/:id", (req, res) => {


	const studentId = req.params.id; // Get the ID from the request parameters
	dbFirebase.collection("student").where("id", "==", Number(studentId)).get().then((querySnapshot) => {
		let studentAreas = [];
		querySnapshot.forEach((doc) => {



			studentAreas = doc.data().area;
		});
		res.json(studentAreas);
	}).catch((error) => {
		console.log("error", error);
		res.status(500).json({ error: error.message });
	});

});

// API to assign an area to a student
router.post("/", (req, res) => {
	const { area, studentId } = req.body;


	// add an area array property to student
	dbFirebase.collection("student").where("id", "==", Number(studentId)).get().then((querySnapshot) => {


		querySnapshot.forEach((doc) => {

			// update doc to add area
			doc.ref.update({
				area: admin.firestore.FieldValue.arrayUnion(area)
			}).then(() => {
				res.json({ id: doc.id });
			}).catch((error) => {
				console.log("error", error);
				res.status(500).json({ error: error.message });
			});

		});
	}).catch((error) => {
		console.log("error", error);
		res.status(500).json({ error: error.message });


		/*db.run(
			`INSERT INTO student_area
			(area , student_id ) VALUES (?, ?)`,
			[area, studentId],
			function (err) {
				if (err) {
					res.status(500).json({ error: err.message });
				} else {
					res.json({ id: this.lastID });
				}
			}
		);*/
	});
});

// API to delete all areas of a student
router.delete("/:id", (req, res) => {
	const { id } = req.params;
	dbFirebase.collection("student").where("id", "==", Number(id)).get().then((querySnapshot) => {


		querySnapshot.forEach((doc) => {

			// update doc to add area
			doc.ref.update({
				area: []
			}).then(() => {
				res.json({ id: doc.id });
			}).catch((error) => {
				console.log("error", error);
				res.status(500).json({ error: error.message });
			});

		});
	}).catch((error) => {
		console.log("error", error);
		res.status(500).json({ error: error.message });

	});
});

module.exports = router;
