**因为想在项目中做一个 mock 数据服务器，目前，作为项目中的 mock 数据服务器呢，还有几个问题需要处理。所以先把目前仅仅 “Node.js 搭建本地文件服务器” 的源码贴出来。**

## 效果
  访问 `http://localhost:3000/` 显示 `mock/mockapi/` 下的所有目录以及文件；
  访问 `http://localhost:3000/getUsersInfo.json` 显示 `mock/mockapi/getUsersInfo.json` 文件数据。

## 源码
  ```
  // mock/index.js
  const http = require('http');
  const processRequest = require('./server');
  const port = 3000;

  const httpServer = http.createServer((req, res) => {
    processRequest(req, res)
  })

  httpServer.listen(port, () => {
    console.log(`app is running at port: ${port}`);
  });
  ```

---

  ```
  // mock/server.js
  const fs = require('fs')
  const url = require('url')
  const path = require('path')
  const mime = require('./mime')

  const headers = {
    'Access-Control-Allow-Origin': '*', // 允许跨域
    'Content-Type': 'text/plain'
  }

  const processRequest = (request, response) => {

    let pathName = url.parse(request.url).pathname
    // 防止中文乱码
    pathName = decodeURI(pathName)
    // 获取资源文件的绝对路径
    let filePath = path.resolve(__dirname + '/mockapi/' + pathName)

    // 文件后缀名
    let ext = path.extname(pathName)
    ext = ext ? ext.slice(1) : 'unknown'
    // 未知类型一律用 "text/plain" 类型
    headers['Content-Type'] = mime[ext] || "'text/plain'"

    // 301重定向
    if (!pathName.endsWith('/') && path.extname(pathName) === '') {
      pathName += '/'
      var redirect = 'http://' + request.headers.host + pathName

      response.writeHead(301, { location: redirect })
      response.end()
    }

    fs.stat(filePath, (err, stats) => {
      // 未找到文件
      if (err) {
        headers['Content-Type'] = 'text/html'
        response.writeHead(404, headers)
        response.end("<h1>404 Not Found</h1>")
      }

      // 文件
      if (!err && stats.isFile()) {
        fs.readFile(filePath, (err, data) => {
          if (err) {
            response.writeHead(500, headers)
            response.end('<h1>500 Server Error</h1>')
          }

          response.writeHead(200, headers);
          response.end(data)
        })
      }

      // 目录
      if (!err && stats.isDirectory()) {
        var html = '<head><meta charset="utf-8" /></head>'

        fs.readdir(filePath, (err, files) => {
          if (err) {

            html += `<div>读取路径失败！</div>`
            response.writeHead(404, headers)
            response.end(html)

          } else {
            headers['Content-Type'] = 'text/html'
            response.writeHead(200, headers)

            for (var file of files) {
              if (file === 'index.html') {
                response.end(file)
                break
              }

              html += `<div><a href="${file}">${file}</a></div>`
            }
            response.end(html)
          }
        })
      }
    })
  }

  module.exports = processRequest
  ```
---

  ```
  // mock/mime.js
  module.exports = {
      "css": "text/css",
      "gif": "image/gif",
      "html": "text/html",
      "ico": "image/x-icon",
      "jpeg": "image/jpeg",
      "jpg": "image/jpeg",
      "js": "text/javascript",
      "json": "application/json",
      "pdf": "application/pdf",
      "png": "image/png",
      "svg": "image/svg+xml",
      "swf": "application/x-shockwave-flash",
      "tiff": "image/tiff",
      "txt": "text/plain",
      "wav": "audio/x-wav",
      "wma": "audio/x-ms-wma",
      "wmv": "video/x-ms-wmv",
      "xml": "text/xml"
  };
  ```

## 说明
### 知识点
  - http - HTTP
  - fs - 文件系统
  - path - 路径
  - url - 网址

### 创建服务器
  `http.createServer([options][, requestListener])` 返回一个新得 `http.Server` 实例;
  `http.Server`类 继承自 `net.Server`;
  `net.Server`类 用于创建 `TCP` 或 `IPC server`。

  `server.listen(options[, callback])` 开启 HTTP 服务器监听链接。

  `mock/server.js` 文件 把对 `response` 和 `request` 的处理封装成一个匿名函数，传入 `http.createServer()` 中。

  ```
  // mock/index.js
  const http = require('http');
  const processRequest = require('./server');
  const port = 3000;

  const httpServer = http.createServer((req, res) => {
    processRequest(req, res)
  })

  httpServer.listen(port, () => {
    console.log(`app is running at port: ${port}`);
  })
  ```

### 获取请求资源的路径
  ```
  // mock/server.js
  const url = require('url')
  const path = require('path')

  const processRequest = (request, response) => {
    let pathName = url.parse(request.url).pathname
    // 防止中文乱码
    pathName = decodeURI(pathName)
    // 获取资源文件的绝对路径
    let filePath = path.resolve(__dirname + '/mockapi/' + pathName)
  }
  ```

  ** url.parse() **
  请求 `http://localhost:3000/api/users.json` 地址，其中，`request.url` 为 `/api/users.json`；
  请求 `http://localhost:3000/api/users.json?a=1` 地址，其中，`request.url` 为 `/api/users.json?a=1`。
  所以这里需要用到，`url` 模块 解析URL。

  `url` 模块提供了一些实用函数，用于 URL 处理与解析。
  `url.parse()` 方法会解析一个 URL 字符串并返回一个 URL 对象。

  下图中，网址 `http://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash` 由 `url.parse()`返回的对象的属性。


  这里，我们可以 `pathName` 即查找文件 相对于 `mock/mockapi/` 的路径。

  ** path.resolve() **
  有了 `pathName`，现在就需要获取资源文件的绝对路径`filePath`，方便之后的文件查找以及文件读取。

  `path` 模块提供了一些工具函数，用于处理文件与目录的路径。
  `path.resolve([...paths])` 方法会把一个路径或路径片段的序列解析成一个绝对路径。
  例子：
  ```
  path.resolve('/foo/bar', './baz');
  // 返回 '/foo/bar/baz'

  path.resolve('/foo/bar', '/tmp/file/');
  // 返回 '/tmp/file'

  path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif');
  // 如果当前工作目录为 /home/myself/node，
  // 则返回 '/home/myself/node/wwwroot/static_files/gif/image.gif'
  ```

### 重定向
  如果是访问目录文件，且未以 '/' 结尾，这里做一下处理，重定向到 访问路径尾部添加 '/' 的地址。

  ```
  // 301重定向
  if (!pathName.endsWith('/') && path.extname(pathName) === '') {
    pathName += '/'
    var redirect = 'http://' + request.headers.host + pathName

    response.writeHead(301, { location: redirect })
    response.end()
  }
  ```

### 响应头
  后面在返回数据的时候，需要用到 `response.writeHead(statusCode[, statusMessage][, headers])` 方法，发送一个响应头给请求。
  状态码是一个三位数的 HTTP 状态吗，如`404`。最后一个参数 `headers` 是响应头。第二个参数 `statusMessage` 是可选的状态描述。

  这里，需要设置响应头的 `Access-Control-Allow-Origin` 和 `Content-Type`。

  `Content-Type`，内容类型，一般是指网页中存在的 `Content-Type`，用于定义网络文件的类型和网页的编码，决定浏览器将以什么形式，什么编码读取这个文件。

  `Access-Control-Allow-Origin: <orgin>` 指定了该响应的资源是否被允许 与 给定的`orgin`共享;
  `*` 作为通配符，允许所有域都具有访问资源的权限。

  ```
  const headers = {
    'Access-Control-Allow-Origin': '*', // 允许跨域
    'Content-Type': 'text/plain'
  }
  const processRequest = (request, response) => {

    let pathName = url.parse(request.url).pathname
    // 防止中文乱码
    pathName = decodeURI(pathName)

     // 文件后缀名
    let ext = path.extname(pathName)
    ext = ext ? ext.slice(1) : 'unknown'
    // 未知类型一律用 "text/plain" 类型
    headers['Content-Type'] = mime[ext] || "'text/plain'"
  }
  ```

### 读取文件
  `fs` 模块提供了一些 API，用于以一种类似标准 POSIX 函数的方式与文件系统进行交互。

  `fs.Stats` 对象提供了一个文件的信息。可以从 `fs.stat()` 返回。
  `stats.isDirectory()` 如果 fs.Stats 对象表示一个文件系统目录，则返回 true 。
  `stats.isFile()` 如果 fs.Stats 对象表示一个普通文件，则返回 true 。

  `fs.readFile(path[, options], callback)` 异步地读取一个文件的全部内容。
  `fs.readdir(path[, options], callback)`异步地读取一个目录的内容
  ```
  fs.stat(filePath, (err, stats) => {
    // 未找到文件
    if (err) {
      headers['Content-Type'] = 'text/html'
      response.writeHead(404, headers)
      response.end("<h1>404 Not Found</h1>")
    }

    // 文件
    if (!err && stats.isFile()) {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          response.writeHead(500, headers)
          response.end('<h1>500 Server Error</h1>')
        }

        response.writeHead(200, headers);
        response.end(data)
      })
    }

    // 目录
    if (!err && stats.isDirectory()) {
      var html = '<head><meta charset="utf-8" /></head>'

      fs.readdir(filePath, (err, files) => {
        if (err) {

          html += `<div>读取路径失败！</div>`
          response.writeHead(404, headers)
          response.end(html)

        } else {
          headers['Content-Type'] = 'text/html'
          response.writeHead(200, headers)

          for (var file of files) {
            if (file === 'index.html') {
              response.end(file)
              break
            }

            html += `<div><a href="${file}">${file}</a></div>`
          }
          response.end(html)
        }
      })
    }
  })
  ```

### 返回数据
  `response.end([data][, encoding][, callback])`
  该方法会通知服务器，所有响应头和响应主题都已被发送，即服务器将其视为已完成。每次响应都必须调用 `response.end()` 方法。

  如果指定了 `data`，则相当于调用 `response.write(data, encoding)` 之后再调用 `response.end(callback)`。

  如果指定了 `callback`，则当响应流结束时被调用。

  ```
  response.writeHead(404, headers)
  response.end('<h1>500 Server Error</h1>')
  ```

## [Node.js 中文网][1]




  [1]: http://nodejs.cn/api/
