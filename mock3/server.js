const fs = require('fs')
const url = require('url')
const path = require('path')
const mime = require('./mime')

const processRequest = (request, response) => {
  let pathName = url.parse(request.url).pathname
  // 防止中文乱码
  pathName = decodeURI(pathName)
  // 获取资源文件的绝对路径
  let filePath = path.resolve(__dirname + '/mockapi/' + pathName)

  // 301重定向，目录需以 `/` 结尾
  if (!pathName.endsWith('/') && path.extname(pathName) === '') {
    pathName += '/'
    var redirect = 'http://' + request.headers.host + pathName
    response.writeHead(301, {
      location: redirect
    })

    response.end()
  }

  // 文件后缀名
  let ext = path.extname(pathName)
  ext = ext ? ext.slice(1) : 'unknown'
  // 未知类型一律用 "text/plain" 类型
  let contentType = mime[ext] || "text/plain"

  fs.stat(filePath, (err, stats) => {
    console.log('err::', err)
    console.log('stats::', stats)
    if (err) {
      response.writeHead(404, {"content-type": contentType})
      response.end("<h1>404 Not Found</h1>")
    }

    // 文件
    if (!err && stats.isFile()) {
      response.writeHead(200, {"content-type": contentType});
      // 读文件
      var stream = fs.createReadStream(filePath)

      // 错误处理
      stream.on('error', () => {
        response.writeHead(500, {"content-type": contentType})
        response.end('<h1>500 Server Error</h1>')
      })

      stream.pipe(response)
      response.end()
    }

    // 目录
    if (!err && stats.isDirectory()) {
      var html = '<head><meta charset="utf-8" /></head>'
      fs.readdir(filePath, (err, files) => {
        if (err) {
          console.log("读取路径失败！")
        } else {
          for (var file of files) {
            if (file === 'index.html') {
              response.writeHead(200, {"content-type": "text/html"})
              response.end(file)
              break
            }

            html += `<div><a href="${file}">${file}</a></div>`
            response.writeHead(200, {"content-type": "text/html"})
            response.end(html)
          }
        }
      })
    }
  })
}

module.exports = processRequest
