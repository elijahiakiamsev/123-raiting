
const path = require('path');
require('dotenv').config({
    override: true,
    path: path.join(__dirname, 'development.env')
});

console.log(path.join(__dirname,'development.env'));

console.log(process.env.USER);
console.log(process.env.HOST);
console.log(process.env.DATABASE);
console.log(process.env.USER);
console.log(process.env.PASSWORD);

const {Pool, Client} = require('pg');

const pool = new Pool({
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    database: process.env.DATABASE,
    port: process.env.PORT
});

(async () => {
    const client = await pool.connect();
    try {
        const {rows} = await client.query('SELECT current_user');
        const currentUser = rows[0]['current_user'];
        console.log(currentUser);
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
    }
})();