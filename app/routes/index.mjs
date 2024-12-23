import {Router} from 'express';
import indexRouter from './main.mjs'
import youtubeRouter from './youtube.mjs'
import personasRouter from './personas.mjs'
import editMediaRouter from './edit-media.mjs'
import editPersonsRouter from './edit-persons.mjs'
import authRouter from './auth.mjs'

const router = Router();

router.use(indexRouter);
router.use(youtubeRouter);
router.use(personasRouter);
router.use(editMediaRouter);
router.use(editPersonsRouter);
router.use(authRouter);

export default router;