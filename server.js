//#############################################################################################################################################################################################
//#################################### LOS INCLUDES E INICIALIZACIONES ########################################################################################################################
//#############################################################################################################################################################################################

// Includes
const port =
     //process.env.PORT || 3000;
     process.env.PORT || 8080;
const express = require('express');
const http = require('http');
const app = express();
const server = app.listen(port);
const io = require('socket.io').listen(server);
const mysql = require('mysql');

// Inicializamos la base de datos
var con = mysql.createConnection({
     host: "localhost",
     user: "HELLcard",
     password: "SUMMONcreat12",
     database: "dctdb"
});

// Template para el engine ejs
app.set('view engine', 'ejs');

// Middlewares
app.use(express.static('public'));

// Rutas para inicializar la ventana
app.get('/', (req, res) => {
     res.render('index');
});

// Escuchar el puerto adecuado
server.listen(port, function() {
     console.log("La aplicación está ejecutándose en el puerto " + port);
});

//#############################################################################################################################################################################################
//#################################### CONEXIÓN INICIAL #######################################################################################################################################
//#############################################################################################################################################################################################

// Llamada inicial cada vez que un usuario conecta. También definimos los métodos del socket
io.on('connection', (socket) => {
     console.log('Nuevo usuario conectado');

     socket.usuario = "Anónimo";

     // Listener de sckIniciarSesion
     socket.on('sckIniciarSesion', (data) => {
          fncDoFromUsuario("iniciarSesion", socket, data);
     });

     // Listener de new_message
     socket.on('new_message', (data) => {
          fncDoFromUsuario("newMessage", socket, data);
     });

     // Listener de typing
     socket.on('typing', (data) => {
          socket.broadcast.emit('typing', {usuario : socket.usuario});
     });
});

//#############################################################################################################################################################################################
//#################################### ACCESOS A BASE DE DATOS ################################################################################################################################
//#############################################################################################################################################################################################

// En base al usuario leído realiza acciones asíncronas
function fncDoFromUsuario(id, socket, data) {
     con.query("select * from usuarios where usuario = '" + data.usuario + "';", function (err, result, fields) {
          if (err) throw err;
          else {
               var cuenta = null;
               if (result.length > 0) cuenta = result[0];

               if (id == "iniciarSesion") fncIniciarSesion(socket, cuenta, data);
               else if (id == "newMessage") fncNewMessage(socket, cuenta, data);
          }
     });
}

// Inicia sesión con los datos recuperados de la ventana, o registra el usuario si no existe
function fncIniciarSesion(socket, cuenta, data) {
     if (cuenta != null) {
          // Inicio de sesión exitoso
          if (cuenta.contrasena == data.contrasena) {
               socket.usuario = data.usuario;
               socket.contrasena = data.contrasena;
               socket.experiencia = cuenta.experiencia;
               io.sockets.emit('new_message', {message : 'El usuario ' + socket.usuario + ' ha iniciado sesión.', usuario : 'INFO'});
          }
          else {
               io.sockets.emit('new_message', {message : 'Contraseña incorrecta para este usuario.', usuario : 'INFO'});
          }
     }
     // Registramos la cuenta
     else {
          socket.usuario = data.usuario;
          socket.contrasena = data.contrasena;
          socket.experiencia = 0;
          con.query("insert into usuarios (usuario, contrasena, experiencia) values ('" + data.usuario + "', '" + data.contrasena + "', 0);");
          io.sockets.emit('new_message', {message : 'Has registrado el usuario ' + socket.usuario + ' e iniciado sesión.', usuario : 'INFO'});
     }
}

// Envía un nuevo mensaje y setea la experiencia de un usuario
function fncNewMessage(socket, cuenta, data) {
     if (cuenta != null) {
          if (cuenta.contrasena == socket.contrasena) {
               ++socket.experiencia;
               con.query("update usuarios set experiencia = " + socket.experiencia + " where usuario = '" + data.usuario + "';");
          }
          io.sockets.emit('new_message', {message : data.message, usuario : socket.usuario + ' (EXP:' + socket.experiencia + ')'});
     }
     else {
          io.sockets.emit('new_message', {message : 'Debes iniciar sesión para poder escribir.', usuario : 'INFO'});
     }
}
