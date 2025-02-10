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

router.get('/editor/paywalls/', isLogged, async (request, response) => {
    const qPaywalls = await getPaywallsList();
    const webPageData = {
      title : "Пейволлы",
      internalMessage: null,
      paywalls : qPaywalls
    };
    response.render('editor/paywalls.ejs', {webPageData: webPageData});
})

router.get('/editor/paywalls/add', isLogged, async (request, response) => {
  const webPageData = {
    title : "Добавить пейволл",
    internalMessage: null,
  };
  response.render('editor/paywall-add.ejs', {webPageData: webPageData});
})

router.post('/editor/paywalls/', isLogged, upload.none(), async (request, response) => {
  const dataToStore = await preparePaywallToStore(request.body);
  const storedPaywall = await storePaywall(dataToStore);
  const webPageData = {
    title : "Пейволл добавлен",
    internalMessage: {
      text: `Пейволл добавлен: ${storedPaywall.id} - ${storedPaywall.title} - ${storedPaywall.uri}`,
      type: "info"
    },
    showJSON: false,
    paywallData: storedPaywall
  };
  response.render('editor/paywall-posted.ejs', {webPageData: webPageData});
});

router.get('/editor/paywalls/:id/delete', isLogged, upload.none(), async (request, response) => {
  const id = request.params.id;
  await deletePaywall(id);
  response.redirect('/editor/paywalls/');
});

async function getPaywallsList() {
  var result = await getPaywallsListDB();
  return result.rows;
}

async function preparePaywallToStore(reqBody, id) {
  if (!id) {id = null};
  console.log(reqBody);
  const result = {
    id : id,
    paywall: reqBody.paywall,
    uri: reqBody.uri
  };
  return result
};

async function storePaywall(paywallToStore) {
  const p = paywallToStore;
  const title = p.paywall;
  const uri = p.uri;
  const queryStore = {
    text: `INSERT INTO paywalls (title, uri)
    VALUES ($1, $2)
    RETURNING *;`,
    values: [title, uri]
  }
  const result = await queryDB(queryStore);
  return result.rows[0];
};

async function deletePaywall(id) {
  const query = {
    text: `UPDATE media_sources SET paywall_id = 0 WHERE paywall_id = ${id};
    DELETE FROM paywalls WHERE id = ${id} RETURNING *;`,
  }
  await queryDB(query); 
}

export default router;