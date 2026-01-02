// pages/api/data.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import allowedOrigin from '../allowedOrigin';

async function openDb() {

    return open({
        filename: 'src/pages/api/sql.db',
        driver: sqlite3.Database,
    });
}

export default async function handler(req, res) {

    allowedOrigin(req, res);

    const db = await openDb();

    const { login, session } = req.body; // Get the ID and password from the request body

     const data = await db.all("SELECT * FROM session WHERE login = ? AND session = ? ", login, session);
    if (data.length > 0) {

        res.json("OK"); // Return user data

    } else {
        console.log("Please login again.");
        res.json({ error: "Please login again." });
        res.status(200).json(false);
        return false;
    }
};