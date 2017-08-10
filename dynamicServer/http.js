/**
 * 动态服务器需要支持:
 * 
 * 1. HTTP 请求方法: GET POST PUT DELETE OPTIONS
 * 2. cookie
 * 3. session
 */


var http = require('http');
var https = require('https');
var url = require('url');
var config = require('./config.js');

var router = require('./router.js');

// var server = http.createServer(function(req, res){
//   console.log(url.parse(req.url).pathname);
//   res.setHeader('Content-Type', 'text/plain');
//   res.writeHead(200, 'ok');
//   res.write('hello world');
//   res.end();
// });

var server = http.createServer();

router.get('/', function(request, response){
  response.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  response.end('index');
});

router.get('/api/testGet', function(request, response){
  var test = request.query('test');
  response.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  response.end(test);
});

router.post('/api/testGet', function(request, response){
  var body = request.body('test');
  response.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  response.end(body);
});
router.post('/api/testPost', function(request, response){
  var body = request.body('test');
  response.writeHead(200, {
    'Content-Type': 'text/palin'
  });
  response.end(body);
});

server.on('request', function(request, response){
  router.dispatch(request, response);
});

server.listen(config.PORT);
console.log('server is listening the port: ' + config.PORT + '.');