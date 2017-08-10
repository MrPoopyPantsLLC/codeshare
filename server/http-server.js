var path = require('path');
var express = require('express')
var app = express()

app.use(express.static(path.resolve(__dirname, '../node_modules')))
app.use(express.static(path.resolve(__dirname, '../layers')))

app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname, '../layers/index.html'));
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})