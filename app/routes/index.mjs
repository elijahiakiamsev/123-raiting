import {Router} from 'express';
import indexRouter from './main.mjs'
import youtubeRouter from './youtube.mjs'
import youtubeScanRouter from './youtubescan.mjs'
import personasRouter from './personas.mjs'
import concertsRouter from './concerts.mjs'
import editorRouter from './editor.mjs'
import editMediaRouter from './edit-media.mjs'
import editMediaSourcesRouter from './edit-media-sources.mjs'
import editPersonsRouter from './edit-persons.mjs'
import editPaywallsRouter from './edit-paywalls.mjs'
import authRouter from './auth.mjs'

const router = Router();

router.use(indexRouter);
router.use(youtubeRouter);
router.use(youtubeScanRouter);
router.use(personasRouter);
router.use(concertsRouter);
router.use(editorRouter);
router.use(editMediaRouter);
router.use(editMediaSourcesRouter);
router.use(editPersonsRouter);
router.use(editPaywallsRouter);
router.use(authRouter);

export default router;