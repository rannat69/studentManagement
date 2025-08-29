export function createTables(db, bcrypt) {

    console.log("create tables ");

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

    // Create the student table
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS student (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_number INTEGER,
            l_name TEXT,
            f_names TEXT,
            unoff_name TEXT,
            program TEXT, 
            email TEXT,
            date_joined DATE, 
        expected_grad_year INTEGER,
        expected_grad_semester TEXT,
        ta_available INTEGER, 
        available BOOLEAN
            
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
            year INTEGER,
            semester TEXT,
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

        db.run(`CREATE TABLE IF NOT EXISTS course_qualification (
            qualification TEXT,
            course_id INTEGER,           
            FOREIGN KEY (course_id) REFERENCES course(id)
        )`);



        db.run(`CREATE TABLE IF NOT EXISTS student_area (
            student_id INTEGER,
            area TEXT,
            FOREIGN KEY (student_id) REFERENCES student(id)

        )`);

        db.run(`CREATE TABLE IF NOT EXISTS student_qualification (
            student_id INTEGER,
            qualification TEXT,
            FOREIGN KEY (student_id) REFERENCES student(id)

        )`);

        db.run(`CREATE TABLE IF NOT EXISTS student_teacher (
            student_id INTEGER,
            teacher_id INTEGER,
FOREIGN KEY (student_id) REFERENCES student(id),
FOREIGN KEY (teacher_id) REFERENCES teacher(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS course_teacher (
            course_id INTEGER,
            teacher_id INTEGER,
FOREIGN KEY (course_id) REFERENCES course(id),
FOREIGN KEY (teacher_id) REFERENCES teacher(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS session (
            session TEXT,
            login TEXT

        )`);

        db.run(`CREATE TABLE IF NOT EXISTS user (
            login TEXT,
            password TEXT,
            type TEXT

        )`);

        const user = "admin";
        const password = "123456"; // obfuscated
        const type = "admin";
        // Hash the password
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) throw err;

            // check if already exist
            db.get("SELECT * FROM user WHERE login = ?", [user], (err, row) => {
                if (err) {
                    return console.error(err.message);
                }
                if (row) {
                    console.log(`User ${user} already exists.`);
                    return;
                }
            });

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
        });
    });
}
