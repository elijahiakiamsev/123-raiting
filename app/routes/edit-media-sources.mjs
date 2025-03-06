import express from 'express';
import {queryDB} from '../../database/db.mjs';
import multer from 'multer';
import logger from "./../logger.mjs";
import isLogged from './../middleware/checkauth.mjs'

const upload = multer();

const router = express.Router();

router.get('/editor/media-sources/', isLogged, async (request, response) => {
    response.render('editor/media-sources-edit.ejs', 
      {webPageData: await prepareIndexPageData()});
})

router.get('/editor/media-sources/:id/', isLogged, async (request, response) => {
  response.render('editor/media-sources-edit.ejs',
    {webPageData: await prepareMediaSourceEditPageByID(Number(request.params.id))});
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

async function prepareMediaSourceEditPageByID(id) {
  if (!id) {
    logger.error("prepareMediaSourceEditPageByID: no id sended");
    return null;
  }
  if (typeof id !== "number") {
    logger.error("prepareMediaSourceEditPageByID: id is not a number");
    return null;
  }
  var pageData = await prepareMediaSourceEditPage();
  const msData = await getMediaSourceByID(id);
  var ms = msData.rows[0];
  pageData.title = ms.title + " - источник медиа";
  return pageData;
}

async function getMediaSourceByID(id) {
  const query = {
    text: `SELECT ms.id,
    ms.media_id,
    ms.web_link,
    ms.release_date,
    ms.paywall_id,
    m.title
    FROM media_sources ms
    JOIN media m
    ON m.id = ms.media_id
    WHERE ms.id = $1;`,
    values: [id]
  }
  const result = await queryDB(query);
  return result;
}

async function prepareMediaSourceEditPage() {
  var pageData = {};
  pageData.title = "Add mediasource";
  pageData.content = {};
  pageData.showJSON = true;
  pageData.content.itemForm = {
    formName: "Media Source",
    action: "",
    method: "post",
    enctype: "multipart/form-data",
    fields: [
      {
        type: "select",
        fieldName: "media",
        title: "Media",
        options: await prepareMediaListTitles()
      },
      {
        type: "text",
        fieldName: "url",
        title: "URL",
        value: ""
      },
      {
        type: "date",
        fieldName: "releaseDate",
        value: "",
        title: "Release date"
      },
      {
        type: "select",
        fieldName: "paywall",
        title: "Paywall",
        options: await preparePaywallsTitles()
      },
      {
        type: "button",
        value: "submit",
        title: "Submit"
      }
    ]
  };
  return pageData;
}

async function preparePaywallsTitles() {
  const rawList = await getPaywallsFromDB();
  var result = [];
  for (var i=0; i < rawList.rows.length; i++) {
    result.push({value: rawList.rows[i].id, title: rawList.rows[i].title})
  };
  console.log(JSON.stringify(result));
  return result;
}

async function getPaywallsFromDB() {
  const query = {
    text: `SELECT id,
    title
    FROM paywalls
    ORDER BY id;`
  }
  const result = await queryDB(query);
  return result;
}

async function prepareMediaListTitles() {
  const rawList = await getMediaListTitlesFromDB();
  var result = [];
  for (var i=0; i < rawList.rows.length; i++) {
    result.push({value: rawList.rows[i].id, title: rawList.rows[i].title})
  };
  console.log(JSON.stringify(result));
  return result;
}

async function getMediaListTitlesFromDB() {
  const query = {
    text: `SELECT id,
    title
    FROM media
    ORDER BY title;`
  }
  const result = await queryDB(query);
  return result;
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
    ON c.person_id = ps.id
    ORDER BY ms.media_id;`
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