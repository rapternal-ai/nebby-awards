
const http=require('http'),fs=require('fs'),path=require('path');
const dir='/workspace/.factory-fonts';
http.createServer((req,res)=>{
  const f=path.join(dir,decodeURIComponent(req.url.split('?')[0]));
  try{const d=fs.readFileSync(f);res.writeHead(200,{'content-type':'font/woff2'});res.end(d);}
  catch{res.writeHead(404);res.end();}
}).listen(41234,'127.0.0.1');
