var http = require('http');

http.createServer(function (req, res) {
  res.write("You Are Online");
  res.end();
}).listen(8080);
