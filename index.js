const express = require('express');
const app = express();
const port = 5000;

app.get('/', (req, res) => {
  res.send('Hello 2팀 멍톡 나만무!!!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
