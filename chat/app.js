var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);
	user = {};

server.listen(3000);

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection',function(socket){
	socket.on('new user',function(data, callback){
		if(data in user){
			callback(false);
		}else{
			callback(true);
			socket.nickname = data;
			user[socket.nickname] = socket;
			updateNicknames();
		}
	});
	function updateNicknames(){
		io.sockets.emit('usernames', Object.keys(user));
	}

	socket.on('send message',function(data, callback){
		var msg = data.trim();
		if(msg.substr(0,3) === '/w '){
			msg = msg.substr(3);
			var ind =msg.indexOf(' ');
			if(ind !== -1){
				var name = msg.substring(0,ind);
				var msg = msg.substring(ind + 1);
				if(name in user){
					user[name].emit('whisper',{msg: msg, nick: socket.nickname});
				console.log('Whisper!');
				}else{
					callback('Error!Plz enter a alive user');
				}
			}else{
				callback('Error! plz enter your private msg');
			} 
		}else{
		io.sockets.emit('new message',{msg: msg, nick: socket.nickname});
		}
	});
	socket.on('disconnect',function(data){
		if(!socket.nickname) return;
		delete user[socket.nickname];
		updateNicknames();
	});
});