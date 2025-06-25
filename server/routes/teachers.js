const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// Create or open the SQLite database
const db = new sqlite3.Database("sql.db");

var admin = require("firebase-admin");
var serviceAccount = require("../firebase.json");
const dbFirebase = admin.firestore();

// API to get all teacher
router.get("/", (req, res) => {

	// get teachers 
	dbFirebase.collection("teacher").get().then((querySnapshot) => {
		const teachers = [];
		querySnapshot.forEach((doc) => {
			teachers.push(doc.data());
		});
		res.json(teachers);
	});
});

router.get("/:id", (req, res) => {
	const teacherId = req.params.id; // Get the ID from the request parameters

	dbFirebase.collection("teacher").where("id", "==", parseInt(teacherId)).get().then((querySnapshot) => {
		const teachers = [];
		querySnapshot.forEach((doc) => {
			teachers.push(doc.data());
		});
		res.json(teachers);
	});


});

// API to add a student
router.post("/", (req, res) => {
	const { l_name, f_names, unoff_name, field } = req.body;

	// get max id from student collection
	let maxId = 0;

	// get max id from student collection
	dbFirebase.collection("teacher").get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {

			if (doc.data().id > maxId) {
				maxId = doc.data().id;


			}
		});
		console.log("maxId", maxId);

		dbFirebase.collection("teacher").add({
			id: maxId + 1,
			l_name: l_name ? l_name : null,
			f_names: f_names ? f_names : null,
			unoff_name: unoff_name ? unoff_name : null,
			field: field ? field : null,
		}).then((docRef) => {

			res.json({ id: docRef.id });
		}).catch((error) => {
			console.log("error", error);
			res.status(500).json({ error: error.message });
		});

	}).catch((error) => {
		res.status(500).json({ error: error.message });
	});


});

// Modify student
router.put("/:id", (req, res) => {
	const { id } = req.params;
	const { l_name, f_names, unoff_name, field } = req.body;


	//update teacher
	dbFirebase.collection("teacher").where("id", "==", Number(id)).get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {

			doc.ref.update({
				l_name: l_name,
				f_names: f_names,
				unoff_name: unoff_name,
				field: field,
			});
		});
	}).catch((error) => {
		res.status(500).json({ error: error.message });
	});


});

// Delete a student
router.delete("/:id", (req, res) => {
	const { id } = req.params;

	// delete teacher 
	dbFirebase.collection("teacher").where("id", "==", Number(id)).get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			doc.ref.delete();
		});

	});
});

module.exports = router;
