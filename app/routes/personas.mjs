import {Router} from 'express';
import {queryDB} from '../../database/db.mjs';
import logger from "./../logger.mjs";

const router = Router();

router.get('/p/', (request, response) => {
    response.render('persons.ejs');
});

router.get('/p/:name_uri/', (request, response) => {
    const name_uri = request.params.name_uri;
    response.render('person.ejs', {name_uri:name_uri});
});

router.get('/p/:name_uri/raiting', async (request, response) => {
    const name_uri = request.params.name_uri;
    logger.debug('*** GET Personal raiting for '+ name_uri);
    var webPageData = {};
    webPageData = await getPersonalRaiting(name_uri);
//    webPageData['person_name'] = await getPersonName(name_uri);
    if (!webPageData) {
        logger.error('Validation: the delivered result is empty.');
        response.status(404).send('404 - no that page');
        return
    }
    response.render('person_raiting.ejs', {webPageData: webPageData});
});

async function getPersonalRaitingDB(person_uri) {
    if (person_uri == '') {
        logger.error('No person URI sended');
        return false;
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
};

export async function getPersonalRaiting(person_uri) {
    if (person_uri == '') {
        logger.error('No person URI sended');
        return false;
    }
    const dbResult = await getPersonalRaitingDB(person_uri);
    var result = {};
    for (var item in dbResult.rows) {
        var rating = parseInt(dbResult.rows[item].media_raiting);
        var title = dbResult.rows[item].title;
        var uri = dbResult.rows[item].uri;
        (rating in result) || (result[rating] = []);
        result[rating] = result[rating].concat({title:title, uri:uri});
    }
    return result;
};

export default router;