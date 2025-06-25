const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// Create or open the SQLite database
const db = new sqlite3.Database("sql.db");

var admin = require("firebase-admin");
var serviceAccount = require("../firebase.json");
const dbFirebase = admin.firestore();

// API to get all courses and qualifications
router.get("/", (req, res) => {
	dbFirebase.collection("course").get().then((querySnapshot) => {
		const courses = [];
		querySnapshot.forEach((doc) => {
			courses.push(doc.data());

		});
		res.json(courses);
	}).catch((error) => {
		res.status(500).json({ error: error.message });
	});
});

router.get("/:id", (req, res) => {


	const courseId = req.params.id; // Get the ID from the request parameters
	dbFirebase.collection("course").where("id", "==", Number(courseId)).get().then((querySnapshot) => {
		let courseQualifications = [];
		querySnapshot.forEach((doc) => {



			courseQualifications = doc.data().qualification;
		});
		res.json(courseQualifications);
	}).catch((error) => {
		console.log("error", error);
		res.status(500).json({ error: error.message });
	});

});

// API to assign an qualification to a course
router.post("/", (req, res) => {
	const { qualification, courseId } = req.body;


	// add an qualification array property to course
	dbFirebase.collection("course").where("id", "==", Number(courseId)).get().then((querySnapshot) => {


		querySnapshot.forEach((doc) => {

			// update doc to add qualification
			doc.ref.update({
				qualification: admin.firestore.FieldValue.arrayUnion(qualification)
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

// API to delete all qualifs of a course
router.delete("/:id", (req, res) => {
	const { id } = req.params;

	
	dbFirebase.collection("course").where("id", "==", Number(id)).get().then((querySnapshot) => {


		querySnapshot.forEach((doc) => {

			// update doc to add area
			doc.ref.update({
				qualification: []
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
