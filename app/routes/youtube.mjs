import {Router} from 'express';
import {queryDB} from '../../database/db.mjs';
import logger from "./../logger.mjs";

const router = Router();

async function getYoutubeRaitingFromDB() {
  const query = {
      text: `SELECT media_id, views_count, title, web_link, person_name, delta
              FROM media_sources 
              JOIN last_scan_data
              ON last_scan_data.media_source_id = media_sources.id
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

async function getYoutubeTrendingNowFromDB() {
  const query = {
      text: `SELECT media_id, views_count, title, web_link, person_name, delta
              FROM media_sources 
              JOIN last_scan_data l
              ON l.media_source_id = media_sources.id
              AND l.delta > 0
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
              ORDER BY delta DESC
              LIMIT 20;`
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
    text:'SELECT max(scan_date) FROM last_scan_data;'
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

async function getYoutubeTrendingNow() {
  const result = await getYoutubeTrendingNowFromDB();
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

router.get('/youtube/now', async (request, response) => {
  var webPageData = {};
  const youtubeTrend = await getYoutubeTrendingNow();
  const lastScanDate = await getYoutybeScanDate()
  webPageData = {
    'lastScanDate': lastScanDate,
    'youtubeRaiting': youtubeTrend
  }
  if (!webPageData || webPageData == {}) {
    response.status(404).send('404 - no that page');
    return;
  }
  logger.debug('Youtube raiting delivered');
  response.render('youtube-now.ejs', {webPageData: webPageData});
})

export default router;