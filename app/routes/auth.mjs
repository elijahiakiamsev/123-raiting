import Router from 'express';
import passport from 'passport';

const router = Router();

router.auth('/auth/',
            passport.authenticate(local),
            function(req, res, next) {
  res.render('auth.ejs');
});

export default router;