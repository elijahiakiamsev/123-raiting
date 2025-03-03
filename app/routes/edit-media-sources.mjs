import express from 'express';
import {queryDB} from '../../database/db.mjs';
import multer from 'multer';
import logger from "./../logger.mjs";
import isLogged from './../middleware/checkauth.mjs'

const upload = multer();

const router = express.Router();

router.get('/editor/media-sources/', isLogged, async (request, response) => {
    response.render('editor/media-sources-edit.ejs', {webPageData: await prepareIndexPageData()});
})

async function prepareIndexPageData() {
  var pageData = await prepareCleanWebpageData();
  const mediaSourcesList = await getFullMediaSourcesList();
  pageData.title = "Редактирование источников медиа";
  pageData.pageMenu = [
    {
      itemName : "назад в редактор",
      itemUrl : "/editor/"
    },
    {
      itemName : "+ добавить источник медиа",
      itemUrl : "add/"
    }
  ];
  pageData.content = {};
  pageData.content.sourcesList = mediaSourcesList;
  return pageData;
}

async function getFullMediaSourcesList() {
  const result = await getfullMediaSourcesListDB();
  return result.rows;
}

async function getfullMediaSourcesListDB () {
  const queryList = {
    text: `SELECT ms.id,
    ms.media_id,
    ms.web_link,
    ms.paywall_id,
    ms.release_date,
    p.title as paywall_title,
    m.title,
    m.uri,
    ps.person_name,
    ps.uri as person_uri
    FROM media_sources ms
    JOIN paywalls p
    ON ms.paywall_id = p.id
    JOIN media m
    ON ms.media_id = m.id
    JOIN collaborators c
    ON ms.media_id = c.media_id
    AND c.role_id = 1
    JOIN persons ps
    ON c.person_id = ps.id;`
  }
  const result = await queryDB(queryList);
  return result;
}

async function prepareCleanWebpageData() {
  const webPageData = {
    title: null,
    internalMessage: null,
    showJSON: false,
    pageMenu: null,
    content: null
  };
  return webPageData;
};

export default router;