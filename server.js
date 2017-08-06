/**
 * http://www.infoq.com/cn/news/2011/11/tyq-nodejs-static-file-server
 * 静态文件服务器, 需要完成的功能:
 * 1. 有文件返回文件
 * 2. 没有返回 404
 * 
 * 不能让用户通过路由 /app.js 看到代码, 设定只能从某个路径下调取文件
 * 
 * 第一: 判断路径是不是存在, 如果不存在就返回 404, 如果读取出错则 500, 其他的是 200 返回文件内容
 * 第二: 需要返回文件的 MIME 格式, 未知类型返回 text/plain
 * 第三: 缓存支持
 * 第四: GZIP 支持
 * 第五: 安全问题, 防止通过 ../ 这样的操作符访问上层文件.
 * 第六: 完善 welcome 页
 * 第七: range 支持, 媒体断点
 */

var PORT = 8000;
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

var MIME = require('./MIME.js').types;
var config = require('./config.js');

var server = http.createServer(function(req, res){
  var pathname = url.parse(req.url).pathname;
  //安全路径, 将相对路径符号替换掉
  // var realPath = 'assets' + pathname;
  var realPath = path.join('assets', path.normalize(pathname.replace(/\.\./g, '')));
  // console.log(realPath);
  // console.log(path.resolve(__dirname, realPath));
  var extname = path.extname(realPath);
  extname = extname ? extname.slice(1) : 'unknown';

  var pathHandle = function(realPath){
    fs.stat(realPath, function(err, stats){
      //出错说明无法找到文件
      if(err) {
        res.writeHead(404, 'Not Found', {
          'Content-Type': 'text/plain'
        });
        res.write('This request URL ' + pathname + ' was not found on this server.');
        res.end();
      } else {
        //找到路径
        if(stats.isDirectory()) {
          //如果是文件夹则递归查找
          //如果用户输入的 url 后面没有 /, 那么就帮助加上一个 / 和 index.html 之后再做一次解析
          realPath = path.join(realPath, '/', 'index.html');
          pathHandle(realPath);
        } else {
          //文件
          //拓展名
          var extname = path.extname(realPath);
          extname = extname ? extname.slice(1) : 'unknown';
          //文件 MIME
          var contentType = MIME[extname] || 'text/plain';
          res.setHeader('Content-Type', contentType);

          //最后修改时间
          var lastModified = stats.mtime.toUTCString();
          var ifModifiedSince = 'If-Modified-Since'.toLowerCase();
          res.setHeader('last-Modified', lastModified);
          //如果符合自己配置的文件类型, 则添加缓存头部
          if(extname.match(config.Expires.fileMatch)) {
            var expires = new Date();
            expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);
            res.setHeader('Expires', expires.toUTCString());
            res.setHeader('Cache-Control', 'max-age=' + config.Expires.maxAge);
          }
          //检查文件最后修改时间和本地文件修改时间是否一样
          if(req.headers[ifModifiedSince] && lastModified == req.headers[ifModifiedSince]) {
            res.writeHead(304, 'Not Modified');
            res.end();
          } else {
            //控制返回文件函数
            var compressHandle = function(raw, statusCode, reasonPhrase, contentLength){
              var stearm = raw;
              var accpetEncoding = req.headers['accept-encoding'] || '';
              var matched = extname.match(config.Compress.match);

              //如果浏览器支持 gzip 压缩
              if(matched && accpetEncoding.match(/\bgzip\b/)) {
                res.setHeader('Content-Encoding', 'gzip');
                stearm = raw.pipe(zlib.createGzip());

              } else if (matched && accpetEncoding.match(/\bdeflate\b/)) {
                //如果支持 deflate 压缩
                res.setHeader('Content-Encoding', 'deflate');
                stearm = raw.pipe(zlib.createDeflate());

              } else {
                //都不支持则直接文件流返回
                res.setHeader('Content-Length', contentLength);
              }
              res.writeHead(statusCode, reasonPhrase);
              stearm.pipe(res);
            }

            if(req.headers['range']) {
              var range = utils.parseRange(request.headers["range"], stats.size);
              if (range) {
                  res.setHeader("Content-Range", "bytes " + range.start + "-" + range.end + "/" + stats.size);
                  res.setHeader("Content-Length", (range.end - range.start + 1));
                  var raw = fs.createReadStream(realPath, {
                      "start": range.start,
                      "end": range.end
                  });
                  compressHandle(raw, 206, "Partial Content");
              } else {
                  res.removeHeader("Content-Length");
                  res.writeHead(416, "Request Range Not Satisfiable");
                  res.end();
              }

            } else {
              //创建文件读取流
              var raw = fs.createReadStream(realPath);
              compressHandle(raw, 200, 'ok', stats.size);
            }

          }
        }
      }
    });
  }

  pathHandle(realPath);
});

server.listen(PORT);
console.log('Server runing at port:' + PORT + '.');
  //req.url 请求 url, 使用 url 模块解析路由
  //Url {
  // protocol: null,
  // slashes: null,
  // auth: null,
  // host: null,
  // port: null,
  // hostname: null,
  // hash: null,
  // search: null,
  // query: null,
  // pathname: '/',
  // path: '/',
  // href: '/' 
  //}

  // fs.readFile(realPath, 'binary', function(err, file){
  //   if(err) {
  //     console.log(err);
  //     if(err.errno === -2) {
  //       res.writeHead(404, {
  //         'Content-Type': 'text/plain'
  //       });
  //       res.write(err.toString());
  //       res.end();
  //     } else {
  //       res.writeHead(500, {
  //         'Content-Type': 'text/plain'
  //       });
  //       res.write(err.toString());
  //       res.end();
  //     }
  //   } else {
  //     var contentType = MIME[extname] || 'text/plain';
  //     res.writeHead(200, {
  //       'Content-Type': contentType
  //     });
  //     res.write(file, 'binary');
  //     res.end();      
  //   }
  // });