var sock = new SockJS('/comms');
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


 function InitSock(sock)
 {
    //** Store the func and the event */
    var events = {};

     sock.on = function (event, func)
     {
        events[event] = func;
     }

     sock.onmessage = function (e)
     {
         //** Call the function from the event */
         let args = JSON.parse(e.data);
         events[args.event](args.data);
     }

     sock.call = function (event, data)
     {
        sock.send(JSON.stringify({
            event: event,
            data : data
        }));
     }
 }

 InitSock(sock);