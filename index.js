var symon = require('./lib/symon'),
	sio = require('socket.io'),
	send = require('send'),
	http = require('http');

var monitor = symon.createStream({host: 'remote.com'})

var server = http.createServer(function(req, res) {
	send(req, req.url)
		.root('./public/')
		.pipe(res)
});

server.listen(process.env.PORT || 3000);
io = sio.listen(server);

io.configure(function () {
	io.set('log level', 0);
});

monitor.on('parsed_data', function(data) {
	console.log(data)
	io.sockets.emit('symon', data);
});

