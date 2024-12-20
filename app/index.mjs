import ignition from './initenv.mjs'
await ignition();
import express from "express";
import path from 'path';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import logger from "./logger.mjs";
import routes from './routes/index.mjs'
import './strategies/local-strategy.mjs'

const APPPORT = process.env.APPPORT || 3001;

const app = express();
logger.info('App Started. Hello!');
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '5000mb', extended: true, parameterLimit: 100000000000}));

// app.use(passport.initialize());
// app.use(passport.session(session));

app.use(routes);



app.get('/privacy_policy/', (request, response) => {
    response.sendFile(path.resolve(import.meta.dirname + '/../public/privacy_policy.html'));
})

app.listen(APPPORT, () => {
  logger.info(`Express server running at http://localhost:${APPPORT}/`);
});
