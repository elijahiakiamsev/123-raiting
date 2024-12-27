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
}

export default ignition;