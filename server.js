// Los includes
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Template para el engine ejs
app.set('view engine', 'ejs');

// Middlewares
app.use(express.static('public'));

// Rutas para inicializar la ventana
app.get('/', function(req, res) {
     res.sendFile(__dirname + '/views/index.ejs');
});

// Escuchar el puerto adecuado
// server = app.listen(8080); // PARA TESTING EN LOCAL
// server = app.listen(process.env.PORT);
server.listen(port, function() {
     console.log("La aplicación está ejecutándose en el puerto " + port);
});

// Escuchar cada conexión
io.on('connection', function(socket){
     console.log('Nuevo usuario conectado');

     // Nombre de usuario por defecto
     socket.username = "Anónimo";

     // Listener de change_username
     socket.on('change_username', (data) => {
          socket.username = data.username;
     });

     // Listener de new_message
     socket.on('new_message', (data) => {
          // Broadcast el nuevo mensaje
          io.sockets.emit('new_message', {message : data.message, username : socket.username});
     });

     // Listener de typing
     socket.on('typing', (data) => {
          socket.broadcast.emit('typing', {username : socket.username});
     });
});

http.listen(3000, function(){
     console.log('Listener en el puerto *:3000');
});
