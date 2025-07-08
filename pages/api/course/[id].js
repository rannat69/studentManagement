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
            const data = await db.get('SELECT * FROM course WHERE id = ?', id); // Remplacez par votre requête
            if (data) {
                res.status(200).json(data);
            } else {

                res.status(404).json({ message: 'record not found' });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error when fetching data' });
        }
    } else if (req.method === 'PUT') {

        const { hkust_identifier,
            name,
            description,
            semester,
            year,
            field,
            keywords,
            ta_needed,
            ta_assigned,
        } = req.body; // Exemple de champs à modifier
        try {

            const updateCourse = async () => {

                console.log("updateCourse");

                await db.run(
                    `UPDATE course SET hkust_identifier = ?,  name = ?, description = ?, semester = ?, year = ?, field = ?, keywords = ?, ta_needed = ?, ta_assigned = ? WHERE id = ?`,
                    [
                        hkust_identifier,
                        name,
                        description,
                        semester,
                        year,
                        field,
                        keywords,
                        ta_needed,
                        ta_assigned,
                        id,
                    ],
                    function (err) {
                        if (err) {
                            console.log("updatecourse errno", err.errno);
                            console.log("updatecourse code", err.code);

                            if (err.code === "SQLITE_BUSY" && retryCount < maxRetries) {
                                retryCount++;
                                console.log(
                                    `Database busy, retrying in ${delay}ms... (attempt ${retryCount}/${maxRetries})`
                                );
                                setTimeout(updateCourse, delay);
                                delay *= 2; // Exponential backoff: double the delay for the next retry
                            } else {
                                // If max retries exceeded or other error, return a 500 error
                                console.error(
                                    "Failed to update student after multiple retries or due to a non-busy error:",
                                    err
                                ); // Log the error
                                res.status(500).json({ error: err.message });
                            }
                        } else {
                            res.json({ id });
                        }
                    }

                );
                console.log("record updated")
                res.status(200).json({ message: 'Record updated' });
            }

            await updateCourse();
            res.status(200).json({ message: 'Record updated' });

        } catch (error) {
            console.log("record error", error);

            res.status(500).json({ message: 'Error during update' });
        }

    } else if (req.method === 'DELETE') {
        try {
            await db.run('DELETE FROM course WHERE id = ?', id);
            res.status(200).json({ message: 'Record deleted' });
        } catch (error) {
            console.log("record error", error);
            res.status(500).json({ message: 'Error during deletion' });
        }
    }
}