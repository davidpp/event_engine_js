var http = require('http');
var fs = require('fs');

http.createServer(function(req, res) {

    var body = '';
    
    req.on('data', function(data) {
        body += data;
    });

    req.on('end', function() {
		switch(req.method)
		{
			case "GET":
				res.setHeader("Access-Control-Allow-Origin", "*");

				fs.readFile('data.js', function (err, data) {
					if (err) {
						res.statusCode = 500;
						res.setHeader("Content-Type" , "text/plain");
						res.end("Error reading data file!");
					}
					else {
						res.setHeader("Content-Type" , "application/json");
						res.end(data);
					}
				});
				break;

			case "POST":
				console.log(body);
				res.end();
				break;
		}
    });	

}).listen(8080, "127.0.0.1");