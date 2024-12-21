import pg from 'pg';
import logger from "../app/logger.mjs";

const { Pool } = pg;

let db

// checks

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

// end checks

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
        logger.debug('queryDB response recieved, example: ' + JSON.stringify(res.rows[0]));
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

// Direct queries for mass queries
export async function getPersonsListDB() {
    const result = queryDB('SELECT * FROM persons;');
    return result;
};

export async function getPaywallsListDB() {
    const result = queryDB('SELECT * FROM paywalls;');
    return result;
}

//Single queries

export async function getMediaByIDDB(id) {
    if (!id) {
        logger.error('Function getMediaByIDDB - no argument id')
        return null;
    };
    if (!isNumeric(id)) {
        logger.error('Function getMediaByIDDB - id should be an INT')
        return null;
    };
    var query = {
        text: `SELECT m.id, m.title, m.uri as uri, media_sources.id as source_id,
web_link, media_sources.release_date, collaborators.person_id as person_id,
collaborators.role_id as role_id, person_name
FROM ( SELECT * FROM media WHERE media.id = $1) as m
LEFT JOIN media_sources
ON m.id = media_sources.media_id
LEFT JOIN collaborators
ON m.id = collaborators.media_id
LEFT JOIN persons
ON collaborators.person_id = persons.id
LEFT JOIN roles
ON collaborators.role_id = roles.id
WHERE role_id = 1;`,
        values: [id]
    }
    const result = await queryDB(query);
    return result;
}


// update queries

export async function deleteCollabBD(person_id, 
                                    role_id, 
                                    media_id) {
    if (!person_id || !role_id || !media_id) {
        logger.error('Function deleteCollabBD - no one or more arguments')
        return null;
    };
    if (!isNumeric(person_id) || !isNumeric(role_id) || !isNumeric(role_id)) {
        logger.error('Function deleteCollabBD - id should be an INT')
        return null;
    };
    var query = {
        text:`DELETE 
            FROM collaborators
            WHERE person_id = $1
            AND role_id = $2
            AND media_id = $3;`,
        values: [person_id, role_id, media_id]
    }
    await queryDB(query);
    logger.debug("deleteCollabBD: collab deleted");
    var result = null;
    return result;
}

export async function addCollabBD(person_id, 
                                    role_id, 
                                    media_id) {
    if (!person_id || !role_id || !media_id) {
    logger.error('Function addCollabBD - no one or more arguments')
    return null;
    };
    if (!isNumeric(person_id) || !isNumeric(role_id) || !isNumeric(role_id)) {
    logger.error('Function patchCollabBD - id should be an INT')
    return null;
    };
    var query = {
    text:`INSERT
    INTO collaborators (person_id, role_id, media_id)
    VALUES ($1, $2, $3);`,
    values: [person_id, role_id, media_id]
    }
    await queryDB(query);
    logger.debug("addCollabBD: collab added");
    var result = null;
    return result;
}