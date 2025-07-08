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

    const db = await openDb();

    if (req.method === 'GET') {
        try {
            const data = await db.all("SELECT * FROM student_area WHERE student_id = ?",
                id);
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
        try {
            await db.run(`DELETE FROM student_area WHERE student_id = ?`, id);
            res.status(200).json({ message: 'Record deleted' });
        } catch (error) {
            console.log("record error", error);
            res.status(500).json({ message: 'Error during deletion' });
        }
    }
}