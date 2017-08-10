var sock = new SockJS('http://localhost:9999/echo');
 sock.onopen = function() {
     console.log('open');
 };

 sock.onmessage = function(e) {
     console.log('message');
 };

 sock.onclose = function() {
     sock.close();
     console.log('close');
 };