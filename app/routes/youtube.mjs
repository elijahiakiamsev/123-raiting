import {Router} from 'express';
import {queryDB} from '../../database/db.mjs';
import logger from "./../logger.mjs";

const router = Router();

async function getYoutubeRaitingFromDB() {
  const query = {
      text: `SELECT media_id, views_count, title, web_link, person_name
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
  const result = await queryDB(query);
  return result;
}

async function getYoutybeScanDate() {
  const dataFromDB = await getYoutybeScanDateDB();
  const result = dataFromDB.rows[0].max;
  return result;
};

async function getYoutybeScanDateDB() {
  const query = {
    text:'SELECT max(scan_date) FROM views;'
  }
  const result = await queryDB(query);
  return result;
};


async function getYoutubeRaiting() {
  const result = await getYoutubeRaitingFromDB();
  if (!result) {
    logger.error('Validation: the delivered result is empty.');
    return false;
  };
  return result.rows;
};

router.get('/youtube/', async (request, response) => {
    var webPageData = {};
    const youtubeRaiting = await getYoutubeRaiting();
    const lastScanDate = await getYoutybeScanDate()
    webPageData = {
      'lastScanDate': lastScanDate,
      'youtubeRaiting': youtubeRaiting
    }
    if (!webPageData || webPageData == {}) {
      response.status(404).send('404 - no that page');
      return;
    }
    logger.debug('Youtube raiting delivered');
    response.render('youtube.ejs', {webPageData: webPageData});
})

export default router;