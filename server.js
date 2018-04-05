//#############################################################################################################################################################################################
//#################################### LOS INCLUDES E INICIALIZACIONES ########################################################################################################################
//#############################################################################################################################################################################################

// Includes
const port =
     //process.env.PORT || 3000;
     process.env.PORT || 8080;
const express = require('express'), http = require('http');
const app = express();
const server = app.listen(port);
const io = require('socket.io').listen(server);
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/mydb';

// Inicializamos la base de datos
const client = new pg.Client(connectionString);

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
          //fncDoFromUsuario("iniciarSesion", socket, data);
          client.connect();
          client.query("select * from usuarios where usuario = '$1';", [data.usuario])
               .then(res => console.log(res.rows[0]))
               .catch(e => console.error(e.stack));
          client.end();
     });

     // Listener de new_message
     socket.on('new_message', (data) => {
          //fncDoFromUsuario("newMessage", socket, data);
     });

     // Listener de typing
     socket.on('typing', (data) => {
          socket.broadcast.emit('typing', {usuario : socket.usuario});
     });
});

//#############################################################################################################################################################################################
//#################################### ACCESOS A BASE DE DATOS ################################################################################################################################
//#############################################################################################################################################################################################
