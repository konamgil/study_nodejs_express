
var config = require("./config")
var http = require("http"),
    fs = require("fs");
    
function serveStaticFile(res,path,contentType,responeCode) {
    if(!responeCode){
        responeCode = 200;
    }
    fs.readFile(__dirname + path,function(err,data){
        if(err){
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('500 - Internal Error');
        } else {
            res.writeHead(responeCode, {'Contet-Type': contentType});
            console.log(__dirname + " " + path + " " + responeCode + " " + contentType);
            // console.log(data);
            res.end(data);
        }
    });
}

http.createServer(function (req,res) {
    //url에서 쿼리스트링과 옵션인 마지막 슬래시를 지우고 소문자로 바꿔서 정규화
    var path = req.url.replace(/\/?(?:\?.*)?$/,'').toLowerCase();
    switch (path) {
        case '':
            res.writeHead(200,{'Content-Type':'text/plain'});
            res.end('Homepage')
            break;
        case '/about':
            res.writeHead(200,{'Content-Type':'text/plain'});
            res.end('About')
            break;
        case '/public/index.html':
            serveStaticFile(res,'/src/index.html');
            break;
        default:
            res.writeHead(404,{'Content-Type':'text/plain'});
            res.end('Not Found, This page is 404..');
            break;
    }
}).listen(config.port);
console.log('Server started on localhost:'+ config.port +' press ctrl-c to terminate....');