import pg from 'pg';
import path from 'node:path';
import dotenv from 'dotenv';

const __dirname = import.meta.dirname + '/../../';

dotenv.config({
    override: true,
    path: path.join(__dirname, '.env')
});

const { Client } = pg;

console.log(path.join(__dirname,'.env is working'));

const dbClientConfig = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    database: process.env.DATABASE,
    port: process.env.PORT
}

async function testDB() {
    console.log('*** testDB connection starts');
    const client = new Client(dbClientConfig);
    try {
        await client.connect();
        console.log('Database is connected')
    } catch(err) {
        console.log(err);
        await client.end();
        console.log('Database is not connected');
        return
    }

    var testResult = false;
    try {
        const query = 'SELECT * FROM PERSONS WHERE id = 1;';
        const res = await client.query(query);
        console.log('testDB response recieved, person_name = ' + res.rows[0].person_name);
        if (res.rows[0].person_name == 'Илья Якямсев') {
            testResult = true;
        }
     } catch (err) {
        console.log(err)
     } finally {
        await client.end();
        console.log('*** testDB ends');
        return testResult;
     }  
};

console.log(process.env);

if (await testDB()) {
    console.log('👌 Sucsess: Database is working.');
} else {
    console.log('🚩 FAIL: Database is _not_ working.');
};

