import pg from 'pg';
import path from 'node:path';
import dotenv from 'dotenv';
import {logger} from "./logger.mjs";

const __dirname = import.meta.dirname + '/../';

dotenv.config({
    override: true,
    path: path.join(__dirname, '.env')
});

const { Client } = pg;

const dbClientConfig = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    database: process.env.DATABASE,
    port: process.env.PORT
}

logger.debug(path.join(__dirname,'.env is working'));

async function getYoutubeRaitingFromDB() {
    const client = new Client(dbClientConfig);
    try {
        await client.connect();
        logger.debug('Database connected')
    } catch(err) {
        logger.error(err);
        await client.end();
        return
    }
    const query = {
        text: `SELECT media_id, views_count, title, person_name
                FROM media_sources 
                JOIN (
                    SELECT 
                    media_source_id, 
                    scan_date, 
                    views_count,
                    ROW_NUMBER() OVER (PARTITION BY media_source_id ORDER BY scan_date DESC) AS row_num
                    FROM views
                    ) RankedMedia
                    ON RankedMedia.media_source_id = media_sources.id AND RankedMedia.row_num = 1
                    JOIN media
                    ON media_sources.media_id = media.id
                    JOIN
                    (
                    SELECT media_id as m_id, person_id
                    FROM collaborators
                    WHERE collaborators.role_id = 1
                    ) AS comedians
                    ON comedians.m_id = media_id
                    JOIN persons
                    ON persons.id = person_id
                    ORDER BY views_count DESC;`
    } 
    try {
        const res = await client.query(query);
        logger.debug('DB response recieved.');
        return res.rows;
    } catch (err) {
        logger.error(err);
    } finally {
        await client.end();
        logger.debug('*** getPersonalRaitingDB ends')
    }
    return res.rows;
}

export async function getYoutubeRaiting() {
    const result = await getYoutubeRaitingFromDB();
    console.log(result);
    return result;
}
