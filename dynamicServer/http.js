/**
 * 动态服务器需要支持:
 * 
 * 1. HTTP 请求方法: GET POST PUT DELETE OPTIONS
 * 2. cookie
 * 3. session
 */


var http = require('http');
var url = require('url');
var qs = require('querystring');
var path = require('path');


var config = require('./config.js');

var server = http.createServer(function(req, res){
  res.setHeader('Content-Type', 'text/plain');
  res.writeHead(200, 'ok');
  res.write('hello world');
  res.end();
});

server.listen(config.PORT);
console.log('server is listening the port: ' + config.PORT + '.');