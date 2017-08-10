var url = require('url');
var qs = require('querystring');

var Router = function(){
  this.urlmap_get = {};
  this.urlmap_post = {};
  this.queryMap = {};
}

Router.prototype.dispatch = function(request, response){
  if(request.url == '/favicon.ico') {
    response.writeHead(404, 'Not Found');
    response.end();
    return;
  }

  var routeInfo = this.route(request.url);
  var controller;
  try {
    var method = request.method.toLowerCase() || 'get';
    if(method === 'get') {
      this.urlmap_get[request.url.pathname](request, response);
    } else if(method === 'post'){
      this.urlmap_post[request.url.pathname](request, response);
    } else {
      this.handle500(request, response, 'Error: this method is not support on this server.');
    }

  } catch(ex) {
    console.log(ex.message);
    console.log(ex.stack);
    this.handle500(request, response, 'Error: Controller"' + routeInfo.controller + '" does\'t exsit.');
  }
}

Router.prototype.route = function(requestUrl){
  var pathname = url.parse(requestUrl).pathname;

  var path = pathname.split('/');
  path.shift();

  return {
    controller: path[0] || 'index',
    action: path[1] || 'index',
    args: path.slice(2) || []
  }
}

Router.prototype.get = function(path, callback){
  http.IncomingMessage.prototype.query = function(key){
    if(!this.queryMap) {
      this.queryMap = url.parse(this.url, true);
    }

    return this.queryMap.query[key];
  }
  this.urlmap[path] = function(request, response){
    callback(request, response);
  };
}

Router.prototype.post = function(){
  http.IncomingMessage.prototype.body = function(key){
    if(!this.bodyMap){
      this.bodyMap = url.parse();
    }
  }
}

Router.prototype.enableCookie = function(request, response){

}

Router.prototype.enableSession = function(){

}

Router.prototype.handle500 = function(request, response, err){
  response.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  response.end(err);
}

module.exports = new Router();