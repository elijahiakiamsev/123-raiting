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
    var webPageData = await prepareIndexPageData();
    webPageData.showJSON = true;
    response.render('editor/media-sources-edit.ejs', {webPageData: webPageData});
})

async function prepareIndexPageData() {
  var pageData = await prepareCleanWebpageData();
  pageData.title = "Редактирование источников медиа";
  return pageData;
}

async function getFullMediaSourcesList() {
  const result = getfullMediaSourcesListDB();
  return result.rows;
}

async function getfullMediaSourcesListDB () {
  const result = "";
  return result;
}

async function prepareCleanWebpageData() {
  const webPageData = {
    title: false,
    internalMessage: false,
    showJSON: false,
    pageMenu: false,
    content: false
  };
  return webPageData;
};

export default router;