var sock = new SockJS('http://localhost:9999/echo');
 sock.onopen = function() {
     console.log('open');
     //sock.send('test');
 };

 sock.onmessage = function(e) {
     console.log('message');
     app.run(e.data);
     //eval(e.data);
     //sock.close();
 };

 sock.onclose = function() {
     console.log('close');
 };