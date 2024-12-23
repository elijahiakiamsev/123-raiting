// getting everything about concert from youtube
import fetch from 'node-fetch';

import ignition from "./initenv.mjs"
await ignition();

import logger from "./logger.mjs";
import {queryDB, endDB} from '../database/db.mjs';
import { log } from 'node:console';

const youtubeApiKey = process.env.YOUTUBEKEY;

const youtubeFixedURI = 'https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=';

function youtubeUrlParser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

// get the list of videos from base (uri's)
async function getYoutubeStatUriListDB(offset, limit) {
    const query = {
        text: `SELECT media_sources.id, media_sources.web_link
        FROM media_sources
        WHERE paywall_id = 1
        OFFSET $1
        LIMIT $2;`,
        values: [offset, limit]
    }
    const res = await queryDB(query);
    return res;
};
// read the whole list on fetch
function createUrl(videoUrl) {
    logger.debug('***Creating Youtube URL from ' + videoUrl);
    const url = youtubeFixedURI
                + videoUrl
                + '&key='
                + youtubeApiKey;
    logger.debug('***Youtube URL : ' + url);
    return url;
};

async function getVideoStats(videoUri) {
    const videoUrl = createUrl(videoUri);
    const response = await fetch(videoUrl, {
        headers: {
            "Accept": "application/json"
        }
    });
    const body = await response.json();
    const result = body.items;
    return result;
    };

async function getVideoListStats(videoList) {
    var videoUri = '';
    for (var i=0; i < videoList.length; i++) {
        const videoID = youtubeUrlParser(videoList[i].web_link);
        videoUri = videoUri.concat(videoID, ',');
    }
    videoUri = videoUri.slice(0, -1);
    var statsPack = await getVideoStats(videoUri);
    if (!statsPack) {
        logger.error('No answer from Youtube');
        return null;
    }
    var result = [];
    for (var c = 0; c < statsPack.length; c++){
        var media_id = videoList[c].id;
        var count = Number(statsPack[c].statistics.viewCount);
        result.push({'media_id':media_id,'views': count})
    };
    logger.debug('Recieved from Youtube ' + result.length + ' items.')
    return result;
};
// save new data to base
async function storeScanvideoUris(listOfStatistics) {
    const query = {
        text: `INSERT INTO views (media_source_id, scan_date, views_count)
                SELECT counters.media_id, CURRENT_TIMESTAMP, counters.views
                FROM json_to_recordset($1)
                AS counters (media_id INTEGER, views INTEGER);`,
        values: [JSON.stringify(listOfStatistics)]
    }
    await queryDB(query);
}

async function getYoutubeVideoCountDB() {
    const query = {
        text: 'SELECT COUNT(*) FROM media_sources WHERE paywall_id =1;'
    }
    const result = await queryDB(query);
    return result.rows[0].count;
}

async function getYoutubeStatsByPages() {
    const videosCount = await getYoutubeVideoCountDB();
    const itemsOnQuery = 49;
    const pagesCount = Math.floor(Number(videosCount)/itemsOnQuery) + 1;
    logger.debug(pagesCount + ' pages to get stats.')
    var fullStats = [];
    for (var i=0; i < pagesCount; i++) {
        var videoList = await getYoutubeStatUriListDB(i*itemsOnQuery, itemsOnQuery);
        var readyStats = await getVideoListStats(videoList.rows);
        fullStats.push(...readyStats);
    }
    console.log(...fullStats)
    return fullStats;
}

const stats = await getYoutubeStatsByPages();
await storeScanvideoUris(stats);


/*
const videoList = await getYoutubeStatUriListDB();
const readyStats = await getVideoListStats(videoList.rows);
await storeScanvideoUris(readyStats);
*/
await endDB();
