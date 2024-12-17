import {queryDB} from '../database/db.mjs';
import {logger} from "./logger.mjs";

async function getPersonalRaitingDB(person_uri) {
    logger.debug('*** getPersonalRaitingDB starts, person_uri = ' + person_uri);
    if (person_uri == '') {
        logger.error();
        return;
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
    const res = queryDB(query);
    return res;
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