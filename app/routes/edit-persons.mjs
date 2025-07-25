import express from 'express';
import isLogged from './../middleware/checkauth.mjs';
import logger from './../logger.mjs';
import * as Page from './../renders/edit-persons-render.mjs';

const router = express.Router();

router.get('/editor/persons/', isLogged, async (request, response) => {
    logger.silly(`😀/editor/persons/ rendering...`);
    response.render('editor/persons.ejs',
      {webPageData: await Page.preparePersonsList()});
    logger.silly(`😀/editor/persons/ rendering end`);
});

export default router;
