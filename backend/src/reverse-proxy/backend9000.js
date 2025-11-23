
const http = require('http');
http.createServer((req,res) => {
  res.end('Hello from 9000 - ' + new Date().toISOString());
}).listen(9000, ()=>console.log('backend 9000 up'));



