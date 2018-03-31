$(function(){
     // Crea la conexión
     var socket = io.connect('https://devilcardtrigger.herokuapp.com:80/');

     // Botones e inputs
     var message = $('#message');
     var username = $('#username');
     var send_message = $('#send_message');
     var send_username = $('#send_username');
     var chatroom = $('#chatroom');
     var feedback = $('#feedback');

     // Emite el mensaje
     send_message.click(function(){
          socket.emit('new_message', {message : message.val()});
     });

     // Listener de new_message
     socket.on('new_message', (data) => {
          console.log(data);
          chatroom.append('<p class="message">' + data.username + ': ' + data.message + '</p>');
     });

     // Emit de username
     send_username.click(function(){
          console.log(username.val());
          socket.emit('change_username', {username : username.val()});
     });

     // Emit de typing
     message.bind("keypress", () => {
		socket.emit('typing')
	})

	// Listener de typing
	socket.on('typing', (data) => {
		feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
	})
});
