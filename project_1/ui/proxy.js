const express = require('express');
const path = require('path');
const app = express();
var proxy = require('http-proxy-middleware');

app.use(express.static('D:/Brij/LGA/termlife/termlife_ui/'));

app.use('/api', proxy({target:'https://term-qa.lgamerica.com/', changeOrigin: true}));

app.use('/', express.static('D:/Brij/LGA/termlife/termlife_ui/'))

app.listen(9000);
