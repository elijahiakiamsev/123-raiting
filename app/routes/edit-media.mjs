import express from 'express';
import {queryDB,
  getPersonsListDB,
  getPaywallsListDB,
  getMediaByIDDB,
  deleteCollabBD,
  addCollabBD} from '../../database/db.mjs';
import logger from "./../logger.mjs";
import multer from 'multer';
import isLogged from './../middleware/checkauth.mjs'
const upload = multer();

const router = express.Router();

router.get('/editor/media/', isLogged, async (request, response) => {
    const qData = await getMediaList();
    const webPageData = {'rows': qData.rows};
//    webPageData['person_name'] = await getPersonName(name_uri);
    if (!webPageData || webPageData == {}) {
      response.status(404).send('404 - no that page');
      return;
    }
    response.render('editor/media.ejs', {webPageData: webPageData});
})

router.get('/editor/media/add', isLogged, async (request, response) => {
  const persons = await getPersonsListDB();
  const paywalls = await getPaywallsListDB();
  const webPageData = {
    "persons": persons.rows,
    "paywalls": paywalls.rows
  };
 response.render('editor/media-add.ejs', {webPageData: webPageData});
});

router.get('/editor/media/:id', isLogged, async (request, response) => {
    var media = await getMediaByIDDB(request.params.id);
    var persons = await getPersonsListDB();
    var paywalls = await getPaywallsListDB();
    var webPageData = { "persons": persons.rows, 
                        "paywalls": paywalls.rows,
                        "media": media.rows
                      };
    response.render('editor/media-edit.ejs', {webPageData: webPageData});
})

router.post('/editor/media/:id', isLogged, upload.none(), async (request, response) => {
  var dataToUpdate = await prepareMediaToStore(request.body, Number(request.params.id));
  await updateMediaInStore(dataToUpdate, Number(request.params.id));
  var webPageData = dataToUpdate;
 response.render('editor/media-posted.ejs', {webPageData: webPageData});
});

router.post('/editor/media/', isLogged, upload.none(), async (request, response) => {
    var dataToStore = await prepareMediaToStore(request.body);
    await saveMediaToStore(dataToStore);
    var webPageData = dataToStore;
    response.render('editor/media-posted.ejs', {webPageData: webPageData});
});


 router.get('/editor/media/:id/delete', isLogged, upload.none(), async (request, response) => {
  const id = request.params.id;
  await deleteMedia(id);
 response.redirect('/editor/media/');
});

async function deleteMedia(id) {
  const query = {
    text: `DELETE FROM media_sources WHERE media_id = ${id};
    DELETE FROM collaborators WHERE media_id = ${id};
    DELETE FROM media where id = ${id};`,
  }
  await queryDB(query); 
}

async function updateMediaInStore(mediaToUpdate, id) {
  if (!id) {
    logger.error('updateMediaInStore: no id');
    return null;
  };
  const mediaInDB = await getMediaByIDDB(id);
  const mediaNow = mediaInDB.rows[0];
  mediaToUpdate.sources[0]['id'] = mediaNow.source_id;
  if ( mediaNow.title != mediaToUpdate.title
        || mediaNow.uri != mediaToUpdate.uri ) {
    const query = {
    text: `UPDATE media
    SET title=$1, uri = $2
    WHERE id = $3;`,
    values: [mediaToUpdate.title,
              mediaToUpdate.uri,
              id]
    }
    await queryDB(query);
    logger.debug('updateMediaInStore - main media parameters changed');    
  };
  // check source change
  if ( mediaNow.web_link != mediaToUpdate.sources[0].url ||
        mediaNow.release_date == null || mediaNow.release_date.toLocaleDateString('en-CA') != mediaToUpdate.sources[0].release_date) {
    const query = {
      text: `UPDATE media_sources
      SET web_link=$1, paywall_id = $2, release_date = $3
      WHERE id = $4;`,
      values: [mediaToUpdate.sources[0].url,
              mediaToUpdate.sources[0].paywall_id,
              mediaToUpdate.sources[0].release_date,
              mediaToUpdate.sources[0].id]
      }
      console.log(mediaToUpdate.title);
      console.log(mediaToUpdate.uri);
      await queryDB(query);
    logger.debug('updateMediaInStore - source changed');
  };
  // check collab person and media
  if ( mediaNow.person_id != mediaToUpdate.persons[0].person_id ) {
    await deleteCollabBD(mediaNow.person_id, 1, id);
    await addCollabBD(mediaToUpdate.persons[0].person_id, 1,
                      mediaToUpdate.sources[0].id);
    mediaNow.person_id = mediaToUpdate.persons[0].person_id;
    logger.debug('updateMediaInStore - collab changed');
  };
  return null;
}

async function saveMediaToStore(mediaToStore) {
  var title = mediaToStore.title;
  var uri = mediaToStore.uri;
  var person_id = mediaToStore.persons[0].person_id;
  var url = mediaToStore.sources[0].url;
  var release_date = mediaToStore.sources[0].release_date;
  var paywall_id = mediaToStore.sources[0].paywall_id;
  const query = {
    text: `INSERT INTO media (title, uri)
    VALUES ('${title}', '${uri}');
    INSERT INTO collaborators (media_id, person_id, role_id)
    VALUES (currval(pg_get_serial_sequence('media','id')), ${person_id}, 1);
    INSERT INTO media_sources (media_id, web_link, release_date ,paywall_id)
    VALUES (currval(pg_get_serial_sequence('media','id')),
    '${url}', '${release_date}', ${paywall_id});`,
  }
  await queryDB(query);
};

async function prepareMediaToStore(reqBody, id) {
  if (!id) {id = null};
  console.log(reqBody);
  var result = {
    "id": id,
    "title": reqBody.title,
    "uri": reqBody.uri,
    "sources":[{
      "url": reqBody.url, 
      "paywall_id": Number(reqBody.paywall),
      "release_date": reqBody.release_date
    }],
    "persons": [{
      "person_id": Number(reqBody.person)
    }]
  };
  return result
};

async function getMediaListDB() {
  const query = {
    text: `SELECT media.id, title, person_name
FROM media
JOIN collaborators
ON media.id = collaborators.media_id
AND collaborators.role_id = 1
JOIN persons
ON collaborators.person_id = persons.id
ORDER BY id DESC;`
  } 
  const res = await queryDB(query);
  return res
}

async function getMediaList() {
  const result = await getMediaListDB();
  return result
}

export default router;