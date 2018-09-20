const fs = require('fs');
const basePath = __dirname + '/api/'
const allData = {}

module.exports = () => {
  let files = fs.readdirSync(basePath)

  files.forEach(filename => {
    let fileData = fs.readFileSync(basePath + filename)
    let keyName = filename.substring(0, filename.length - 5)
    allData[keyName] = JSON.parse(fileData)
    console.log('fileData', JSON.parse(fileData))
  })

  console.log('allData',allData)
  return allData
}
