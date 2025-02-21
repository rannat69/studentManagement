export function createTables(db) {
	db.serialize(() => {
		//db.run(`DROP TABLE student`);
		//db.run(`DROP TABLE course`);
		//db.run(`DROP TABLE student_course`);

		//db.run(`DELETE FROM student_course`);
		//db.run(`DELETE FROM request`);
	});

	// Create the student table
	db.serialize(() => {
		db.run(`CREATE TABLE IF NOT EXISTS student (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_number INTEGER,
            l_name TEXT,
            f_names TEXT,
            unoff_name TEXT,
            program TEXT, 
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

		db.run(`CREATE TABLE IF NOT EXISTS course_area (
            area TEXT,
            course_id INTEGER,           
            FOREIGN KEY (course_id) REFERENCES course(id)
        )`);
	});
}
