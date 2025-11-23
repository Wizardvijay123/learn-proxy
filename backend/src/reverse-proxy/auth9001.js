

const http = require('http');
http.createServer((req,res) => {
  res.end('Auth backend 9001: ' + req.method + ' ' + req.url);
}).listen(9001, ()=>console.log('auth 9001 up'));



