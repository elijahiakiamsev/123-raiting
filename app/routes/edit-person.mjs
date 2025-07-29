import express from 'express';
import multer from 'multer';
import logger from './../logger.mjs';
import isLogged from './../middleware/checkauth.mjs'
import * as Page from "./../renders/edit-person-render.mjs"

const upload = multer();

const router = express.Router();

router.get('/editor/persons/add', isLogged, async (request, response) => {
    logger.debug("😀/editor/persons/add is rendering...");
    response.render('editor/person.ejs', 
      {webPageData: await Page.preparePersonAdd()});
    logger.debug("😀/editor/persons/add has rendered...");
});

router.get('/editor/persons/:id', isLogged, async (request, response) => {
    logger.debug(`😀/editor/persons/${Number(request.params.id)} rendering...`);
    if (isNaN(Number(request.params.id))) {
        logger.error(`:id is not a Number, returning to list of persons.`);
    };
    response.render('editor/person.ejs', 
      {webPageData: await Page.preparePersonEdit(Number(request.params.id))});
    logger.debug(`😀/editor/persons/${Number(request.params.id)} rendering end`);
});

router.post('/editor/persons/:id', isLogged, upload.none(), async (request, response) => {
    const id = Number(request.params.id);
    logger.debug(`😀/editor/persons/${id}/ is updating...`);
    await Page.updatePerson(id, request.body);
    logger.debug(`😀/editor/persons/${id}/ updated, redirecting to persons page...`);
    response.redirect(`/editor/persons/${id}`);
});

router.post('/editor/persons/:id/delete', isLogged, upload.none(), async (request, response) => {
    const id = Number(request.params.id);
    logger.debug(`😀/editor/persons/${id}/deleting...`);
    await Page.deletePerson(id);
    logger.debug(`😀/editor/persons/${id}/deleted, redirecting to persons page...`);
    response.redirect(`/editor/persons/`);
});

router.post('/editor/persons/add', isLogged, upload.none(), async (request, response) => {
    logger.debug(`😀/editor/persons/add POST adding a person is rendering...`);
    response.render('editor/person.ejs', 
      {webPageData: await Page.preparePersonHasAdded(request.body)});
    logger.debug(`😀/editor/persons/add POST adding a person has rendered.`);
});

export default router;
