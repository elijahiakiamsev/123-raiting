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
        await pool.end();
        return
    }
    db = pool;
}

export function getDB() {
  return db
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

    const db = getDB();
    console.log(typeof(db));

    try {
        const res = await db.query(query);
        logger.debug('DB response recieved ' + res.rows);
        return res.rows;
     } catch (err) {
        logger.error(err);
     } finally {
        logger.debug('*** getPersonalRaitingDB ends')
     }
};

export async function testDB() {
    const query = 'SELECT * FROM PERSONS WHERE id = 1;';
    const res = await queryDB(query);
    var testResult = false;
    console.log('testDB response recieved, person_name = ' + res[0].person_name);
    if (res[0].person_name == 'Илья Якямсев') {
        testResult = true;
    }
    console.log('*** testDB ends');
    return testResult;  
};