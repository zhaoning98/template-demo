const url = require('url')
const path = require('path')

const processRequest = (res, req) => {
  let pathName = url.parse(res.url).pathname
  let filePath = path.resolve(__dirname + '/mockapi/' + pathName)

  req.write(filePath +'\r\n')
  req.end(pathName)
}

module.exports = processRequest
