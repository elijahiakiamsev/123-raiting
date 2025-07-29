import {Router} from 'express';
import logger from "./../logger.mjs";
import * as youtubeTools from './../scans/youtube-scan.mjs'

const router = Router();

router.get('/editor/youtubescan/', async (request, response) => {
    logger.debug("😀/editor/youtubescan/ is rendering...");
    const stats = await youtubeTools.getYoutubeStatsByPages();
    await youtubeTools.storeScanvideoUris(stats);
    await youtubeTools.recalculateDeltas();
    response.status(200).send('This is the <a href="/youtube/">youtube</a> scan');
    logger.debug("😀/editor/youtubescan/ is rendered.");
})

export default router;
