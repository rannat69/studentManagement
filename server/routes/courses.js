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

// API to get a specific course by ID
router.get("/:id", (req, res) => {
	const { id } = req.params;

	dbFirebase.collection("course").where("id", "==", Number(id)).get().then((querySnapshot) => {
		const courses = [];
		querySnapshot.forEach((doc) => {
			courses.push(doc.data());
		});

		if (courses.length === 0) {
			return res.status(404).json({ error: "Course not found" });
		}

		res.json(courses[0]);
	}).catch((error) => {
		res.status(500).json({ error: error.message });
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

	// get max id from student collection
	let maxId = 0;

	// get max id from student collection
	dbFirebase.collection("course").get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			if (doc.data().id > maxId) {
				maxId = doc.data().id;
			}
		});
	}).catch((error) => {
		res.status(500).json({ error: error.message });
	});



	// add to course collection 
	dbFirebase.collection("course").add({
		id: maxId + 1,
		hkust_identifier: hkust_identifier ? hkust_identifier : null,
		name: name ? name : null,
		description: description ? description : null,
		semester: semester ? semester : null,
		year: year ? year : null,
		field: field ? field : null,
		keywords: keywords ? keywords : null,
		ta_needed: ta_needed ? ta_needed : null,
		ta_assigned: ta_assigned ? ta_assigned : null,
	}).then((docRef) => {

		res.json({ id: docRef.id });
	}).catch((error) => {
		console.log("error", error);
		res.status(500).json({ error: error.message });
	});

	/*
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
	
		createCourse(); // Initial call to createCourse*/
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

	// update record with the property id = id 
	dbFirebase.collection("course").where("id", "==", Number(id)).get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			doc.ref.update({
				hkust_identifier: hkust_identifier,
				name: name,
				description: description,
				semester: semester,
				year: year,
				field: field,
				keywords: keywords,
				ta_needed: ta_needed,
				ta_assigned: ta_assigned,
			});
		});

		res.json({ id });
	}).catch((error) => {
		res.status(500).json({ error: error.message });
	});
});

// Delete a course
router.delete("/:id", (req, res) => {
	const { id } = req.params;

	// delete record with the property id = id
	dbFirebase.collection("course").where("id", "==", Number(id)).get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			doc.ref.delete();
		});
	}).catch((error) => {
		res.status(500).json({ error: error.message });
	});

});

module.exports = router;
