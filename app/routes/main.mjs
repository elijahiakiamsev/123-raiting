import Router from 'express';

const router = Router();

router.get('/', function(req, res, next) {
  res.render('index.ejs');
});

export default router;