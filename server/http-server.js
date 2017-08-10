var express = require('express');
var app = express();
var http = require('http');

const initHttp = () => {
    var server = http.createServer(app);

    app.use(express.static(process.cwd()));

    app.get('/', function(req, res){
        res.sendFile(process.cwd() + '/index.html');
    });

    app.get('/get/:project', function (req, res) {
        let files = _getAllFilesFromFolder(process.cwd() + "/" + req.params.project);
        res.send( JSON.stringify(files) );
    });

    return server;
};

var _getAllFilesFromFolder = function(dir) 
{
    var filesystem = require("fs");
    var results = [];

    filesystem.readdirSync(dir).forEach(function(file) 
    {
        file = dir+'/'+file;
        var stat = filesystem.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } 
        else 
        {
            var fd = filesystem.readFileSync(file, "utf8").toString();
            results.push({Name:file, Content:fd});
        }
    });

    return results;
};

module.exports = initHttp();