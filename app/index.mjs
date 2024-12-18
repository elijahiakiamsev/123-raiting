import {ignition} from './initenv.mjs'
await ignition();
import express from "express";
import {getPersonalRaiting} from "./database.mjs";
import {logger} from "./logger.mjs";
import {getYoutubeRaiting} from "./youtube-output.mjs";
import path from 'path';

import {indexRouter} from './routes/index.mjs'
import {youtubeRouter} from './routes/youtube.mjs'
import {personalRaitingRouter} from './routes/personal-raiting.mjs'

const APPPORT = process.env.APPPORT || 3001;

const app = express();
logger.info('App Started. Hello!');
app.set("view engine", "ejs");

app.use('/', indexRouter);
app.use('/', youtubeRouter);
app.use('/', personalRaitingRouter);

app.get('/p/', (request, response) => {
    response.render('persons.ejs');
})

app.get('/p/:name_uri/', (request, response) => {
    const name_uri = request.params.name_uri;
    response.render('person.ejs', {name_uri:name_uri});
})

app.get('/privacy_policy/', (request, response) => {
    response.sendFile(path.resolve(import.meta.dirname + '/../public/privacy_policy.html'));
})

app.listen(APPPORT, () => {
  logger.info(`Express server running at http://localhost:${APPPORT}/`);
});
