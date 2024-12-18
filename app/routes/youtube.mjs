import express from 'express';
import {queryDB} from '../../database/db.mjs';
import {logger} from "./../logger.mjs";

export var youtubeRouter = express.Router();

async function getYoutubeRaitingFromDB() {
  const query = {
      text: `SELECT media_id, views_count, title, person_name
              FROM media_sources 
              JOIN (
                  SELECT 
                  media_source_id, 
                  scan_date, 
                  views_count,
                  ROW_NUMBER() OVER (PARTITION BY media_source_id ORDER BY scan_date DESC) AS row_num
                  FROM views
                  ) RankedMedia
              ON RankedMedia.media_source_id = media_sources.id AND RankedMedia.row_num = 1
              JOIN media
              ON media_sources.media_id = media.id
              JOIN
                  (
                  SELECT media_id as m_id, person_id
                  FROM collaborators
                  WHERE collaborators.role_id = 1
                  ) AS comedians
              ON comedians.m_id = media_id
              JOIN persons
              ON persons.id = person_id
              ORDER BY views_count DESC;`
  } 
  const res = await queryDB(query);
  return res;
}

async function getYoutubeRaiting() {
  const result = await getYoutubeRaitingFromDB();
  if (!result) {
    logger.error('Validation: the delivered result is empty.');
    return false;
  }
  return result.rows;
}

youtubeRouter.get('/youtube/', async (request, response) => {
    var webPageData = {};
    webPageData = await getYoutubeRaiting();
//    webPageData['person_name'] = await getPersonName(name_uri);
    if (!webPageData || webPageData == {}) {
      response.status(404).send('404 - no that page');
      return;
    }
    logger.debug('Youtube raiting delivered');
    response.render('youtube.ejs', {webPageData: webPageData});
})

