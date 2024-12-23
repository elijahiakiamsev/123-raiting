import passport from 'passport';
import {Strategy} from 'passport-local';
import { getDB, queryDB } from '../../database/db.mjs';

async function getUsers() { 
    const userQuery = queryDB('SELECT * FROM users;');
    console.log(userQuery);
    const userList = await userQuery.rows;
};

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {

    done(null, id);
})

export default passport.use(
    new Strategy((username, password, done) => {
        console.log('Username:' + username);
        console.log('Password:' + password);
        try {
            const findUser = userList.find((user) => user.username === username);
            if (!findUser) throw new error('User not found');
            if (findUser.password != password) throw new error('Invalid credentials');
            done(null, findUser.id)
        } catch(err) {
            done(err, null);
        };
        done(null, user)
    })
)

// const userList = await getUsers();