import express, { response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (request, response) => {
    response.send({msg: 'Hello World!'})
})

app.get('/api/personas/', (request, response) => {
    response.send([
        {id: 1, name_rus: 'Пидарас', name_eng: 'Pidaras'},
        {id: 2, name_rus: 'Хуй', name_eng: 'Hui'},
        {id: 3, name_rus: 'Пизда', name_eng: 'Pizda'}
    ]);
})

app.get('/api/media/', (request, response) => {
    response.send([
        {id: 1, name_rus: 'Концерт 1', name_eng: 'Koncert 1'},
        {id: 2, name_rus: 'Концерт 2', name_eng: 'Koncert 2'},
        {id: 3, name_rus: 'Концерт 3', name_eng: 'Koncert 3'}
    ]);
})

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});
