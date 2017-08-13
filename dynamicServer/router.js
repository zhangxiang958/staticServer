var http = require('http');
var url = require('url');
var qs = require('querystring');
var cookie = require('./cookie.js');
var session = require('./session.js');

var Router = function(){
  this.urlmap_get = {};
  this.urlmap_post = {};
  this.queryMap = {};
  this.cookieMap = {};
  this.setCookieMap = {};
  this.sessionManager = new session.SessionManager(5 * 1000);
}

Router.prototype.dispatch = function(request, response){
  if(request.url == '/favicon.ico') {
    response.writeHead(404, 'Not Found');
    response.end();
    return;
  }

  var routeInfo = this.route(request.url);
  this.enableCookie(request, response);
  var currSession;
  console.log('sessionIDDDD:' + request.cookie(' session_id'));
  console.log('sessionid: ' + this.sessionManager.get(request.cookie(' session_id')));
  if(this.sessionManager.get(request.cookie(' session_id'))) {
    currSession = this.sessionManager.get(request.cookie(' session_id'));
  } else {
    currSession = this.enableSession(request, response);
  }
  console.log(currSession);
  var controller;
  var pathname = url.parse(request.url).pathname;
  try {
    var method = request.method.toLowerCase() || 'get';
    if(method === 'get') {
      this.urlmap_get[pathname](request, response, currSession);
    } else if(method === 'post'){
      var _postData = '';
      var _postMap = '';
      var that = this;
      request.on('data', function(chunk){
        _postData += chunk;
      })
      .on('end', function(){
        request.postData = _postData;
        request.body = function(key){
          if(!_postMap) {
            _postMap = qs.parse(_postData);
          }
          return _postMap[key];
        }
        that.urlmap_post[pathname](request, response, currSession);
      });

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

  this.urlmap_get[path] = function(request, response, session){
    callback(request, response, session);
  };
}

Router.prototype.post = function(path, callback){
  // var _postData = '', _postMap = '';

  // http.IncomingMessage.prototype.body = function(key){
  //   if(!this.bodyMap){
  //     this.bodyMap = url.parse();
  //   }
  // }

  this.urlmap_post[path] = function(request, response, session){
    callback(request, response, session);
  }
  // console.log(this.urlmap_post);
}

Router.prototype.enableCookie = function(request, response){
  http.IncomingMessage.prototype.cookie = function(key){
      this.cookieMap = cookie.parse(request.headers.cookie || '');
      return this.cookieMap[key];
  }
  http.ServerResponse.prototype.setCookie = function(cookieObj){
    // console.log(cookieObj);
    if(!this.setCookieMap) {
      this.setCookieMap = {};
    }
    this.setCookieMap[cookieObj.key] = cookie.stringify(cookieObj);
    var returnVal = [];
    for(var key in this.setCookieMap) {
      returnVal.push(this.setCookieMap[key]);
    }
    this.setHeader('Set-Cookie', returnVal.join(', '));
  }
}

Router.prototype.enableSession = function(request, response){
  var sessionManager = this.sessionManager;
  var sessionId = request.cookie(session.SESSIONID_KEY);

  var currSession;
  if(sessionId && (currSession = sessionManager.get(sessionId))) {
    if(sessionManager.isTimeout(currSession)) {
      sessionManager.remove(sessionId);
      currSession = sessionManager.renew(response);
    } else {
      currSession.updateTime();
    }
  } else {
    currSession = sessionManager.renew(response);
  }

  return currSession;
}

Router.prototype.handle500 = function(request, response, err){
  response.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  response.end(err);
}

module.exports = new Router();