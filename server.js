// Los includes
const express = require('express');
const app = express();

// Template para el engine ejs
app.set('view engine', 'ejs');

// Middlewares
app.use(express.static('public'));

// Rutas para inicializar la ventana
app.get('/', (req, res) => {
     // res.send('🍅');
     res.render('index');
});

// Escuchar el puerto 8080
server = app.listen(8080);

// socket.io instanciación
const io = require('socket.io')(server);

// Escuchar cada conexión
io.on('connection', (socket) => {
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
