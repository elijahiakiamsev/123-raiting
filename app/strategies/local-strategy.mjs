import passport from 'passport';
import {Strategy} from 'passport-local';
import { getDB, queryDB } from '../../database/db.mjs';
import { error } from 'console';

async function getUserByName(username) { 
    const query = {
        text: 'SELECT * FROM users WHERE username = $1;',
        values: [username]
    }
    const user = await queryDB(query);
    const result = user.rows;
    if (result.length == 0) return null;
    return result;
};

async function getUserByidhash(idhash) { 
    const query = {
        text: 'SELECT * FROM users WHERE idhash = $1;',
        values: [idhash]
    }
    const user = await queryDB(query);
    const result = user.rows;
    if (result.length == 0) return null;
    return result;
};

passport.serializeUser((user, done) => {
    done(null, user.idhash);
});

passport.deserializeUser(async (idhash, done) => {
    try {
        const findUser = await getUserByidhash(idhash);
        if (findUser == null) throw error('No user with idhash ' +idhash);
        done(null, findUser[0]);
    } catch (error) {
        done(error, null)
    }
})

export default passport.use(
    new Strategy(async (username, password, done) => {
        try {
            const findUser = await getUserByName(username);
            if (findUser == null) throw error('No user with username ' +username);
            if (findUser[0].password != password) throw error('Wrong password for ' +username);
            done(null, findUser[0])
        } catch(err) {
            done(err, null);
        };
    })
)