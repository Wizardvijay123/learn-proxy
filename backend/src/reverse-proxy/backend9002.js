

const http = require('http');
http.createServer((req,res) => {
  res.end('Hello from 9002 - ' + new Date().toISOString());
}).listen(9002, ()=>console.log('backend 9002 up'));



