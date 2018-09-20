const http = require('http');
const processRequest = require('./server');
const port = 3000;

const httpServer = http.createServer(function(req, res){
  processRequest(req, res)
})

httpServer.listen(port, () => {
  console.log(`app is running at port: ${port}`);
});
