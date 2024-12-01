import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("index.html");
});

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});