var http = require('http');
var sockjs = require('sockjs');
var build = require('../build/index');
var fs = require('fs');

var echo = sockjs.createServer({ 
    sockjs_url: 'http://localhost:3000/sockjs-client/dist/sockjs.min.js'
});

echo.on('connection', function(conn) {
    build('./test/app.js', function(src, map) {
        var result = JSON.parse(map);
        var sources = [];

        sources.push('webpack.bootstrap.js');
        result.modules = [];
        result.modules.push('');
        //result.sourcesContent.splice(0, 1);
        result.sources.splice(0, 1);
        result.sources.forEach(function(val){
            var filePath = val.split('webpack:///')[1];
            var file = fs.readFileSync(filePath, 'utf8');

            sources.push(filePath);
            result.modules.push(file);
        });
        // result.modules = [
        //         "",
        //         "import log from './module' log();",
        //         "export default () => { console.log('text'); }"
        //     ];
        result.sources = sources;
        result.sourceCompiled = src;

        //console.log(result)
        conn.write(JSON.stringify(result));
    })
    
    conn.on('data', function(message) {
        //conn.write(message);
    });
    conn.on('close', function() {});
    
});
 
var server = http.createServer();
// server.addListener('upgrade', function(req,res){
//     res.end();
// });
echo.installHandlers(server, {prefix:'/echo'});
server.listen(9999);