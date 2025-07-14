import sqlite3 from 'sqlite3';

import { createTables } from './createTables';

export function initdb() {

    const db = new sqlite3.Database("./pages/api/sql.db"); // Use a file instead for persistent storage

    const bcrypt = require("bcrypt");
    createTables(db, bcrypt);
}