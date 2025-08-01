import ignition from './initenv.mjs'
await ignition();
import {getDB} from './../database/db.mjs';
import express from "express";
import path from 'path';
import bodyParser from 'body-parser';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import pgSession from 'connect-pg-simple';
import logger from "./logger.mjs";
import routes from './routes/index.mjs'
import scheduleScan  from './scans/schedule.mjs'
import './strategies/local-strategy.mjs'

const APPPORT = process.env.APPPORT || 3001;
const COOKIESECRET = process.env.COOKIESECRET;

logger.level = process.env.LOGLEVEL;
logger.info('App Started. Hello!');
logger.info('Loglevel is ' + logger.level);
logger.debug('Debug loglevel check');
logger.silly('Silly loglevel check');

const app = express();
const pgPool = getDB();

app.use(express.static('public'))
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '5000mb', extended: true, parameterLimit: 100000000000}));
app.use(cookieParser('helloworld'));

app.use(session({
  store: new (pgSession(session))({
    pool: pgPool
  }),
  secret: COOKIESECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60000 * 60
  }
}))
app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

await scheduleScan();

app.get('/privacy_policy/', (request, response) => {
    response.sendFile(path.resolve(import.meta.dirname + '/../public/privacy_policy.html'));
})

app.listen(APPPORT, () => {
  logger.info(`Express server running at http://localhost:${APPPORT}/`);
});
