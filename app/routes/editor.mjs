import express from 'express';
import isLogged from './../middleware/checkauth.mjs'

const router = express.Router();

router.get('/editor/', isLogged, async (request, response) => {
    response.render('editor/index.ejs');
})

export default router;