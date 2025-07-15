import sqlite3 from 'sqlite3';

import { createTables } from './createTables';
import bcrypt from "bcrypt";
export function initdb() {

    const db = new sqlite3.Database("./pages/api/sql.db"); // Use a file instead for persistent storage


    createTables(db, bcrypt);
}