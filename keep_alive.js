var http = require('http');

http.createServer(function (req, res) {
  res.write("The Hack Guy - You Are Online");
  res.end();
}).listen(8080);
