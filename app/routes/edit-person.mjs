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

router.post('/editor/persons/:id/delete', isLogged, upload.none(), async (request, response) => {
    const id = Number(request.params.id);
    logger.debug(`😀/editor/persons/${id}/deleting...`);
    await Page.deletePerson(id);
    logger.debug(`😀/editor/persons/${id}/deleted, redirecting to persons page...`);
    response.redirect('/editor/persons/');
});

router.post('/editor/persons/add', isLogged, upload.none(), async (request, response) => {
    logger.debug(`😀/editor/persons/add POST adding a person is rendering...`);
    response.render('editor/person.ejs', 
      {webPageData: await Page.preparePersonHasAdded(request.body)});
    logger.debug(`😀/editor/persons/add POST adding a person has rendered.`);
});

/*

router.post('/editor/persons/:id', isLogged, upload.none(), async (request, response) => {
  var dataToUpdate = await preparePersonToStore(request.body, Number(request.params.id));
  await updateMediaInStore(dataToUpdate, Number(request.params.id));
  var webPageData = dataToUpdate;
 response.render('editor/person-posted.ejs', {webPageData: webPageData});
});

router.post('/editor/persons/', isLogged, upload.none(), async (request, response) => {
    var dataToStore = await preparePersonToStore(request.body);
    await savePersonToStore(dataToStore);
    var webPageData = dataToStore;
    response.render('editor/person-posted.ejs', {webPageData: webPageData});
});

router.get('/editor/persons/:id/delete', isLogged, upload.none(), async (request, response) => {
  const id = request.params.id;
  await deletePerson(id);
 response.redirect('/editor/persons/');
});

async function preparePersonToStore(reqBody, id) {
  if (!id) id = null;
  if (!reqBody.self_identity) reqBody.self_identity = 'he/him';
  console.log(reqBody);
  var result = {
    "id": id,
    "person_name": reqBody.person_name,
    "uri": reqBody.uri,
    "self_identity": reqBody.self_identity
  };
  return result
};

async function savePersonToStore(personToStore) {
  const person_name = personToStore.person_name;
  const uri = personToStore.uri;
  const self_identity = personToStore.self_identity;
  const query = {
    text: `INSERT INTO persons (person_name, uri, self_identity)
    VALUES ($1, $2, $3);`,
    values: [person_name, uri, self_identity]
  }
  await queryDB(query);
};

async function deletePerson(id) {
  const query = {
    text: `DELETE FROM collaborators WHERE person_id = ${id};
    DELETE FROM persons where id = ${id};`,
  }
  await queryDB(query); 
}

async function getPersonDB(id) {
  const query = {
    text: `SELECT * FROM persons WHERE id = $1;`,
    values: [id]
  }
  const result = await queryDB(query);
  return result;
}

async function getCollabFullDataDB(person_id) {
  console.log(person_id)
  const query = {
    text: `SELECT collaborators.person_id, collaborators.role_id,
    collaborators.media_id, media.title
    FROM collaborators
    JOIN media
    ON media.id = collaborators.media_id
    WHERE collaborators.person_id = $1`,
    values: [person_id]
  }
  const result = await queryDB(query);
  if (result.rows.length == 0) return null;
  return result; 
}

/*


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
*/

export default router;
