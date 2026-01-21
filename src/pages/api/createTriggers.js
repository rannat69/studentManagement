export function createTriggers(db, bcrypt) {
  db.serialize(() => {
    //db.run(`DROP TABLE IF EXISTS student`);
    //db.run(`DROP TABLE IF EXISTS request`);
    //db.run(`DROP TABLE IF EXISTS student_course`);
    //	db.run(`DROP TABLE IF EXISTS qualification`);
    //db.run(`DROP TABLE IF EXISTS course`);
    //db.run(`DELETE FROM student_course`);
    //db.run(`DELETE FROM request`);
    //db.run(`DROP TABLE IF EXISTS user`);
  });

  db.serialize(() => {
    // Create triggers

    // Create a trigger on student table.
    // When student is deleted, delete from student_course, student_qualification, student_area, request

    db.run(`DROP TRIGGER IF EXISTS delete_student_details`);

    db.run(`DROP TRIGGER IF EXISTS delete_course_details`);

    db.run(`DROP TRIGGER IF EXISTS delete_teacher_details`);

    db.run(`CREATE TRIGGER delete_student_details
BEFORE DELETE ON student
FOR EACH ROW
BEGIN
    DELETE FROM student_course WHERE student_id = OLD.id;
    DELETE FROM student_qualification WHERE student_id = OLD.id;
    DELETE FROM student_area WHERE student_id = OLD.id;
    DELETE FROM request WHERE student_id = OLD.id;
     DELETE FROM student_teacher WHERE student_id = OLD.id;
END;`);

    // course
    db.run(`CREATE TRIGGER delete_course_details
BEFORE DELETE ON course
FOR EACH ROW
BEGIN
    DELETE FROM student_course WHERE course_id = OLD.id;
    DELETE FROM course_qualification WHERE course_id = OLD.id;
    DELETE FROM course_area WHERE course_id = OLD.id;
     DELETE FROM course_teacher WHERE course_id = OLD.id;
    DELETE FROM request WHERE course_id = OLD.id;
END;`);

    // course
    db.run(`CREATE TRIGGER delete_teacher_details
BEFORE DELETE ON teacher
FOR EACH ROW
BEGIN
     DELETE FROM course_teacher WHERE teacher_id = OLD.id;
        DELETE FROM student_teacher WHERE teacher_id = OLD.id;
    DELETE FROM request WHERE teacher_id = OLD.id;
END;`);

    /*const user = "admin";
		const password = "xxxxxxxxxxxxxxx"; // obfuscated
		const type = "admin";
		// Hash the password
		bcrypt.hash(password, 10, (err, hash) => {
			if (err) throw err;

			// Insert into the database
			db.run(
				`INSERT INTO user (login, password, type) VALUES (?, ?, ?)`,
				[user, hash, type],
				function (err) {
					if (err) {
						return console.error(err.message);
					}
					console.log(`A row has been inserted with rowid ${this.lastID}`);
				}
			);
		});*/
  });
}
