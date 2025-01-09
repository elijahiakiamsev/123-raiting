import {Router} from 'express';
import {queryDB} from '../../database/db.mjs';
import logger from "./../logger.mjs";

const router = Router();

router.get('/c/', async (request, response) => {
    const qData = await getMediaList();
    const webPageData = {'rows': qData.rows};
    response.render('concerts.ejs', {webPageData: webPageData});
});

router.get('/p/:name_uri/', (request, response) => {
    const name_uri = request.params.name_uri;
    response.render('concert.ejs', {name_uri:name_uri});
});

async function getMediaListDB() {
    const query = {
      text: `SELECT m.id, m.title, m.uri, p.person_name
    FROM media m
    JOIN collaborators c
    ON m.id = c.media_id
    AND c.role_id = 1
    JOIN persons p
    ON c.person_id = p.id
    ORDER BY title;`
    } 
    const res = await queryDB(query);
    return res
  }
  
async function getMediaList() {
    const result = await getMediaListDB();
    return result
}

export default router;