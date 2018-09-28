### nodejs 返回 html字符串并换行
`\r` 回车 `\n` 换行
windows `\r\n` linux `\n` mac `\r`
以前打字机一行结尾都要回车、换行。windows把这继承了下来，但是标志一行结尾用两个字符，有些浪费，所以Unix和mac就只用一个字符，linux继承Unix的。

### response.setHeader() && response.writeHead()
`response.setHeader()` 设置的响应头会与 `response.writeHead()` 设置的响应头合并，且 `response.writeHead()` 的优先
```
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('ok');
})
```
