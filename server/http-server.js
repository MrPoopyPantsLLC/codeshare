var express = require('express');
var app = express();
var http = require('http');

const initHttp = () => {
    var server = http.createServer(app);

    app.use(express.static(process.cwd()));

    app.get('/', function(req, res){
        res.sendFile(process.cwd() + '/index.html');
    });

    return server;
};

module.exports = initHttp();