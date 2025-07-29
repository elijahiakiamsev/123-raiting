import cron from 'node-cron';
import logger from './../logger.mjs';
import fetch from 'node-fetch';
import * as youtubeTools from './youtube-scan.mjs'

export default async function scheduleScan() {
    logger.silly("Paywalls scan scheduling started...");
    cron.schedule("0 */4 * * *", youtubeScan);
    logger.debug("Youtube scan scheduled");
    logger.silly("Paywalls scan is scheduled");
};

const youtubeScan = async () => {
    logger.silly("Youtybe scan started...");
    const stats = await youtubeTools.getYoutubeStatsByPages();
    await youtubeTools.storeScanvideoUris(stats);
    await youtubeTools.recalculateDeltas();
    logger.silly("Youtube scan finished.");
};
