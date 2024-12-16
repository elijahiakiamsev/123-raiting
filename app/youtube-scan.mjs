// getting everything about concert from youtube
import fetch from 'node-fetch';
import pg from 'pg';
import path from 'node:path';
import dotenv from 'dotenv';
import {logger} from "./logger.mjs";
import { createDeflateRaw } from 'node:zlib';
import { resourceLimits } from 'node:worker_threads';

const __dirname = import.meta.dirname + '/../';

dotenv.config({
    override: true,
    path: path.join(__dirname, '.env')
});

const { Client } = pg;

logger.debug(path.join(__dirname,'.env is working'));

const dbClientConfig = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    database: process.env.DATABASE,
    port: process.env.PORT
}

const youtubeApiKey = process.env.YOUTUBEKEY;
console.log(youtubeApiKey);
const youtubeFixedURI = 'https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=';

function youtubeUrlParser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

// get the list of videos from base (uri's)
async function getYoutubeStatUriList() {
    const client = new Client(dbClientConfig);
        try {
            await client.connect();
            logger.debug('Database connected')
        } catch(err) {
            logger.error(err);
            await client.end();
            return
        }
    const query = {
        text: `SELECT media_sources.media_id, media_sources.web_link
        FROM media_sources
        WHERE paywall_id = 1;`
    }

    try {
        const res = await client.query(query);
        logger.debug('DB response recieved ' + res.rows);
        console.log(res.rows);
        return res.rows;
     } catch (err) {
        logger.error(err);
     } finally {
        await client.end();
     };

    return res.rows;
};
// read the whole list on fetch
function createUrl(videoUrl) {
    logger.debug('***Creating Youtube URL from ' + videoUrl);
    const videoID = youtubeUrlParser(videoUrl);
    const url = youtubeFixedURI
                + videoID
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
    const result = body.items[0].statistics.viewCount;
    return result;
    };

async function getVideoListStats(videoList) {
    console.log(videoList.length);
    var result = [];
    for (var i=0; i < videoList.length; i++) {
        const count = await getVideoStats(videoList[i].web_link);
        const resultsCombined = {
            'media_id': videoList[i].media_id,
            'views': count
        };
        result.push(resultsCombined)
    };
    return result;
};
// save new data to base
async function storeScanResults(listOfStatistics) {
    const client = new Client(dbClientConfig);
        try {
            await client.connect();
            logger.debug('Database connected')
        } catch(err) {
            logger.error(err);
            await client.end();
            return
        }
    const query = {
        text: `INSERT INTO views (media_source_id, scan_date, views_count)
                SELECT counters.media_id, CURRENT_TIMESTAMP, counters.views
                FROM json_to_recordset($1)
                AS counters (media_id INTEGER, views INTEGER);`,
        values: [JSON.stringify(listOfStatistics)]
    }

    try {
        const res = await client.query(query);
        logger.debug('DB response recieved ');
     } catch (err) {
        logger.error(err);
     } finally {
        await client.end();
     };
    
}

const videoList = await getYoutubeStatUriList();
const readyStats = await getVideoListStats(videoList);
await storeScanResults(readyStats);