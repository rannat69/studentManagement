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
    const { courseId, year, semester } = req.body;

  const db = await openDb();
  console.log("courseId",courseId);
  const data = await db.all('SELECT * FROM student_course where course_id = ? and year = ? and semester = ? ', courseId, year, semester); 

  console.log("data",data);

  res.status(200).json(data);
}