import {Router} from 'express';
import {queryDB} from '../../database/db.mjs';
import * as wp from "./../webpage.mjs"; 
import logger from "./../logger.mjs";

const router = Router();

router.get('/c/', async (request, response) => {
    const qData = await getMediaList();
    const webPageData = {'rows': qData.rows};
    response.render('concerts.ejs', {webPageData: webPageData});
});

router.get('/c/:concertUri/', async (request, response) => {
    const concertUri = request.params.concertUri;
    response.render('concert.ejs', 
      {webPageData: await prepareConcertPageByUri(concertUri)});
});

// single concert page by uri

async function prepareConcertPageByUri(concertUri) {
  var pageData = await wp.createCleanWebpage();
  const concertInfo = await getConcertInfoByUriFromDB(concertUri);
  const mediaSourcesInfo = await getMediaSourcesByConcertIDFromDB(concertInfo.id);
  const collaborators = await getCollaboratorsByConcertIDFromDB(concertInfo.id);
  pageData.breadCrumbs = [
      wp.breadCrumbs.home,
      wp.breadCrumbs.concerts
  ];
  pageData.content = {}
  pageData.content.mediaSources = mediaSourcesInfo;
  pageData.content.collaborators = collaborators;
  pageData.title = concertInfo.title;
  pageData.concertInfo = concertInfo;
  pageData.showJSON = true;
  return pageData;
};

async function getConcertInfoByUriFromDB(concertUri) {
  const query = {
      text: `SELECT
      *
      FROM media m
      where m.uri = $1`,
      values: [concertUri]
  }
  const result = await queryDB(query);
  return result.rows[0];
}

async function getMediaSourcesByConcertIDFromDB(concertID) {
  logger.debug('getMediaSourcesByConcertIDFromDB: concertID = ' + concertID);
  const query = {
      text: `SELECT
      ms.web_link,
      ms.release_date,
      p.title
      FROM media_sources ms
      JOIN paywalls p
      ON ms.paywall_id = p.id
      WHERE ms.media_id = $1`,
      values: [concertID]
  };
  const result = await queryDB(query);
  return result.rows;
}

async function getCollaboratorsByConcertIDFromDB(concertID) {
  logger.debug('getCollaboratorsByConcertIDFromDB: concertID = ' + concertID);
  const query = {
      text: `SELECT
      r.title as role_title,
      p.person_name,
      p.uri
      FROM media m
      JOIN collaborators c
      ON m.id = c.media_id
      JOIN roles r
      ON c.role_id = r.id
      JOIN persons p
      ON c.person_id = p.id
      WHERE m.id = $1`,
      values: [concertID]
  };
  const result = await queryDB(query);
  return result.rows;
}


async function getMediaListDB() {
    const query = {
      text: `SELECT m.id, m.title, m.uri, p.person_name
    FROM media m
    JOIN collaborators c
    ON m.id = c.media_id
    AND c.role_id = 1
    JOIN persons p
    ON c.person_id = p.id
    ORDER BY title;`
    } 
    const res = await queryDB(query);
    return res
  }
  
async function getMediaList() {
    const result = await getMediaListDB();
    return result
}

export default router;