var http = require('http');
var sockjs = require('sockjs');

const initSock = () => {
    var echo = sockjs.createServer({ 
    sockjs_url: 'http://localhost:3000/sockjs-client/dist/sockjs.min.js'
    });

    echo.on('connection', function(conn) {
        conn.on('data', function(message) {
            conn.write(message);
        });
        conn.on('close', function() {});
    });
    
    var server = http.createServer();
    
    echo.installHandlers(server, {prefix:'/echo'});
    
    return server;
};

module.exports = initSock();
