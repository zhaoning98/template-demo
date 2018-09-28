const fs = require('fs')
const url = require('url')
const path = require('path')
const mime = require('./mime')

const headers = {
  'Access-Control-Allow-Origin': '*', // 允许跨域
  'contentType': 'text/plain'
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
  headers.contentType = mime[ext] || "'text/plain'"

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
      headers['contentType'] = 'text/html'
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
          headers['contentType'] = 'text/html'
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
