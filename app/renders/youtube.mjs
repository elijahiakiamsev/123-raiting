import * as wp from "./../webpage.mjs";
import logger from './../logger.mjs';
import * as db from '../../database/db.mjs';

export async function prepareYoutubeMediaRaiting(year) {
    logger.silly(`Youtube media raiting page is preparing...`);
    var pageData = wp.CleanWebpage;
    pageData.breadCrumbs = [
        wp.breadCrumbs.home,
        wp.breadCrumbs.youtube
    ];
    pageData.showJSON = false;
    pageData.content = {
        lastScanDate: await getYoutybeScanDate(),
        year: year || null,
        youtubeRaiting: await getYoutubeRaiting()
    }
    pageData.title = 'Текущиe просмотры концертов';
    logger.silly(`Youtube media raiting page has prepared.`);
    return pageData;
};

async function getYoutubeRaitingFromDB(limit, year) {
  var limit_expression = '';
  var year_expression = '';
  (!limit || limit == null) ? limit_expression = '' : limit_expression = `LIMIT ${limit}`;
  (!year || year == null) ? year_expression = '' : year_expression = `AND extract(year from ms.release_date) = ${year}`;
  const query = {
      text: `SELECT 
              media_id,
              views_count,
              title,
              extract(year from ms.release_date) AS year,
              web_link,
              concat(first_name, ' ', last_name) AS person_name,
              delta
              FROM media_sources ms
              JOIN last_scan_data
              ON last_scan_data.media_source_id = ms.id
              JOIN media
              ON ms.media_id = media.id
              JOIN
                  (
                  SELECT media_id as m_id, person_id
                  FROM collaborators
                  WHERE collaborators.role_id = 1
                  ) AS comedians
              ON comedians.m_id = media_id
              JOIN persons
              ON persons.id = person_id
              ${year_expression}
              ORDER BY views_count DESC
              ${limit_expression}
              ;`
  } 
  const result = await db.queryDB(query);
  return result;
}

async function getYoutubeTrendingNowFromDB(limit) {
  var limit_expression = '';
  (!limit || limit == null) ? limit_expression = '' : limit_expression = `LIMIT ${limit}`;
  const query = {
      text: `SELECT media_id, views_count, title, web_link, concat(first_name, ' ', last_name) AS person_name, delta,
              extract(year from media_sources.release_date) AS year
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
              ${limit_expression}
              ;`
  } 
  const result = await db.queryDB(query);
  return result;
}

async function getYoutubeConcertsByYearsFromDB(year) {
  var year_expression = '';
  !year ? year_expression = '' : year_expression = `AND year = ${year}`;
  const query = {
      text: `SELECT
extract(year from ms.release_date) AS year
, COUNT(*) AS count
FROM media_sources ms
WHERE paywall_id = 1
${year_expression}
GROUP BY year
ORDER BY year DESC
              ;`
  } 
  const result = await db.queryDB(query);
  return result;
}

async function getYoutubeTrendingComediansFromDB(limit) {
  var limit_expression = '';
  !limit ? limit_expression = '' : limit_expression = `LIMIT ${limit}`;
  const query = {
      text: `SELECT
concat(first_name, ' ', last_name) AS person_name,
SUM(l.delta) as big_delta
FROM persons p
LEFT JOIN collaborators c
ON p.id = c.person_id
AND c.role_id = 1
JOIN media m
ON c.media_id = m.id
JOIN media_sources ms
ON m.id = ms.media_id
JOIN last_scan_data l
ON ms.id = l.media_source_id
WHERE l.delta > 0
GROUP BY concat(first_name, ' ', last_name)
ORDER BY big_delta DESC
${limit_expression}
;`
  } 
  const result = await db.queryDB(query);
  return result;
}

export async function getYoutubeTrendingComedians(limit) {
  const result = await getYoutubeTrendingComediansFromDB(limit);
  if (!result) {
    logger.error('Validation: the delivered result is empty.');
    return false;
  };
  return result.rows;
};

export async function getYoutybeScanDate() {
  const dataFromDB = await getYoutybeScanDateDB();
  const result = dataFromDB.rows[0].max;
  return result;
};

async function getYoutybeScanDateDB() {
  const query = {
    text:'SELECT max(scan_date) FROM last_scan_data;'
  }
  const result = await db.queryDB(query);
  return result;
};


export async function getYoutubeRaiting(limit, year) {
  const result = await getYoutubeRaitingFromDB(limit, year);
  if (!result) {
    logger.error('Validation: the delivered result is empty.');
    return false;
  };
  return result.rows;
};

export async function getYoutubeTrendingNow(limit) {
  const result = await getYoutubeTrendingNowFromDB(limit);
  if (!result) {
    logger.error('Validation: the delivered result is empty.');
    return false;
  };
  return result.rows;
};

export async function getYoutubeConcertsByYears(year) {
  const result = await getYoutubeConcertsByYearsFromDB(year);
  if (!result) {
    logger.error('Validation: the delivered result is empty.');
    return false;
  };
  return result.rows;
};
