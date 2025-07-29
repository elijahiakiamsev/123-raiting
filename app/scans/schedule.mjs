import cron from 'node-cron';
import logger from './../logger.mjs';
import fetch from 'node-fetch';

export default async function scheduleScan() {
    logger.silly("Paywalls scan scheduling started...");
    cron.schedule("0 */4 * * *", youtubeScan);
    logger.debug("Youtube scan scheduled");
    logger.silly("Paywalls scan is scheduled");
};

const youtubeScan = async () => {
    logger.silly("Youtybe scan started...");
    await fetch(`http://${process.env.HOST}:${process.env.APPPORT}/editor/youtubescan/`);
    logger.silly("Youtube scan finished.");
};
