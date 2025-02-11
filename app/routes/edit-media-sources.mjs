import express from 'express';
import {queryDB,
  getPersonsListDB,
  getPaywallsListDB,
  getMediaByIDDB,
  deleteCollabBD,
  addCollabBD} from '../../database/db.mjs';
import multer from 'multer';
import logger from "./../logger.mjs";
import isLogged from './../middleware/checkauth.mjs'

const upload = multer();

const router = express.Router();

router.get('/editor/media-sources/', isLogged, async (request, response) => {
    const mediaSources = await getMediaSourcesList();
    const webPageData = {
      title : "Источники медиа",
      internalMessage: null,
      mediaSources : mediaSources
    };
    response.render('editor/media-sources.ejs', {webPageData: webPageData});
})

export default router;