// db playground

import pg from 'pg';
import path from 'node:path';
import dotenv from 'dotenv';

const { Client } = pg;

const __dirname = import.meta.dirname;

dotenv.config({
    override: true,
    path: path.join(__dirname, '.env')
});

console.log(path.join(__dirname,'.env - running this env file for the server'));

const dbClientConfig = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    database: process.env.DATABASE,
    port: process.env.PORT
}
