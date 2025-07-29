import cron from 'node-cron';
import logger from './../logger.mjs';

export async function scheduleScan {
    logger.silly("Paywalls scan scheduling started...");
    cron.schedule('* * * * * *', await youtubeScan());
    logger.silly("Paywalls scan is scheduled");
};

async function youtubeScan {
    logger.silly("Youtybe scan started...");
    logger.silly("Youtube scan finished.");
};
