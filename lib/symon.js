var util = require('util'),
	net = require('net'),
	stream = require('stream');

function SymonStream(opts) {
	this.host = opts.host || 'localhost';
	this.port = opts.port || 2100;
	
	this.readable = true;
	stream.Stream.call(this);
}

util.inherits(SymonStream, stream.Stream);

SymonStream.prototype.connect = function() {
	if (this.socket) throw new Error('Your not calling me again, do you?');

	this.socket = net.connect(this.port, this.host);

	var self = this;
	this.socket.on('error', function(err) {
		self.emit('error', err); 
		setTimeout(function() {
			self.socket = net.connect(self.port, self.host);
		}, 1000);
	});
	this.socket.on('end',   function() {self.emit('end'); });
	this.socket.on('data',  function(data) {self.parseData(data); });
};

SymonStream.prototype.parseData = function(raw) {

	this.emit('data', raw);

	/*	Data is: IP;(type:name:timestamp:(value)+;)+  */

	var all = raw.toString().split(';');
	all.pop(); //last ; is empty...

	var out = {
		ip: all.shift()
	}

	all.forEach(function(raw) {
		var data = raw.split(':'),
			type = data.shift(),
			name = data.shift(),
			time = data.shift();

		out[type] = out[type] || {timestamp: parseInt(time+'000', 10)};
		out[type][name] = data;
	});
	
	this.emit('parsed_data', out);
};

exports.createStream = function(opts) {
	var stream = new SymonStream(opts);
	stream.connect();
	return stream;
}

