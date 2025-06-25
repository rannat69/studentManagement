const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// Create or open the SQLite database
const db = new sqlite3.Database("sql.db");
var admin = require("firebase-admin");
var serviceAccount = require("../firebase.json");
admin.initializeApp({

	credential: admin.credential.cert(serviceAccount)

});
const dbFirebase = admin.firestore();

// API to get all students
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


	/*db.all("SELECT * FROM student", [], (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json(rows);
		}
	});*/
});

router.get("/:id", (req, res) => {
	const studentId = req.params.id; // Get the ID from the request parameters

	// get record in student collection where id = studentId

	dbFirebase.collection("student").where("id", "==", Number(studentId)).get().then((querySnapshot) => {
		const students = [];
		querySnapshot.forEach((doc) => {
			students.push(doc.data());
		});
		res.json(students);
	}).catch((error) => {
		console.log("error", error);
		res.status(500).json({ error: error.message });
	});
});



// API to get all students with at least 1 TA
router.get("/ta_avail", (req, res) => {

	// get all records from student where ta_available > 0 

	dbFirebase.collection("student").where("ta_available", ">", 0).get().then((querySnapshot) => {
		const students = [];
		querySnapshot.forEach((doc) => {
			students.push(doc.data());

		});
		res.json(students);
	}).catch((error) => {
		res.status(500).json({ error: error.message });
	});

});

// API to add a student
router.post("/", (req, res) => {
	const {
		student_number,
		l_name,
		f_names,
		unoff_name,
		program,
		date_joined,
		expected_grad_year,
		expected_grad_semester,
		ta_available,
		available,
	} = req.body;

	// get max id from student collection
	let maxId = 0;

	// get max id from student collection
	dbFirebase.collection("student").get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			if (doc.data().id > maxId) {
				maxId = doc.data().id;
			}
		});
	}).catch((error) => {
		res.status(500).json({ error: error.message });
	});

	//insert into student collection 
	dbFirebase.collection("student").add({
		id: maxId + 1,
		student_number: student_number,
		l_name: l_name,
		f_names: f_names,
		unoff_name: unoff_name,
		program: program,
		date_joined: date_joined,
		expected_grad_year: expected_grad_year,
		expected_grad_semester: expected_grad_semester,
		ta_available: ta_available,
		available: available,
	}).then((docRef) => {

		res.json({ id: docRef.id });
	}).catch((error) => {
		console.log("error", error);
		res.status(500).json({ error: error.message });
	});

});
// Modify student
router.put("/:id", (req, res) => {



	const { id } = req.params;
	const {
		student_number,
		l_name,
		f_names,
		unoff_name,
		program,
		date_joined,
		expected_grad_year,
		expected_grad_semester,
		ta_available,
		available,
	} = req.body;

	dbFirebase.collection("student").where("id", "==", Number(id)).get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {

			doc.ref.update({
				student_number: student_number,
				l_name: l_name,
				f_names: f_names,
				unoff_name: unoff_name,
				program: program,
				date_joined: date_joined,
				expected_grad_year: expected_grad_year,
				expected_grad_semester: expected_grad_semester,
				ta_available: ta_available,
				available: available,
			});
		});

		res.json({ id });
	}).catch((error) => {
		console.log("error", error);
		res.status(500).json({ error: error.message });
	});




});

// Delete a student
router.delete("/:id", (req, res) => {
	const { id } = req.params;
	//
	//  delete record with the property id = id 
	dbFirebase.collection("student").where("id", "==", Number(id)).get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			doc.ref.delete();
		});
	}).catch((error) => {
		res.status(500).json({ error: error.message });
	});

});

module.exports = router;
