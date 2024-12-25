import path from 'node:path';
import dotenv from 'dotenv';
import cron from 'node-cron';
import shell from 'shelljs';
import {connectDB, testDB} from "../database/db.mjs";
import logger from './logger.mjs';

async function ignition(envPath) {
    if (!envPath) {
        envPath = import.meta.dirname + '/../'
    }
    const __dirname = envPath;
    dotenv.config({
        override: true,
        path: path.join(__dirname, '.env')
    });
    await connectDB();
    await testDB();
    const youtubeScanScript = process.env.PATHTOYSCAN;
    logger.debug('path to youtube scan: '+youtubeScanScript);
    const youtubeScan = cron.schedule('0 0/4 * * *', () =>  {
        logger.info('Starting Youtube Scan by Cron at ' + Date.now())
        shell.exec('node ' + youtubeScanScript);
      }, {
        scheduled: false
      });
    youtubeScan.start();
}

export default ignition;