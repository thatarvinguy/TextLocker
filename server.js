var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
var sqlite = require("sqlite3");
var db = new sqlite.Database("data.db");

var server = http.createServer(function(req, res) {
    var path = url.parse(req.url).pathname.substring(1);
    var get = qs.parse(url.parse(req.url).query);
    if (~["js/jquery-2.1.3.min.js", "css/bootstrap.min.css", "css/index.css"].indexOf(path)) {
        res.end(fs.readFileSync(path));
        return;
    }
	else if (path == "register" && req.method == "POST") {
        req.on("data", function(data) {
            var info = JSON.parse(data);
            var userpass = info.userpass;
            var email = info.email;
            db.serialize(function() {
                db.all("SELECT userpass FROM Users WHERE userpass='" + userpass + "'", function(err, results){
                    if (typeof(results) != "undefined"&&results.length == 0){
                        db.run("INSERT INTO Users VALUES ('"+[userpass, email].join("','")+"')");
                        res.end("success");
                    }
                    else {
                        res.end("UserPass is already taken");
                    }
                });
            });
        });
	}
	else if (path == "additem" && req.method == "POST") {
        req.on("data", function(data) {
            var info = JSON.parse(data);
            var userpass = info.userpass;
            var title = info.title;
            var item = info.item;
            db.serialize(function() {
                db.run("INSERT INTO Items VALUES ('"+[userpass, title, item].join("','")+"')");
            });
        });
	}
	else if (path == "getitems" && req.method == "POST") {{
        req.on("data", function(data) {
            var info = JSON.parse(data);
            var userpass = info.userpass;
            var title = info.title;
            var item = info.item;
            db.serialize(function(){
                db.all("SELECT title, item FROM Items WHERE userpass='" + userpass + "'", function(err, results){
                    res.end(results);
                });
            });
        });
	}
    else {
        res.end(fs.readFileSync("index.html"));
    }
});
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 80;
server.listen(port, ip, function() {
	db.run("CREATE TABLE IF NOT EXISTS Items (userpass TEXT, title TEXT, item TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS Users (userpass TEXT, email TEXT)");
    console.log("Running on " + ip + ":" + port);
});
