import {Router} from 'express';
import {queryDB} from '../../database/db.mjs';
import logger from "./../logger.mjs";
import * as Page from "./../renders/youtube.mjs";

const router = Router();

// routes

router.get('/youtube/full/', async (request, response) => {
    logger.debug("😀/youtube/full/ is rendering...");
    var webPageData = {};
    response.render('youtube-now.ejs', 
        {webPageData: await Page.prepareYoutubeMediaRaiting()});
    logger.debug("😀/youtube/full/ rendered.");
})

router.get('/youtube/full/:year/', async (request, response) => {
    const year = request.params.year;
    logger.debug(`😀/youtube/full/${year} is rendering...`);
    if(!year.match("^[0-9]{4}$")){
        response.status(404).send('404 - no that page');
    }
    response.render('youtube-now.ejs',
        {webPageData: await Page.prepareYoutubeMediaRaiting(year)});
    logger.debug(`😀/youtube/full/${year} rendered.`);
})

router.get('/youtube/concerts/today/', async (request, response) => {
  var webPageData = {};
  const youtubeTrend = await Page.getYoutubeTrendingNow();
  const lastScanDate = await Page.getYoutybeScanDate();
  webPageData = {
    'lastScanDate': lastScanDate,
    'youtubeTrend': youtubeTrend
  }
  if (!webPageData || webPageData == {}) {
    response.status(404).send('404 - no that page');
    return;
  }
  logger.debug('Youtube raiting delivered');
  response.render('youtube-concerts-today.ejs', {webPageData: webPageData});
})

router.get('/youtube/comedians/today/', async (request, response) => {
  const comedianTrend= await Page.getYoutubeTrendingComedians();
  const lastScanDate = await Page.getYoutybeScanDate();
  const webPageData = {
    'lastScanDate': lastScanDate,
    'comedianTrend': comedianTrend
  };
  logger.debug('Youtube raiting delivered');
  response.render('youtube-comedians-today.ejs', {webPageData: webPageData});
});

router.get('/youtube/', async (request, response) => {
    logger.debug(`😀/youtube/ is rendering...`);
    response.render('youtube.ejs',
        {webPageData: await Page.prepareYoutube()});
    logger.debug(`😀/youtube/ rendered.`);
})

export default router;
