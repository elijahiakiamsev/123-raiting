import {queryDB} from '../database/db.mjs';
import {logger} from "./logger.mjs";

async function getYoutubeRaitingFromDB() {
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
    const res = queryDB(query);
    logger.debug('*** getPersonalRaitingDB ends')
    return res;
}

export async function getYoutubeRaiting() {
    const result = await getYoutubeRaitingFromDB();
    return result;
}
