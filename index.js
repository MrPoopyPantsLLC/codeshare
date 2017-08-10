var express = require('express');
var app = express();
var http = require('http').Server(app);

//** TEST */
//** Allow any file to be accessed from within the server directory 
app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});