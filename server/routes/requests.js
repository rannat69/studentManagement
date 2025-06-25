const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// Create or open the SQLite database
const db = new sqlite3.Database("sql.db");

var admin = require("firebase-admin");
var serviceAccount = require("../firebase.json");
const dbFirebase = admin.firestore();

// API to get all requests
router.get("/", (req, res) => {

	// get request 
	dbFirebase.collection("request").get().then((querySnapshot) => {
		const requests = [];
		querySnapshot.forEach((doc) => {
			requests.push(doc.data());
		});
		res.json(requests);
	}).catch((error) => {
		res.status(500).json({ error: error.message });
	});


});

// Get specific requests according to parameters
router.get("/:requestFrom/:want/:studentId/:courseId", (req, res) => {
	const { requestFrom, want, studentId, courseId } = req.params;
	db.get(
		"SELECT * FROM request WHERE want = ? AND request_from = ? AND student_id = ? AND course_id = ?",
		[want, requestFrom, studentId, courseId],
		(err, rows) => {
			if (err) {
				res.status(500).json({ error: err.message });
			} else {
				res.json(rows);
			}
		}
	);
});
// API to add a request
router.post("/", (req, res) => {
	const {
		student_id,
		teacher_id,
		course_id,
		message,
		status,
		request_from,
		want,
	} = req.body;

	// create request 
	// get max id from request collection
	let maxId = 0;

	dbFirebase.collection("request").get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			if (doc.data().id > maxId) {
				maxId = doc.data().id;
			}
		});

		// create request
		dbFirebase.collection("request").add({
			id: maxId + 1,
			student_id: student_id ? student_id : null,
			teacher_id: teacher_id ? teacher_id : null,
			course_id: course_id ? course_id : null,
			message: message ? message : null,
			status: status ? status : null,
			request_from: request_from ? request_from : null,
			want: want ? want : null,
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
	const {
		student_id,
		teacher_id,
		course_id,
		message,
		status,
		request_from,
		want,
	} = req.body;

	// update request

	dbFirebase.collection("request").where("id", "==", Number(id)).get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			doc.ref.update({
				student_id: student_id,
				teacher_id: teacher_id,
				course_id: course_id,
				message: message,
				status: status,
				request_from: request_from,
				want: want,
			});
		});
	}).catch((error) => {
		res.status(500).json({ error: error.message });
	});

});

// Delete a student
router.delete("/:id", (req, res) => {
	const { id } = req.params;

	// delete request	
	dbFirebase.collection("request").where("id", "==", Number(id)).get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			doc.ref.delete();
		});
	}).catch((error) => {
		res.status(500).json({ error: error.message });
	});

});

module.exports = router;
