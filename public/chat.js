$(function(){
     // Crea la conexión
     var socket = io.connect(
          //'http://localhost:8080/'
          'https://devilcardtrigger.herokuapp.com/'
     );

     // Botones e inputs
     var message = $('#message');
     var inpUsuario = $('#inpUsuario');
     var inpContrasena = $('#inpContrasena');
     var send_message = $('#send_message');
     var btnIniciarSesión = $('#btnIniciarSesión');
     var chatroom = $('#chatroom');
     var feedback = $('#feedback');

     // Emite el mensaje
     send_message.click(function(){
          socket.emit('new_message', {usuario : inpUsuario.val(), message : message.val()});
     });

     // Listener de new_message
     socket.on('new_message', (data) => {
          console.log(data);
          chatroom.append('<p class="message">' + data.usuario + ': ' + data.message + '</p>');
     });

     // Emit de sckIniciarSesion
     btnIniciarSesión.click(function(){
          socket.emit('sckIniciarSesion', {usuario : inpUsuario.val(), contrasena : inpContrasena.val()});
     });

     // Emit de typing
     message.bind("keypress", () => {
		socket.emit('typing')
	});

	// Listener de typing
	socket.on('typing', (data) => {
		feedback.html("<p><i>" + data.usuario + " is typing a message..." + "</i></p>")
	});
});
