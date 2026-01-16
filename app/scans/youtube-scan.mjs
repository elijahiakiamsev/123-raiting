import {queryDB} from '../../database/db.mjs';
import logger from "./../logger.mjs";
import fetch from 'node-fetch';

async function youtubeUrlParser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    var result = (match&&match[7].length==11)? match[7] : false;
    if (!result) {logger.error('Parser wrong for url ${url}')};
    return result;
}

// get the list of videos from base (uri's)
async function getYoutubeStatUriListDB(offset, limit) {
    logger.silly(`Getting URL's from db. Offset: ${offset}, limit: ${limit}.`)
    const query = {
        text: `SELECT media_sources.id, media_sources.web_link
        FROM media_sources
        WHERE paywall_id = 1
        OFFSET $1
        LIMIT $2;`,
        values: [offset, limit]
    }
    const res = await queryDB(query);
    logger.silly(`Got URL's from db. Sample: ${res.rows[0]}.`)
    return res;
};

// read the whole list on fetch
function createUrl(videoUrl) {
    logger.silly('Creating Youtube URL...');
    const youtubeFixedURI = 'https://youtube.googleapis.com/youtube/v3/videos?part=statistics,status&id=';
    const youtubeApiKey = process.env.YOUTUBEKEY;
    const url = youtubeFixedURI
                + videoUrl
                + '&key='
                + youtubeApiKey;
    logger.silly(`Youtube URL created: ${url.slice(68, 90)}`);
    return url;
};

async function getVideoStats(videoUri) {
    logger.silly('Getting video stats from Youtube...');
    const videoUrl = createUrl(videoUri);
    const response = await fetch(videoUrl, {
        headers: {
            "Accept": "application/json"
        }
    });
    const body = await response.json();
    const result = body.items;
    logger.silly('Recieved video stats from Youtube.');
    return result;
    };

async function getVideoListStats(videoList) {
    logger.silly('Getting stats from Youtube from one videolist.')
    var videoUri = '';
    for (var i=0; i < videoList.length; i++) {
        videoList[i].videoID = await youtubeUrlParser(videoList[i].web_link);
        videoUri = videoUri.concat(videoList[i].videoID, ',');
    }
    videoUri = videoUri.slice(0, -1);
    var statsPack = await getVideoStats(videoUri);
    if (!statsPack) {
        logger.error('No answer from Youtube');
        return null;
    }
    if (statsPack.length != videoList.length) {
        logger.debug(`Recieved less items than sended, ${videoList.length - statsPack.length} items.`);
    };
    var result = [];
    for (var c = 0; c < videoList.length; c++){
        var count = -1;
        var oneStat = statsPack.find(element => videoList[c].videoID === element.id);
        if (oneStat) { count = oneStat.statistics.viewCount }
        else {
            logger.debug(`Missing information for ${videoList[c].web_link},
                media_source_id ${videoList[c].id}`);
        };
        result.push({'media_id':videoList[c].id,'views': count})
    };
    logger.debug(`Recieved and compiled from Youtube ${result.length}/${videoList.length} items.`)
    return result;
};

// save new data to base
export async function storeScanvideoUris(listOfStatistics) {
    logger.silly(`Storing scan video URI's...`);
    const query = {
        text: `INSERT INTO views (media_source_id, scan_date, views_count)
                SELECT counters.media_id, CURRENT_TIMESTAMP, counters.views
                FROM json_to_recordset($1)
                AS counters (media_id INTEGER, views INTEGER);`,
        values: [JSON.stringify(listOfStatistics)]
    }
    logger.silly(`Scan video URI's stored.`);
    await queryDB(query);
}

async function getYoutubeVideoCountDB() {
    logger.silly(`Getting the full count of media sources on Youtube...`)
    const query = {
        text: 'SELECT COUNT(*) FROM media_sources WHERE paywall_id =1;'
    }
    const result = await queryDB(query);
    logger.silly(`Full count of media sources on Youtube: ${result.rows[0].count}.`)
    return result.rows[0].count;
}

export async function getYoutubeStatsByPages() {
    logger.silly(`Getting youtube stats for the whole Youtube pack....`)
    const videosCount = await getYoutubeVideoCountDB();
    const itemsOnQuery = 49;
    const pagesCount = Math.floor(Number(videosCount)/itemsOnQuery) + 1;
    logger.debug(`${videosCount} videos, ${pagesCount} pages to get stats.`)
    var fullStats = [];
    for (var i=0; i < pagesCount; i++) {
        var videoList = await getYoutubeStatUriListDB(i*itemsOnQuery, itemsOnQuery);
        var readyStats = await getVideoListStats(videoList.rows);
        fullStats.push(...readyStats);
    }
    logger.silly(`Full pack recieved, length: ${fullStats.length}.`)
    return fullStats;
}

export async function recalculateDeltas() {
    logger.silly(`Recalculating youtube deltas started...`);
    const query = {
        text: `DROP TABLE last_scan_data;
SELECT 
    v.media_source_id, 
    ms.release_date,
    v.scan_date, 
    v.views_count,
    CASE
        WHEN ms.release_date > (v.scan_date - INTERVAL '1 day')
        THEN v.views_count
        ELSE v.views_count - ps.views_count
    END 
    AS delta,
    ps.scan_date AS previous_scan_date,
    ps.views_count AS previous_scan_views_count
INTO last_scan_data
FROM (SELECT 
    media_source_id, 
    scan_date, 
    views_count,
    ROW_NUMBER() OVER (PARTITION BY media_source_id ORDER BY scan_date DESC) AS row_num
    FROM views
    ) v
JOIN (
    SELECT
    id,
    release_date,
    1 AS row_to_keep
    FROM media_sources
) ms
ON v.row_num = ms.row_to_keep AND v.media_source_id = ms.id
LEFT JOIN (
    SELECT 
    media_source_id,
    scan_date,
    views_count,
    ROW_NUMBER() OVER (PARTITION BY media_source_id ORDER BY scan_date DESC) AS row_num1
    FROM views
    WHERE views.scan_date <= (SELECT max((scan_date) - INTERVAL '1 day') FROM views)
) ps
ON ps.media_source_id = v.media_source_id
AND ps.row_num1 = 1;`
    };
    const result = await queryDB(query);
    logger.silly(`Recalculating youtube deltas done.`);
    return result;
}
