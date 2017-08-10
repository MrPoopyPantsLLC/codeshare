var http = require('http');
var sockjs = require('sockjs');
var path = require('path');
var outputFileSync = require('output-file-sync');

let connections = [];

const initSock = () => {

    var app = sockjs.createServer({ 
        sockjs_url: 'http://localhost:3000/node_modules/sockjs-client/dist/sockjs.min.js'
    });

    var events = {
        file: (data) => {
            outputFileSync(data.name, data.content, 'utf-8');
            connections.forEach(conn => {
                conn.write(JSON.stringify({event:"file", data:data, from:data.from}));
            })
        }
    };

    app.on('connection', function(conn) {

        conn.on('data', function(message) {
            var obj = JSON.parse(message);
            events[obj.event](obj.data);
        });
        conn.on('close', function() {
            connections.splice(connections.indexOf(conn), 1);
        });
        connections.push(conn);

    });
    
    var server = http.createServer();
    
    app.installHandlers(server, {prefix:'/echo'});
    
    return server;
};

module.exports = initSock();
