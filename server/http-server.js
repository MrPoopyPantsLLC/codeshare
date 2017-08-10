var express = require('express');
var app = express();
var http = require('http');

const initHttp = () => {
    var server = http.createServer(app);

    app.use(express.static(__dirname));

    app.get('/', function(req, res){
        res.sendFile(__dirname + '/index.html');
    });

    return server;
};

module.exports = initHttp();