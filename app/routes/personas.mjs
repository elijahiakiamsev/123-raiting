import {Router} from 'express';
import {queryDB} from '../../database/db.mjs';
import logger from "./../logger.mjs";
import * as wp from "./../webpage.mjs"; 

const router = Router();

router.get('/p/', async (request, response) => {
    response.render('persons.ejs', 
        {webPageData : await preparePersonsPageData()});
});

router.get('/p/:personUri/', async (request, response) => {
    const personUri = request.params.personUri;
    response.render('person.ejs', 
        {webPageData: await preparePersonPageByUri(personUri)});
});

router.get('/p/:personUri/raiting', async (request, response) => {
    const person_uri = request.params.personUri;
    logger.debug('*** GET Personal raiting for '+ person_uri);
    var webPageData = {};
    webPageData = await getPersonalRaiting(person_uri);
//    webPageData['person_name'] = await getPersonName(name_uri);
    response.render('person_raiting.ejs', {webPageData: webPageData});
});

// Generating the persons page

async function preparePersonsPageData() {
    var pageData = wp.CleanWebpage;
    pageData.title = "Люди";
    pageData.showJSON = false;
    pageData.breadCrumbs = [
        wp.breadCrumbs.home,
    ]
    pageData.content = {
        persons : await preparePersonsList(),
    }
    return pageData;
};

async function preparePersonsList() {
    const rawList = await getPersonsListFromDB();
    var result = {};
    // group object by the first name letter
    for (var i=0; i < rawList.length; i++) {
        if (!result[rawList[i].name_letter]) result[rawList[i].name_letter] = [];
        result[rawList[i].name_letter].push({
            id : rawList[i].id,
            uri : rawList[i].uri,
            first_name : rawList[i].first_name,
            last_name : rawList[i].last_name
        });
    }
    return result;
}

async function getPersonsListFromDB() {
    const query = {
        text: `SELECT p.id,
        p.uri,
        p.first_name,
        p.last_name,
        LEFT (p.last_name, 1) as name_letter
        FROM persons p
        ORDER BY p.last_name, p.first_name;`,
    }
    const res = await queryDB(query);
    return res.rows;
}

// generating person page

async function preparePersonPageByUri(personUri) {
    var pageData = wp.CleanWebpage;
    const personInfo = await getPersonInfoByUriFromDB(personUri);
    const concertsInfo = await getConcertsByPersonFromDB(personInfo.id);
    pageData.breadCrumbs = [
        wp.breadCrumbs.home,
        wp.breadCrumbs.persons
    ];
    pageData.content = {}
    pageData.content.concerts = concertsInfo;
    pageData.title = personInfo.first_name + ' ' + personInfo.last_name;
    return pageData;
};

async function getPersonInfoByUriFromDB(personUri) {
    const query = {
        text: `SELECT
        *
        FROM persons p
        where p.uri = $1`,
        values: [personUri]
    }
    const result = await queryDB(query);
    return result.rows[0];
}

async function getConcertsByPersonFromDB(personID) {
    logger.debug('getConcertsByPersonFromDB: personID = ' + personID);
    // select only concerts where the person is a comedian
    // fix it after implementing other roles
    const query = {
        text: `SELECT
        m.id,
        m.title,
        m.uri
        FROM collaborators c
        JOIN media m
        ON c.media_id = m.id
        AND c.role_id = 1
        WHERE c.person_id = $1
        ORDER BY m.title`,
        values: [personID]
    };
    const result = await queryDB(query);
    return result.rows;
}

// Personal raiting (from persons to an media)

async function getPersonalRaitingDB(person_uri) {
    if (person_uri == '') {
        logger.error('No person URI sended');
        return false;
    }
    const query = {
        text: `SELECT
        r.media_raiting,
        m.uri,
        m.title,
        ms.web_link,
        extract(year from ms.release_date) AS release_year,
        concat(p1.first_name, ' ', p1.last_name) AS person_name
        FROM raiting r
        JOIN persons p
        ON r.person_id = p.id AND p.uri = $1
        JOIN media m
        ON m.id = r.media_id
        JOIN media_sources ms
        ON ms.media_id = m.id
        JOIN collaborators c
        ON m.id = c.media_id AND c.role_id = 1
        JOIN persons p1
        ON c.person_id = p1.id
        ORDER BY r.media_raiting DESC, m.title ASC;`,
        values: [person_uri]
    }
    const res = await queryDB(query);
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
        (rating in result) || (result[rating] = []);
        result[rating] = result[rating].concat({title:dbResult.rows[item].title, 
            uri:dbResult.rows[item].uri, 
            web_link:dbResult.rows[item].web_link,
            person_name:dbResult.rows[item].person_name,
            release_year:dbResult.rows[item].release_year
        });
    }
    return result;
};

export default router;