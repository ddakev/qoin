var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);


app.use(express.static(__dirname));
app.get('/', function(req, res) {
    console.log('user connected');
    res.sendFile(__dirname + '/index.html');
});

app.get('/index.html', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/dash', function(req, res) {
    console.log('user connected');
    res.sendFile(__dirname + '/dash.html');
});

app.get('/coin_profile', function(req, res) {
    res.sendFile(__dirname + '/coin_profile.html');
});

server.listen(80);
console.log('Listening on port 80');