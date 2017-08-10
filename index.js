var http = require('./server/http-server.js');
var socket = require('./server/socket-server.js');

http.listen(3000, function(){
    console.log('listening on *:3000');
});

socket.listen(9999, function(){
    console.log('listening on *:9999');
});