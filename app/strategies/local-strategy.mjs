import passport from 'passport';
import {Strategy} from 'passport-local';

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    done(null, id);
})

export default passport.use(
    new Strategy((username, password, done) => {
        var user = ilia;
        done(null, user)
    })
)