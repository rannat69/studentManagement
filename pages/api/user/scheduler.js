import { CronJob } from 'cron';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import allowedOrigin from '../allowedOrigin';

async function openDb() {

    return open({
        filename: './pages/api/sql.db',
        driver: sqlite3.Database,
    });
}

// Planifie la tâche pour vider la table toutes les 2 heures

export default async function handler(req, res) {

    allowedOrigin(req, res);

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