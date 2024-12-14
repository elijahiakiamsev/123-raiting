import pg from 'pg';
import path from 'node:path';
import dotenv from 'dotenv';
import {logger} from "./logger.mjs";

const { Client } = pg;

const __dirname = import.meta.dirname;

dotenv.config({
    override: true,
    path: path.join(__dirname, '.env')
});

logger.info(path.join(__dirname,'.env is working'));

const dbClientConfig = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    database: process.env.DATABASE,
    port: process.env.PORT
}

async function getPersonalRaitingDB(person_uri) {
    logger.debug('*** getPersonalRaitingDB starts, person_uri = ' + person_uri);
    if (person_uri == '') {
        logger.error();
        return NULL;
    }
    const client = new Client(dbClientConfig);
    try {
        await client.connect();
        logger.debug('Database connected')
    } catch(err) {
        logger.error(err);
        await client.end();
        return NULL
    }
    const query = {
        text: `SELECT raiting.media_raiting, media.uri, media.title
        FROM raiting
        JOIN persons
        ON raiting.person_id = persons.id
        JOIN media
        ON media.id = raiting.media_id
        WHERE persons.uri in ($1)
        ORDER BY raiting.media_raiting DESC;`,
        values: [person_uri]
    } 
    try {
        const res = await client.query(query);
        logger.info('DB response recieved' + res.rows[0])
        return res.rows;
     } catch (err) {
        logger.error(err)
     } finally {
        await client.end();
        ('*** getPersonalRaitingDB ends')
     }
}

export async function getPersonalRaiting(person_uri) {
    logger.debug('*** getPersonalRaiting starts, person_uri = ' + person_uri);
    const dbResult = await getPersonalRaitingDB(person_uri);
    var result = {};
    for (var item in dbResult) {
        var rating = parseInt(dbResult[item].media_raiting);
        var title = dbResult[item].title;
        var uri = dbResult[item].uri;
        (rating in result) || (result[rating] = []);
        result[rating] = result[rating].concat({title:title, uri:uri});
    }
    logger.debug('*** getPersonalRaiting ends');
    return result;
};

async function testDB() {
    logger.debug('*** testDB connection starts');
    const client = new Client(dbClientConfig);
    try {
        await client.connect();
        logger.debug('Database connected')
    } catch(err) {
        logger.error(err);
        await client.end();
        return NULL
    }
    try {
        const query = 'SELECT * FROM PERSONS WHERE id = 1;';
        const res = await client.query(query);
        logger.info('testDB response recieved, person_name = ' + res.rows[0].person_name);
        return res.rows;
     } catch (err) {
        logger.error(err)
     } finally {
        await client.end();
        ('*** testDB ends')
     }  
};

// testDB();
// const person = 'Ilia_Iakiamsev';
// const test_result = await getPersonalRaiting(person);
// console.log(test_result);