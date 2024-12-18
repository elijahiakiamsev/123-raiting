import express from 'express';

export var indexRouter = express.Router();

indexRouter.get('/', function(req, res, next) {
  res.render('index.ejs');
});