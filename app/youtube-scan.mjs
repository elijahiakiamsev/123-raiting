// getting everything about concert from youtube
import fetch from 'node-fetch';

import {ignition} from "./initenv.mjs"
await ignition();

import {logger} from "./logger.mjs";
import {queryDB, endDB} from '../database/db.mjs';

const youtubeApiKey = process.env.YOUTUBEKEY;

const youtubeFixedURI = 'https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=';

function youtubeUrlParser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

// get the list of videos from base (uri's)
async function getYoutubeStatUriListDB() {
    const query = {
        text: `SELECT media_sources.id, media_sources.web_link
        FROM media_sources
        WHERE paywall_id = 1;`
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
    console.log(videoList.length);
    var videoUri = '';
    for (var i=0; i < videoList.length; i++) {
        const videoID = youtubeUrlParser(videoList[i].web_link);
        videoUri = videoUri.concat(videoID, ',');
    }
    videoUri = videoUri.slice(0, -1);
    var statsPack = await getVideoStats(videoUri);
    console.log(statsPack);
    var result = [];
    for (var c = 0; c < statsPack.length; c++){
        var media_id = videoList[c].id;
        var count = Number(statsPack[c].statistics.viewCount);
        result.push({'media_id':media_id,'views': count})
    };
    console.log(result);
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

const videoList = await getYoutubeStatUriListDB();
const readyStats = await getVideoListStats(videoList.rows);
await storeScanvideoUris(readyStats);
await endDB();