import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import allowedOrigin from '../allowedOrigin';

async function openDb() {
    return open({
        filename: './pages/api/sql.db',
        driver: sqlite3.Database,
    });
}

export default async function handler(req, res) {
    const {
        query: { id },
    } = req;

    allowedOrigin(req, res);

    const studentId = id[0];
    let courseId = null;

    console.log(id.length);

    if (id.length > 1) {
        courseId = id[1];
    }
    const db = await openDb();

    if (req.method === 'GET') {

        try {

            let data = null;

            if (id.length === 1) {
                data = await db.all("SELECT * FROM student_course WHERE student_id = ?",
                    studentId);
            } else {
                data = await db.all("SELECT * FROM student_course WHERE student_id = ? AND course_id = ?",
                    studentId, courseId);
            }
            if (data) {
                res.status(200).json(data);
            } else {
                res.status(200).json([]);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error when fetching data' });
        }
    } else if (req.method === 'DELETE') {

        console.log("DELETE");
        console.log("studentId", studentId);
        console.log("courseId", courseId);

        try {
            await db.run(`DELETE FROM student_course WHERE student_id = ? AND course_id = ?`, studentId, courseId);
            res.status(200).json({ message: 'Record deleted' });
        } catch (error) {
            console.log("record error", error);
            res.status(500).json({ message: 'Error during deletion' });
        }
    }
}