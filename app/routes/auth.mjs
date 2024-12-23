import Router from 'express';
import passport from 'passport';

const router = Router();

router.post('/auth/', passport.authenticate('local'), (request, response) => {
  response.sendStatus(200);
});

router.get('/auth/', (request, response) => {
    response.render('auth.ejs');
});

router.get('/auth/status/', (request, response) => {
    return request.user ? response.send(request.user) : response.sendStatus(401);
})

router.get('/auth/logout/', (request, response) => {
  response.render('logout.ejs');
})

router.post('/auth/logout/', (request, response) => {
  if (!request.user) return response.sendStatus(401);
  request.logout((error) => {
    if (error) return response.sendStatus(400);
    response.sendStatus(200);
  });
})

export default router;