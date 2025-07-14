import { CronJob } from 'cron';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import allowedOrigin from '../allowedOrigin';
import { createTables } from '../createTables';

async function openDb() {

    return open({
        filename: './pages/api/sql.db',
        driver: sqlite3.Database,
    });
}

// Empty session table every 2 hours

export default async function handler(req, res) {

    allowedOrigin(req, res);

    const db = new sqlite3.Database("../sql.db"); // Use a file instead for persistent storage

    const bcrypt = require("bcrypt");
    createTables(db, bcrypt);

    console.log("start scheduler");
    CronJob.from({
        cronTime: '0 0 */2 * * *',
        onTick: async function () {
            try {
                console.log("clear session");

                const db = await openDb();
                await db.run("DELETE FROM session");

                console.log('Session emptied');
            } catch (error) {
                console.error('Error session:', error);
            }
        },
        start: true,
    });

    //cron.schedule('0 */2 * * *', async () => {

}

export function scheduler() {

    console.log("start scheduler once");

    CronJob.from({
        cronTime: '0 0 */2 * * *',
        onTick: async function () {
            try {
                console.log("clear session");

                const db = await openDb();
                await db.run("DELETE FROM session");

                console.log('Session emptied');
            } catch (error) {
                console.error('Error session:', error);
            }
        },
        start: true,
    });

}