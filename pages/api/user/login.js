// pages/api/data.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from "bcrypt";
import cookie from 'cookie';
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

    const { login, password } = req.body; // Get the ID and password from the request body
    //123456
    const data = await db.all("SELECT * FROM user WHERE login = ?", login);
    if (data.length > 0) {

        console.log(data);

        // Compare the hashed password with the input password
        bcrypt.compare(password, data[0].password, (err, result) => {
            if (err) throw err;

            if (result) {
                console.log("Password is valid!");
                // Proceed with login

                res.setHeader('Set-Cookie', cookie.serialize('token', login, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 60 * 60 * 24,
                    path: '/',
                    sameSite: 'Strict',
                }));

                // create a record in the session table

                // Generate a seesion_code with a random series of 10 numbers
                const sessionCode = Number(Math.floor(Math.random() * 10000000000)).toString();

                console.log(sessionCode);

                db.run("INSERT INTO session (login, session) VALUES (?, ?)", [login, sessionCode], (err) => {
                    if (err) {
                        console.error(err.message);
                        res.status(500).json({ error: "Failed to create session record." });
                        return;
                    }
                });

                // return crypted login and password 
                res.status(200).json({ login: login, sessionCode: sessionCode });


            } else {
                console.log("Invalid password.");
                res.json({ error: "Invalid password." });
            }
        });
    } else {
        console.log("User does not exist.");
        res.json({ error: "User does not exist." });
        res.status(200).json(false);
        return false;
    }
};





