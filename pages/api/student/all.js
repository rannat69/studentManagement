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

  try {

    const db = await openDb();

    const data = await db.all('SELECT * FROM student'); // Remplacez par votre requête

    res.status(200).json(data);

  } catch (error) {

    console.error(error);

    res.status(500).json({ error: 'Error : ' + error });

  }

}