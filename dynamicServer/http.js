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

router.get('/', function(request, response, currSession){
  //setCookie 需要在 writeHead 之前,否则会报错 Error: Can't set headers after they are sent.
  response.setCookie({
    key: 'fuck',
    value: 'test'
  });
  response.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  if(currSession.get('username')) {

    response.end('welcome back' + currSession.get('username'));
  } else {

    currSession.set('username', 'zhang');
    console.log(currSession.get('username'));
    // console.log(request.cookie('foo'));
    response.end('index');
  }
  
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
  console.log(body);
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