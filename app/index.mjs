import express from "express";
import {getPersonalRaiting} from "./database.mjs";
import {logger} from "./logger.mjs";

const app = express();
logger.info('App Started. Hello!');
app.set("view engine", "ejs");
const APPPORT = process.env.APPPORT || 3001;

app.get('/', (request, response) => {
    response.render('index.ejs')
})

app.get('/p/', (request, response) => {
    response.render('persons.ejs');
})

app.get('/p/:name_uri/', (request, response) => {
    const name_uri = request.params.name_uri;
    response.render('person.ejs', {name_uri:name_uri});
})

app.get('/p/:name_uri/raiting', async (request, response) => {
    const name_uri = request.params.name_uri;
    logger.debug('*** GET Personal raiting for '+ name_uri);
    var webPageData = {};
    webPageData = await getPersonalRaiting(name_uri);
//    webPageData['person_name'] = await getPersonName(name_uri);
    logger.debug('Personal raiting delivered');
    console.log(JSON.stringify(webPageData, null, 2));
    if (!webPageData) {
        logger.error('Validation: the delivered result is empty.');
        response.status(404).send('404 - no that page');
        return
    }
    response.render('person_raiting.ejs', {webPageData: webPageData});
})

app.listen(APPPORT, () => {
  logger.info(`Express server running at http://localhost:${APPPORT}/`);
});
