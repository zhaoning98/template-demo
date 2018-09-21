const fs = require('fs')
const url = require('url')
const path = require('path')
const mime = require('./mime')

const processRequest = (request, response) => {
  let pathName = url.parse(request.url).pathname
  // 获取资源文件的绝对路径
  let filePath = path.resolve(__dirname + '/mockapi/' + pathName)

  if (!pathName.endsWith('/') && path.extname(pathName) === '') {
    response.end()
  }

  // 文件后缀名
  let ext = path.extname(pathName)
  ext = ext ? ext.slice(1) : 'unknown'
  // 未知类型一律用 "text/plain" 类型
  let contentType = mime[ext] || "text/plain"

  fs.stat(filePath, (err, stats) => {
    if (err) {
      response.writeHead(404, {"content-type": contentType})
      response.end("<h1>404 Not Found</h1>")
    }

    if (stats.isFile()) {
      response.writeHead(200, { "content-type": contentType });
      response.end("<h1>Success</h1>")
    }
  })
}

module.exports = processRequest
