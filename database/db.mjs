import pg from 'pg';
import {logger} from "../app/logger.mjs";

const { Pool } = pg;

let db

export async function connectDB() {
    const dbClientConfig = {
        user: process.env.USER,
        password: process.env.PASSWORD,
        host: process.env.HOST,
        database: process.env.DATABASE,
        port: process.env.PORT
    }
    const pool = new Pool(dbClientConfig);
    try {
        await pool.connect();
        logger.debug('Database pool connected')
    } catch(err) {
        logger.error(err);
        logger.debug('Database pool is not connected')
        await pool.end();
        return
    }
    db = pool;
}

export function getDB() {
    return db;
}

export async function endDB() {
    await db.end();
    logger.debug('Database connection closed')
  }

export async function queryDB(query) {
    if (!query) {
        logger.error('No query for database')
        return;
    };
    try {
        const res = await db.query(query);
        logger.debug('DB response recieved, example: ' + JSON.stringify(res.rows[0]));
        return res;
     } catch (err) {
        logger.error(err);
     }
};

export async function testDB() {
    const query = 'SELECT * FROM PERSONS WHERE id = 1;';
    const res = await queryDB(query);
    var testResult = true;
    if (res.rows[0].person_name != 'Илья Якямсев') {
        testResult = false;
        logger.error('testDB: Something wrong with the database')
        return testResult
    }
    logger.debug('testDB: Test passed, database is working');
    return testResult;
};