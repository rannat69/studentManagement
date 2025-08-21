


// pages/api/data.js
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

    allowedOrigin(req, res);

    const db = await openDb();

    const data = await db.all('SELECT s.l_name, s.f_names, c.hkust_identifier, c.name, sc.year, sc.semester FROM student_course sc inner join student s on s.id = sc.student_id inner join course c on c.id = sc.course_id');

    res.status(200).json(data);
}