//#############################################################################################################################################################################################
//#################################### LOS INCLUDES Y CONEXIONES ############################################################################################################################
//#############################################################################################################################################################################################

// Includes
const puerto = process.env.PORT || 8080;
const puertoSQL = 3306;
const express = require('express');
const http = require('http');
const app = express();
const server = app.listen(puerto);
const io = require('socket.io').listen(server);
const mysql = require('mysql');

// Inicializamos la base de datos
var pool = mysql.createPool({
     connectionLimit:10,
     host:"eu-cdbr-west-02.cleardb.net", user:"bd0a2b4ce07342", password:"5e67cbaed168786", database:"heroku_8f53c8984463c5b"
     //port:puertoSQL, host:"localhost", user:"root", password:"password", database:"dctdb"
});

pool.getConnection((errStart, con) => {
     if (errStart) throw errStart;
     console.log("¡Conectado a la base de datos!");

     // Gestiones de tablas
     //con.query("drop table if exists Partidas;", function (errDrop) {if (errDrop) throw errDrop; console.log("La tabla de Partidas ha sido borrada");});
     //con.query("drop table if exists Usuarios;", function (errDrop) {if (errDrop) throw errDrop; console.log("La tabla de Usuarios ha sido borrada");});

     //con.query("create table if not exists Usuarios (usuarioID varchar(50) not null, usuarioPass varchar(50) not null, primary key (usuarioID));", function (errCreate) {if (errCreate) throw errCreate; console.log("La tabla de Usuarios ha sido creada");});
     //con.query("create table if not exists Partidas (partidaID varchar(50) not null, partidaCreadorUsuarioID varchar(50) not null, partidaRivalUsuarioID varchar(50), partidaCartasID varchar(248) not null, partidaCartasHueco varchar(186) not null, partidaCartasPV varchar(62) not null, partidaCartasAngle varchar(186) not null, primary key (partidaID), foreign key (partidaCreadorUsuarioID) references Usuarios(usuarioID), foreign key (partidaRivalUsuarioID) references Usuarios(usuarioID));", function (errCreate) {if (errCreate) throw errCreate; console.log("La tabla de Partidas ha sido creada");});

     con.release();
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
server.listen(puerto, function() {
     console.log("La aplicación está ejecutándose en el puerto " + puerto);
});

//############################################################################################################################################################################################################################
//#################################### VARIABLES E INICIALIZACIONES ##########################################################################################################################################################
//############################################################################################################################################################################################################################

// Constantes generales para todas las partidas
var nCartas = 31+31; // Número de cartas. 62 pues tomamos AMBOS MAZOS. Luego ir haciendo distinciones.
var nHuecos = 1+2*(4+2+4)+5+5+6*10+8*3*2+4*2*2;
var relacionUmbralTrigger = 1/2; // Constante de Umbral de Trigger
var ctSwapeando = 25; // Cantidad de swapeo
var offset = 13;
var pvWidth = 11;
var pvHeight = 10;
var cartaWidth = 64;
var cartaHeight = 90;
var iAsignaCarta = 0; // Para asignar las cartas más fácilmente y crear la deck

// Sesiones de los usuarios para no preguntar a la base de datos a cada instante
// No deberá almacenarse en base de datos. Si se borra o resetea, se volverá a crear y ya. Es algo dinámico.
var sesiones = new Array();

function obSesion() {
     this.usuarioID = ""; // El usuarioID de la sesión
     this.usuarioPass = ""; // El usuarioPass de la sesión
     this.cont = 0; // Contador de tiempo que tu sesión permanece iniciada
     this.bloqueada = 0; // ¿El usuario está bloqueado? Sobretodo para que las autollamadas no bloqueen
     this.intentosFallidos = 0; // Numero de logins fallidos
     this.modoDesplazamiento = 2; // Cómo desplazas el campo con el mouse
     this.contInGame = 0; // Contador para enviar la señal de que estamos en juego
}

// Gestionamos múltiples partidas a la vez
nPartidas = 0;
partidas = new Array();

function obPartida() {
     this.partidaID = ""; // El id de la partida
	this.usuarios = [new obUsuario(), new obUsuario()];
     this.turno = 1; // El turno salta entre 1 (creador) y 2 (rival), otorgándole el control
     // Las cartas
     this.cartas = new Array(); // Array de las cartas
     for (var i = 0; i < nCartas; ++i) {
     	this.cartas.push(new obCarta());
     }
     // Los huecos
     this.huecos = new Array(); // Array de huecos que rellenamos de forma automática al crearlos
     // Ejército
     generaGridDeHuecos(this.huecos, 1, 873, 535, 1, 1, cartaHeight-25, cartaHeight+10, false); // General
     //
     generaGridDeHuecos(this.huecos, 1, -10, 419, 1, 10, cartaHeight-25, cartaHeight+10, false); // Fila superior
     generaGridDeHuecos(this.huecos, 1, -10, 510, 1, 10, cartaHeight-25, cartaHeight+10, false); // Fila intermedia
     generaGridDeHuecos(this.huecos, 1, -10, 601, 1, 10, cartaHeight-25, cartaHeight+10, false); // Fila inferior
     // Limbo tuyo
     generaGridDeHuecos(this.huecos, 2, 1145, 420, 1, 10, cartaHeight-25, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 2, 1145, 510, 1, 10, cartaHeight-25, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 2, 1145, 600, 1, 10, cartaHeight-25, cartaHeight+10, false);
     // Vanguardia + Reserva tuya
     generaGridDeHuecos(this.huecos, 0, 10, 210, 2, 3, cartaHeight+10, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 0, 360, 210, 2, 3, cartaHeight+10, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 0, 710, 210, 2, 2, cartaHeight+10, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 0, 930, 210, 2, 2, cartaHeight+10, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 0, 1180, 210, 2, 3, cartaHeight+10, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 0, 1530, 210, 2, 3, cartaHeight+10, cartaHeight+10, false);
     // Limbo rival
     generaGridDeHuecos(this.huecos, 2, 1145, 420, 1, 10, cartaHeight-25, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 2, 1145, 510, 1, 10, cartaHeight-25, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 2, 1145, 600, 1, 10, cartaHeight-25, cartaHeight+10, false);
     // Vanguardia + Reserva rival
     generaGridDeHuecos(this.huecos, 0, 10, 110, 2, 3, cartaHeight+10, cartaHeight+10, true);
     generaGridDeHuecos(this.huecos, 0, 360, 110, 2, 3, cartaHeight+10, cartaHeight+10, true);
     generaGridDeHuecos(this.huecos, 0, 710, 110, 2, 2, cartaHeight+10, cartaHeight+10, true);
     generaGridDeHuecos(this.huecos, 0, 930, 110, 2, 2, cartaHeight+10, cartaHeight+10, true);
     generaGridDeHuecos(this.huecos, 0, 1180, 110, 2, 3, cartaHeight+10, cartaHeight+10, true);
     generaGridDeHuecos(this.huecos, 0, 1530, 110, 2, 3, cartaHeight+10, cartaHeight+10, true);
}

function generaGridDeHuecos(objeto, ind, x, y, nRow, nCol, sepW, sepH, resUp) {
	for (var i = 0; i < nRow; ++i) {
		for (var j = 0; j < nCol; ++j) {
			objeto.push(new obHueco(ind, x+j*sepW, y+i*sepH*(1 - 2*resUp), i == 1 || nRow == 1 || nCol == 1));
		}
	}
}

function obUsuario() {
     // Funcionamiento básico de los usuarios y la partida
     this.usuarioID = "";
     this.mousePress = false; // click pulsado actualmente
     this.mouseRelease = false; // Click alzado actualmente
     this.mousex, this.mousey; // Coordenadas del ratón
     this.xCampo = -510; // Desplaza el campo horizontalmente
     this.generalColocado = false; // Primero debes colocar el general o bloquea el resto de Ejército
     this.nComenzado = 0; // Al colocar 2, comienzas
     this.comenzado = false; // Tras colocar el General debes colocar 2 Criaturas para bloquear el resto del Ejército
     this.candado = true; // ¿Aplicamos el candado?
     this.umbralTrigger = 0; // Cantidad de Trigger que puedes generar al turno
     this.trigger = 0; // Trigger generador ese turno
     this.triggerGenerado = 0; // La cuenta de Trigger ganado este turno, para ver cuanto deja obtener
     this.swapLimbo = false; // ¿El Limbo está swapeado?
     this.swapeando = ctSwapeando; // Contador para swapear el Limbo
     this.claseSeleccionada = ''; // La carta seleccionada en menú, su clase para comparaciones
     this.nEjercitoRival = 0; // Número de cartas del Ejército rival
     this.cargaImagenesHuecos = 0; // Cargamos imagenes de Huecos?
     this.cargaImagenesCartas = 0; // Cargamos imagenes de Cartas?
     this.cargaImagenesMenus = 0; // Cargamos imagenes de Menus?
     // Menú
     this.spMenuA = new Array();
     for (var i = 0; i < 8; ++i) {
     	this.spMenuA.push("");
     }
     this.isMenu = false; // ¿Menu abierto?
     this.imenu = 0; // Índice de carta con menu
     this.imenuDraw = 0; // Índice real para dibujar
     this.menuSeleccionado = -1; // Del 0 al 7 para interno, del 8 al 15 para externo
     this.menuScale = 0; // Animación progresiva
     // Los huecos
     this.sprLimboBoton = ""; // Eso
     // Modos de desplazamiento. Al cambiar dinámicamente in-game, tener variables separadas
     // Modo 0 (NADA)
     // Modo 1
     this.incModoDesplazamiento = 0; // Cantidad de desplazamiento
     this.objetivoDesplazamiento = 0; // Hacia dónde te mueves
     // Modo 2
     this.cooldownDesplazamiento = 0; // Cantidad de desplazamiento
     this.ladoDesplazamiento = 0; // Hacia dónde te mueves
     this.gradualDesplazamiento = 0; // Hacia dónde te mueves
}


// Las cartas

function obCarta() {
	this.cid = -1; // El sprite
     this.cartaUsuario = [new obCartaUsuario(), new obCartaUsuario()];
	this.pv = 0; // Los PV actuales
	this.pvmax = 0; // Los PV máximos
	this.huecoOcupado = -1; // índice del hueco ocupado
	this.angle = 90;
	this.angleDraw = 90; // Para dibujo gradual
	this.volteada = false; // ¿Está volteada?
	this.general = false; // ¿Es General?
	this.rango = 0; // El Rango de la Criatura
	this.clase = ''; // La clase
	this.sprClase = ""; // Cuál de las 6 Clases es (A, R, C, G, V, X = General)
	this.sprEspecie = ""; // Cuál de las 6 Espécies es (H, B, E, A, D, I, M)
	this.sprElemento = ""; // Cuál de los 6 Elementos es (F, R, S, L, G, T, N)
}

// Datos de las cartas que dependen del usuario

function obCartaUsuario() {
     this.usuarioID = ""; // Ezo
	this.x = 0; // La coordenada x
	this.y = 0; // La coordenada y
	this.xstart = 0; // Coordenadas iniciales
	this.ystart = 0; // That
	this.seleccionada = false; // ¿Está el mouse encima?
	this.pulsada = false; // ¿Le has hecho click?
	this.xoff = 0; // Al clicar, el x respecto al borde, para arrastrar bien
	this.yoff = 0; // Igual con la y
	this.xpress = 0; // Coordenadas al clicar
	this.ypress = 0; // Igual con la y
}

// Los huecos

function obHueco(ind, x, y, vert) {
	this.ind = ind; // ¿Vanguardia (0), Ejército (1), Limbo (2)?
	this.huecoUsuario = [new obHuecoUsuario(x, y, vert), new obHuecoUsuario(x, y, vert)];
	this.width = cartaHeight;
	this.height = cartaHeight;
	this.xoffset = 0;
	this.yoffset = 0;
	this.vert = vert;

	if (vert) {
		this.width = cartaWidth;
          this.huecoUsuario[0].x += offset;
          this.huecoUsuario[1].x += offset;
          this.huecoUsuario[0].xstart += offset;
          this.huecoUsuario[1].xstart += offset;
	}
}

function obHuecoUsuario(x, y, vert) {
     this.usuarioID = ""; // Ezo
     this.x = x; // La coordenada x
     this.y = y; // La cooordenada y
	this.xstart = this.x; // Coordenadas iniciales básicas
	this.ystart = this.y;
	this.image = "sprCartaHueco";
     if (vert) {
		this.image = "sprCartaHuecoVert";
     }
}

// las cartas

var infoCartas = new Array();
infoCartas.push(new obInfoCarta(0, '0', 4, 0, 'G', 'E', 'N'));
infoCartas.push(new obInfoCarta(1, '1', 2, 1, 'V', 'A', 'N'));
infoCartas.push(new obInfoCarta(2, '2', 2, 1, 'T', 'E', 'T'));
infoCartas.push(new obInfoCarta(3, '3', 2, 1, 'T', 'E', 'N'));
infoCartas.push(new obInfoCarta(4, '4', 2, 1, 'T', 'E', 'N'));
infoCartas.push(new obInfoCarta(5, '5', 4, 0, 'V', 'A', 'N'));
infoCartas.push(new obInfoCarta(6, '6', 1, 2, 'C', 'A', 'N'));
infoCartas.push(new obInfoCarta(7, '7', 3, 1, 'V', 'E', 'N'));
infoCartas.push(new obInfoCarta(8, '8', 2, 0, 'V', 'E', 'N'));
infoCartas.push(new obInfoCarta(9, '9', 2, 0, 'T', 'A', 'T'));
infoCartas.push(new obInfoCarta(10, '10', 2, 2, 'R', 'A', 'T'));
infoCartas.push(new obInfoCarta(11, '11', 2, 3, 'R', 'E', 'T'));
infoCartas.push(new obInfoCarta(12, '12', 3, 2, 'T', 'E', 'T'));
infoCartas.push(new obInfoCarta(13, '13', 2, 3, 'A', 'A', 'N'));
infoCartas.push(new obInfoCarta(14, '14', 3, 0, 'V', 'A', 'N'));
infoCartas.push(new obInfoCarta(15, '15', 2, 1, 'C', 'E', 'N'));
infoCartas.push(new obInfoCarta(16, '16', 2, 0, 'V', 'A', 'N'));
infoCartas.push(new obInfoCarta(17, '17', 3, 4, 'A', 'A', 'N'));
infoCartas.push(new obInfoCarta(18, '18', 2, 1, 'T', 'E', 'N'));
infoCartas.push(new obInfoCarta(19, '19', 1, 0, 'V', 'A', 'T'));
infoCartas.push(new obInfoCarta(20, '20', 2, 0, 'V', 'A', 'N'));

infoCartas.push(new obInfoCarta(21, '21', 4, 0, 'G', 'I', 'F'));
infoCartas.push(new obInfoCarta(22, '22', 1, 0, 'V', 'I', 'F'));
infoCartas.push(new obInfoCarta(23, '23', 2, 0, 'V', 'H', 'E'));
infoCartas.push(new obInfoCarta(24, '24', 2, 1, 'V', 'I', 'E'));
infoCartas.push(new obInfoCarta(25, '25', 2, 1, 'T', 'I', 'F'));
infoCartas.push(new obInfoCarta(26, '26', 3, 3, 'R', 'H', 'F'));
infoCartas.push(new obInfoCarta(27, '27', 1, 0, 'V', 'I', 'F'));
infoCartas.push(new obInfoCarta(28, '28', 4, 1, 'V', 'H', 'F'));
infoCartas.push(new obInfoCarta(29, '29', 2, 2, 'C', 'I', 'F'));
infoCartas.push(new obInfoCarta(30, '30', 3, 3, 'A', 'I', 'E'));
infoCartas.push(new obInfoCarta(31, '31', 2, 1, 'T', 'H', 'F'));
infoCartas.push(new obInfoCarta(32, '32', 2, 1, 'C', 'I', 'E'));
infoCartas.push(new obInfoCarta(33, '33', 1, 0, 'V', 'I', 'E'));
infoCartas.push(new obInfoCarta(34, '34', 3, 2, 'C', 'H', 'E'));
infoCartas.push(new obInfoCarta(35, '35', 2, 2, 'R', 'H', 'F'));
infoCartas.push(new obInfoCarta(36, '36', 2, 2, 'C', 'H', 'E'));
infoCartas.push(new obInfoCarta(37, '37', 3, 2, 'T', 'I', 'E'));
infoCartas.push(new obInfoCarta(38, '38', 2, 1, 'T', 'H', 'E'));
infoCartas.push(new obInfoCarta(39, '39', 3, 1, 'T', 'H', 'F'));
infoCartas.push(new obInfoCarta(40, '40', 2, 2, 'R', 'I', 'F'));
infoCartas.push(new obInfoCarta(41, '41', 2, 1, 'T', 'I', 'F'));
infoCartas.push(new obInfoCarta(42, '42', 2, 0, 'V', 'H', 'E'));
infoCartas.push(new obInfoCarta(43, '43', 2, 1, 'T', 'H', 'F'));
infoCartas.push(new obInfoCarta(44, '44', 2, 0, 'V', 'I', 'F'));
infoCartas.push(new obInfoCarta(45, '45', 2, 0, 'T', 'I', 'F'));
infoCartas.push(new obInfoCarta(46, '46', 2, 1, 'V', 'I', 'F'));
infoCartas.push(new obInfoCarta(47, '47', 3, 0, 'V', 'H', 'E'));
infoCartas.push(new obInfoCarta(48, '48', 2, 1, 'C', 'H', 'E'));
infoCartas.push(new obInfoCarta(49, '49', 3, 4, 'A', 'I', 'F'));
infoCartas.push(new obInfoCarta(50, '50', 2, 0, 'V', 'I', 'E'));
infoCartas.push(new obInfoCarta(51, '51', 2, 0, 'V', 'I', 'E'));

function obInfoCarta(cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) {
     this.cartaID = cartaID; // El identificador numérico de la carta
     this.cartaNombre = cartaNombre; // El nombre de la carta
     this.cartaPV = cartaPV; // Los PV de la carta
     this.cartaRango = cartaRango; // El rango (coste) de la carta
     this.cartaClase = cartaClase; // La clase de la carta
     this.cartaEspecie = cartaEspecie; // La especie de la carta
     this.cartaElemento = cartaElemento; // El elemento de la carta
}

//#############################################################################################################################################################################################
//#################################### CONEXIÓN INICIAL, RECIBIR SEÑALES DEL CLIENTE PARA ENVIARLAS DE VUELTA #######################################################################################################################################
//#############################################################################################################################################################################################

// Llamada inicial cada vez que un usuario conecta. También definimos los mét-odos del socket
io.on('connection', (socket) => {
     console.log('Nuevo usuario conectado');

     socket.on('mousePress', (data) => {
          var dataAux = data;
          dataAux.mousePress = true;
          if (isSesionActiva(data.usuarioID, data.usuarioPass, data.partidaID)) continueFromUsuarioYPartidaChecked(setMousePress, socket, data);
     });

     socket.on('mouseRelease', (data) => {
          var dataAux = data;
          dataAux.mouseRelease = true;
          if (isSesionActiva(data.usuarioID, data.usuarioPass, data.partidaID)) continueFromUsuarioYPartidaChecked(setMouseRelease, socket, data);
     });

     socket.on('mouseMove', (data) => {
          if (isSesionActiva(data.usuarioID, data.usuarioPass, data.partidaID)) continueFromUsuarioYPartidaChecked(setMouseMove, socket, data);
     });

     // Iniciamos sesión o registramos el usuario
     socket.on('iniciarSesion', (data) => {
          if (isSesionActivaSoloUsuario(data.usuarioID, data.usuarioPass)) iniciarSesion(socket, data, data);
          else if (!isSesionBloqueada(data.usuarioID)) doFromUsuario(iniciarSesion, socket, data);
     });

     // Crear partida
     socket.on('crearPartida', (data) => {
          if (isSesionActivaSoloUsuario(data.usuarioID, data.usuarioPass)) crearPartida(socket, data, data);
          else if (!isSesionBloqueada(data.usuarioID)) doFromUsuario(crearPartida, socket, data);
     });

     socket.on('main', (data) => {
          // Si la sesión está activa vamos directo al main sin validar usuario. De lo contrario, pasamos a validar con base de datos
          if (isSesionActiva(data.usuarioID, data.usuarioPass, data.partidaID)) continueFromUsuarioYPartidaChecked(mainAfterSettings, socket, data);
          else if (!isSesionBloqueada(data.usuarioID)) doFromUsuarioYPartida(mainAfterSettings, socket, data);
     });

     socket.on('isOnline', (data) => {
          // Si la sesión está activa vamos directo al main sin validar usuario. De lo contrario, pasamos a validar con base de datos
          if (isSesionActivaSoloUsuario(data.usuarioID, data.usuarioPass)) isOnline(socket, data);
     });
});

//############################################################################################################################################################################################################################
//#################################### FUNCIONES DE LÓGICA ##############################################################################################################################################################
//############################################################################################################################################################################################################################

function isOnline(socket, data) {
     socket.broadcast.emit('isOnline', {usuarioRivalID:data.usuarioID});
}

function mainAfterSettings(socket, partida, usuario, data) {
     if (partida != null && usuario != null) {
          var sesion = getSesion(data.usuarioID);
          sesion.contInGame = Math.max(sesion.contInGame-1, 0);
          if (sesion.contInGame == 0) {
               socket.broadcast.emit('isInGame', {usuarioRivalID:data.usuarioID, usuarioRivalPartidaID:partida.partidaID});
               sesion.contInGame = 60;
          }

          gestionSistema(socket, data, partida, usuario);
          gestionHuecos(socket, data, partida, usuario);
          gestionSwapLimbo(socket, data, partida, usuario);
          gestionCartas(socket, data, partida, usuario);
          gestionCartaSeleccionada(socket, data, partida, usuario);
          gestionArrastrarCarta(socket, data, partida, usuario);
          gestionMenu(socket, data, partida, usuario);
          gestionCandado(socket, data, partida, usuario);
          gestionTrigger(socket, data, partida, usuario);
          gestionNuevoTurno(socket, data, partida, usuario);

          // Obtenemos el ID del usuario rival
          var usuarioRivalID = partida.usuarios[0].usuarioID;
          if (partida.usuarios[0].usuarioID == usuario.usuarioID) usuarioRivalID = partida.usuarios[1].usuarioID;

          // Enviamos la señal
          socket.emit('main', {
               isLadoNormal:isLadoNormal(partida, 0, usuario.usuarioID), hue:partida.huecos, car:partida.cartas, men:usuario.spMenuA, usuarioID:usuario.usuarioID, usuarioRivalID:usuarioRivalID,
               generalColocado:usuario.generalColocado, comenzado:usuario.comenzado, candado:usuario.candado, xCampo:usuario.xCampo, menuScale:usuario.menuScale, imenuDraw:usuario.imenuDraw,
               umbralTrigger:usuario.umbralTrigger, triggerGenerado:usuario.triggerGenerado, trigger:usuario.trigger, sprLimboBoton:usuario.sprLimboBoton, nEjercitoRival:usuario.nEjercitoRival,
               modoDesplazamiento:sesion.modoDesplazamiento,  ladoDesplazamiento:usuario.ladoDesplazamiento
          });

          gestionPostCiclo(socket, data, partida, usuario);
          cargarImagenesHuecos(socket, partida, usuario);
          cargarImagenesCartas(socket, partida, usuario);
          cargarImagenesMenus(socket, partida, usuario);
     }
}

function gestionSistema(socket, data, partida, usuario) { // Ajustes varios
     // Desplazar el campo
     var sesion = getSesion(data.usuarioID);
     if (sesion.modoDesplazamiento == 0) { // Desplazamiento ligado al mousex, se mueven ambos a la vez
          usuario.xCampo = Math.min(Math.max(-usuario.mousex*1.105, -1000), -20);
     }
     else if (sesion.modoDesplazamiento == 1) { // Sólo al llevar el ratón a un lado se desplaza
          var left = usuario.mousex < 100;
          var right = usuario.mousex > 1280-360-100;
          var velocidad = 0;
          if (left || right) velocidad = 15;
          usuario.incModoDesplazamiento = tiendeAX(usuario.incModoDesplazamiento, velocidad, 1);

          if (left) usuario.objetivoDesplazamiento = -20;
          else if (right) usuario.objetivoDesplazamiento = -1000;
          usuario.xCampo = tiendeAX(usuario.xCampo, usuario.objetivoDesplazamiento, usuario.incModoDesplazamiento);
     }
     else if (sesion.modoDesplazamiento == 2) { // Tres zonas, al tocar los lados, da un salto
          usuario.cooldownDesplazamiento = Math.max(usuario.cooldownDesplazamiento-1, 0);
          var left = usuario.mousex < 150;
          var right = usuario.mousex > 1280-360-150;

          if (usuario.cooldownDesplazamiento == 0) {
               if (left && usuario.ladoDesplazamiento >= 0) {
                    --usuario.ladoDesplazamiento;
                    usuario.cooldownDesplazamiento = 60*1;
               }
               else if (right && usuario.ladoDesplazamiento <= 0) {
                    ++usuario.ladoDesplazamiento;
                    usuario.cooldownDesplazamiento = 60;
               }
          }

          if (usuario.cooldownDesplazamiento > 30) usuario.gradualDesplazamiento = Math.min(usuario.gradualDesplazamiento+0.55, 16.5);
          else usuario.gradualDesplazamiento = Math.max(usuario.gradualDesplazamiento-0.55, 0);

          usuario.xCampo = tiendeAX(usuario.xCampo, -510 -490*usuario.ladoDesplazamiento, usuario.gradualDesplazamiento);
     }

     // La cuenta bloqueada?
     for (var i = 0; i < sesiones.length; ++i) {
          sesiones[i].bloqueada = Math.max(sesiones[i].bloqueada-1, 0);
     }
}

function gestionHuecos(socket, data, partida, usuario) { // Simplemente gestión huecos
     for (var j = 0; j < nHuecos; ++j) {
          var huecoUsuario = getHuecoUsuario(partida.huecos[j], usuario.usuarioID);
          // Los huecos colocados acorde.
          // Si no es Limbo (gestión normal) o es Limbo pero -> es tuyo y no pide swapear o es del rival y pide swapear, posición normal
          if (partida.huecos[j].ind == 2) {
               if ((!usuario.swapLimbo && miCampo(j)) || (usuario.swapLimbo && !miCampo(j))) {
                    huecoUsuario.x = tiendeAX(huecoUsuario.x, huecoUsuario.xstart + 50+usuario.xCampo, 40 + 1000*(usuario.swapeando == 0));
               }
               else {
                    huecoUsuario.x = tiendeAX(huecoUsuario.x, 2200 + 50+usuario.xCampo, 40 + 1000*(usuario.swapeando == 0));
               }
          }
          else {
               huecoUsuario.x = huecoUsuario.xstart + 50+usuario.xCampo;
          }

          // Las clases para comparar
          var huecoUsuario = getHuecoUsuario(partida.huecos[j], usuario.usuarioID);
          if (partida.huecos[j].vert) huecoUsuario.image = "sprCartaHuecoVert";
          else huecoUsuario.image = "sprCartaHueco";

          if (!miCampo(j)) {
               var jOcupado = isHuecoOcupado(usuario, partida, j);
               if (jOcupado && usuario.claseSeleccionada != '' && !partida.huecos[j].vert) {
                    var iCarta = getICarta(usuario, partida, j);
                    var efectivo = getEfectivo(usuario.claseSeleccionada, partida.cartas[iCarta].clase);
                    if (efectivo == 1 || efectivo == 0) huecoUsuario.image = "sprCartaHuecoVerde";
                    else if (efectivo == -1) huecoUsuario.image = "sprCartaHuecoRojo";
               }
          }
     }

     if (usuario.swapeando > 0) --usuario.swapeando;
}

function gestionSwapLimbo(socket, data, partida, usuario) {
     if (usuario.mousex > 1877+usuario.xCampo && usuario.mousex < 1877+usuario.xCampo+20 && usuario.mousey > 517 && usuario.mousey < 517+70) {
          if (!usuario.swapLimbo) {
               usuario.sprLimboBoton = "sprLimboBotonOnS";
          }
          else {
               usuario.sprLimboBoton = "sprLimboBotonOffS";
          }

          if (usuario.mousePress) {
               usuario.swapLimbo = !usuario.swapLimbo;
               usuario.swapeando = ctSwapeando;
          }
     }
     else {
          if (!usuario.swapLimbo) {
               usuario.sprLimboBoton = "sprLimboBotonOn";
          }
          else {
               usuario.sprLimboBoton = "sprLimboBotonOff";
          }
     }
}

function gestionCartas(socket, data, partida, usuario) {
     for (var i = 0; i < nCartas; ++i) {
          var huecoOcupado = getHuecoOcupadoPorLado(partida, i, usuario.usuarioID);
          if (huecoOcupado >= 0) {
               if (huecoOcupado < 31) partida.cartas[i].volteada = false;
               if (!usuario.generalColocado && huecoOcupado > 0 && huecoOcupado < 31) partida.cartas[i].volteada = true;
               if (usuario.comenzado && huecoOcupado < 31) partida.cartas[i].volteada = true;
               if (huecoOcupado < 31 && !usuario.candado) partida.cartas[i].volteada = false;
          }

          var dif = angleDifference(partida.cartas[i].angleDraw, partida.cartas[i].angle);
          partida.cartas[i].angleDraw += Math.sign(dif)*Math.min(10, Math.abs(dif));
     }
}

function gestionCartaSeleccionada(socket, data, partida, usuario) { // Mostramos la carta seleccionada, comprobando si está el ratón encima de cada una
     for (var i = 0; i < nCartas; ++i) {
          var cartaUsuario = getCartaUsuario(partida.cartas[i], usuario.usuarioID);
          cartaUsuario.seleccionada = false;
          if (isCartaSeleccionada(usuario, partida, i)) {
               cartaUsuario.seleccionada = true;
          }
     }
}

function gestionArrastrarCarta(socket, data, partida, usuario) { // Al clicar y mantener una carta, la arrastra
     for (var i = 0; i < nCartas; ++i) { // Para cada carta...
          var huecoOcupado = getHuecoOcupadoPorLado(partida, i, usuario.usuarioID);
          var cartaUsuario = getCartaUsuario(partida.cartas[i], usuario.usuarioID);
          if (usuario.mousePress && isCartaSeleccionada(usuario, partida, i)) { // ... si tienes el ratón encima y pulsas, la marcas como agarrada
               if (usuario.generalColocado || (!usuario.generalColocado && partida.cartas[i].general)) {
                    // Si está volteada y en el Ejército no dejamos arrastrar hasta colocar el General
                    if (miCampo(huecoOcupado)) {
                         // Sólo puedo interactuar si es mía
                         cartaUsuario.pulsada = true;
                         cartaUsuario.xoff = usuario.mousex-cartaUsuario.x;
                         cartaUsuario.yoff = usuario.mousey-cartaUsuario.y;
                         break;
                    }
                    else {
                         socket.emit('nuevoMensaje', {mid:12, desc:null}); // Sólo toca tus cartas
                    }
               }
               else {
                    socket.emit('nuevoMensaje', {mid:0, desc:null}); // El General es la primera carta a robar
               }
          }
          else if (usuario.mouseRelease) {
               // Justo al soltarla, si está tocando un hueco, se ajusta a él
               if (cartaUsuario.pulsada) {
                    var dejada = false; // ¿La dejas sobre hueco?
                    for (var j = 0; j < nHuecos; ++j) { // Tomando la carta pulsada, para cada hueco...
                         var huecoUsuario = getHuecoUsuario(partida.huecos[j], usuario.usuarioID);
                         if (isHuecoSeleccionado(usuario, partida, j)) { // ... si estamos seleccionando ese hueco...
                              var jp = partida.cartas[i].huecoOcupado; // Hueco previo
                              var jOcupado = isHuecoOcupado(usuario, partida, j);
                              var jpOcupado = isHuecoOcupado(usuario, partida, jp);
                              // No interactúes con el campo rival
                              var tuCampo = miCampo(jp) && miCampo(j);
                              if (tuCampo) {
                                   var swapea = jOcupado && jpOcupado && !partida.huecos[jp].vert && !partida.huecos[j].vert;
                                   if (!jOcupado || swapea) { // Swap de Vanguardia
                                        if (!partida.cartas[i].general || (partida.cartas[i].general && !partida.huecos[j].vert)) {
                                             // Si está el candado restringe la invocación
                                             var invoca = usuario.candado && jp >= 61 && partida.huecos[jp].vert && !partida.huecos[j].vert;
                                             if (!invoca || (invoca && usuario.trigger >= partida.cartas[i].rango)) {
                                                  // Si está el candado restringue el desplazamiento
                                                  var desplaza = usuario.candado && isDeUnaZonaAOtra(jp, j, true);
                                                  if (!desplaza || (desplaza && !partida.cartas[i].volteada && partida.cartas[i].angle == 90)) {
                                                       if (invoca) {
                                                            usuario.trigger -= partida.cartas[i].rango;
                                                            socket.emit('nuevoMensaje', {mid:3, desc:partida.cartas[i].rango}); // Trigger pagado por invocación
                                                       }
                                                       // Si viene boca abajo del Ejército, lo pone boca arriba
                                                       if (jp < 31) partida.cartas[i].volteada = false;
                                                       dejada = true;
                                                       if (!usuario.generalColocado) { // Comenzamos oficialmente la partida
                                                            usuario.generalColocado = true;
                                                            var huecoUsuario0 = getHuecoUsuario(partida.huecos[0], usuario.usuarioID);
                                                            huecoUsuario0.x = -9000;
                                                            huecoUsuario0.xstart = -9000;
                                                       }
                                                       else { // Tras colocar el general, debemos colocar 2 criaturas fuera (no deja que sea el General a estas alturas)
                                                            if (jp < 31 && j >= 31) { // La colocamos fuera con éxito
                                                                 ++usuario.nComenzado;
                                                                 if (usuario.nComenzado == 2) usuario.comenzado = true;
                                                            }
                                                            else if (jp >= 31 && j < 31) { // Si eres graciosillo y la vuelves adentro lo tenemos en cuenta
                                                                 --usuario.nComenzado;
                                                            }
                                                       }
                                                       // Moverse de una zona a otra pone boca abajo en horizontal si hay candado
                                                       if (desplaza) {
                                                            partida.cartas[i].volteada = true;
                                                            partida.cartas[i].angle = 0;
                                                            socket.emit('nuevoMensaje', {mid:9, desc:null}); // Desplazas
                                                       }
                                                       // Swapear Criaturas de la Vanguardia
                                                       if (swapea) {
                                                            var is = getICarta(usuario, partida, j); // i siguiente
                                                            // Carta de la Vanguardia objetivo a la anterior Vanguardia
                                                            partida.cartas[is].huecoOcupado = jp;
                                                            // ¿Desplazas?
                                                            if (desplaza) {
                                                                 partida.cartas[is].volteada = true;
                                                                 partida.cartas[is].angle = 0;
                                                            }
                                                       }

                                                       // Índices
                                                       var ls = getNVangRes(jp), rs = getNVangRes(j);
                                                       var jrsOcupado = isHuecoOcupado(usuario, partida, j+rs);

                                                       // Swapear Criaturas de las Reservas al mover entre Vanguardias
                                                       if (getZona(jp) > 0 && getZona(j) > 0) {
                                                            for (var k = 0; k < nCartas; ++k) {
                                                                 // Carta de la Reserva objetivo (si hay) a la anterior Reserva, sólo en caso de que el hueco objetivo esté vacío
                                                                 if (partida.cartas[k].huecoOcupado == j+rs && jrsOcupado) {
                                                                      partida.cartas[k].huecoOcupado = jp+ls;
                                                                 }
                                                                 // Carta de la Reserva anterior (si hay) a la Reserva objetivo
                                                                 //else if (cartas[k].huecoOcupado == jp+ls && getZona(jp) == getZona(j)) {
                                                                 //     cartas[k].huecoOcupado = j+rs;
                                                                 //}
                                                            }
                                                       }

                                                       // Oficializamos el nuevo hueco ocupado
                                                       partida.cartas[i].huecoOcupado = j;

                                                       // Al mover a un hueco no girable, lo pone en vertical y lo ajusta/resetea
                                                       if (partida.huecos[j].vert) {
                                                            partida.cartas[i].angle = 90;
                                                            partida.cartas[i].pv = partida.cartas[i].pvmax;
                                                            partida.cartas[i].volteada = false;
                                                            if (usuario.imenu == i) {
                                                                 usuario.isMenu = false;
                                                            }
                                                       }
                                                  }
                                                  else if (desplaza) {
                                                       socket.emit('nuevoMensaje', {mid:10, desc:null}); // No puede desplazar
                                                  }
                                             }
                                             else if (invoca) {
                                                  socket.emit('nuevoMensaje', {mid:4, desc:partida.cartas[i].rango}); // Trigger para invocación no suficiente
                                             }
                                        }
                                        else {
                                             socket.emit('nuevoMensaje', {mid:1, desc:null}); // No puedes sacar el General de la Vanguardia
                                        }
                                   }
                                   else if (jOcupado && partida.cartas[i].huecoOcupado != j) {
                                        socket.emit('nuevoMensaje', {mid:11, desc:null}); // Hueco ocupado, no desplazas
                                   }
                              }
                              else {
                                   socket.emit('nuevoMensaje', {mid:12, desc:null}); // Interactuar con campo rival
                              }
                         }
                    }
                    if (!dejada) { // Si no encontraste hueco...
                         cartaUsuario.x = cartaUsuario.xstart;
                         cartaUsuario.y = cartaUsuario.ystart;
                    }

                    cartaUsuario.pulsada = false; // ... en cuanto sueltas el click se te va.
               }

               if (cartaUsuario.pulsada) {
                    cartaUsuario.xpress = 0;
                    cartaUsuario.ypress = 0;
               }
          }

          // Si está pulsada, la arrastramos
          if (cartaUsuario.pulsada) {
               cartaUsuario.x = usuario.mousex-cartaUsuario.xoff;
               cartaUsuario.y = usuario.mousey-cartaUsuario.yoff;
          }
          // Las coordenadas de las cartas, se arrastran automáticamente hasta el hueco
          else {
               // Excepto si están fuera
               if (huecoOcupado == -1) {
                    cartaUsuario.y = -100;
                    cartaUsuario.ystart = -100;
               }
               else {
                    var huecoUsuario = getHuecoUsuario(partida.huecos[huecoOcupado], usuario.usuarioID);
                    cartaUsuario.x = huecoUsuario.x;
                    cartaUsuario.y = huecoUsuario.y;
                    cartaUsuario.xstart = huecoUsuario.x;
                    cartaUsuario.ystart = huecoUsuario.y;
               }
          }
     }
}

function gestionMenu(socket, data, partida, usuario) { // Todas las opciones del menú y su control
     for (var i = 0; i < nCartas; ++i) { // Para cada carta...
          var huecoOcupado = getHuecoOcupadoPorLado(partida, i, usuario.usuarioID);
          var cartaUsuario = getCartaUsuario(partida.cartas[i], usuario.usuarioID);
          if (usuario.mousePress && cartaUsuario.pulsada) {
               if (isCartaSeleccionada(usuario, partida, i)) { // ... seleccionada que se puede girar ...
                    // Si es tuya
                    if (miCampo(huecoOcupado)) {
                         cartaUsuario.xpress = cartaUsuario.x;
                         cartaUsuario.ypress = cartaUsuario.y;
                         if (usuario.menuSeleccionado == -1) {
                              usuario.isMenu = false;
                              if (usuario.claseSeleccionada != '') {
                                   usuario.cargaImagenesHuecos = 2;
                                   usuario.claseSeleccionada = '';
                              }
                         }
                    }
                    else {
                         socket.emit('nuevoMensaje', {mid:12, desc:null}); // Toca tus cartas sólo
                    }
               }
          }
          else if (usuario.mouseRelease && huecoOcupado >= 0 && !partida.huecos[huecoOcupado].vert) {
               if (isCartaSeleccionada(usuario, partida, i) && Math.abs(cartaUsuario.x-cartaUsuario.xpress) < 10 && Math.abs(cartaUsuario.y-cartaUsuario.ypress) < 10) {
                    // Ocultamos el menú si procede
                    if (usuario.isMenu && usuario.menuScale == 1) {
                         // Si has pulsado sobre el mismo que está mostrando su menú y está mostrado, lo oculta.
                         // Sólo si NO hay seleccionado ningún menú
                         if (usuario.menuSeleccionado == -1) {
                              usuario.isMenu = false;
                              usuario.imenu = i;
                              if (usuario.claseSeleccionada != '') {
                                   usuario.cargaImagenesHuecos = 2;
                                   usuario.claseSeleccionada = '';
                              }
                         }
                    }
                    // Mostramos el menú en caso contrario
                    else if (!usuario.isMenu && usuario.menuScale == 0) {
                         usuario.isMenu = true
                         usuario.imenu = i;
                         if (usuario.claseSeleccionada != partida.cartas[i].clase) {
                              usuario.cargaImagenesHuecos = 2;
                              usuario.claseSeleccionada = partida.cartas[i].clase;
                         }
                    }
               }
          }

          // Seleccionamos las opciones del menú
          if (usuario.mousePress && usuario.isMenu && i == usuario.imenu) {

               if (usuario.menuSeleccionado == 0) { // Restar PV
                    partida.cartas[i].pv = Math.max( partida.cartas[i].pv-1, 0);
               }
               else if (usuario.menuSeleccionado == 1) { // Girar
                    // Si el candado está ACTIVADO no deja rotarla boca abajo
                    if (!usuario.candado || usuario.candado && !partida.cartas[i].volteada) {
                         partida.cartas[i].angle -= 90;
                         if (partida.cartas[i].angle <= -90) partida.cartas[i].angle = 270;
                    }
                    else {
                         if (partida.cartas[i].angle == 90 || partida.cartas[i].angle == 270) {
                              socket.emit('nuevoMensaje', {mid:7, desc:null}); // No rotar sacrificada
                         }
                         else {
                              socket.emit('nuevoMensaje', {mid:8, desc:null}); // No rotar desplazada
                         }
                    }
               }
               else if (usuario.menuSeleccionado == 2) { // Voltear
                    if (!usuario.candado || usuario.candado && !partida.cartas[i].volteada) {
                         partida.cartas[i].volteada = !partida.cartas[i].volteada;

                         // Si el candado está ACTIVADO, funcionalidad sacrificio, sumamos Trigger acorde y siempre la pone en vertical
                         if (usuario.candado && partida.cartas[i].volteada) {
                              partida.cartas[i].angle = 90;
                              var dif = usuario.umbralTrigger - usuario.triggerGenerado;
                              var ganar = Math.min(partida.cartas[i].rango+1, dif);
                              usuario.trigger += ganar;
                              usuario.triggerGenerado += ganar;
                              socket.emit('nuevoMensaje', {mid:2, desc:ganar}); // Trigger ganado por sacrificio
                         }
                    }
                    else {
                         if (partida.cartas[i].angle == 90) {
                              socket.emit('nuevoMensaje', {mid:5, desc:null}); // No deja voltear sacrificada
                         }
                         else if (partida.cartas[i].angle == 0) {
                              socket.emit('nuevoMensaje', {mid:6, desc:null}); // No deja voltear desplazada
                         }
                    }
               }
               else if (usuario.menuSeleccionado == 3) { // Sumar PV
                    partida.cartas[i].pv = Math.min( partida.cartas[i].pv+1, partida.cartas[i].pvmax);
               }
          }
     }

     // Animación de menú gradual al aparecer/irse
     if (usuario.isMenu) {
          usuario.menuScale = Math.min(usuario.menuScale+0.05, 1);
          usuario.imenuDraw = usuario.imenu;
     }
     else {
          usuario.menuScale = Math.max(usuario.menuScale-0.05, 0);
          if (usuario.menuScale == 0) usuario.imenuDraw = usuario.imenu;
     }

     // Selecciona el menú correcto
     usuario.menuSeleccionado = -1;

     var cartaUsuarioDraw = getCartaUsuario(partida.cartas[usuario.imenuDraw], usuario.usuarioID);
     if (usuario.menuScale > 0) {
          for (var m = 0; m < 8; ++m) {
               // Según la distancia y el ángulo del ratón con el centro de la carta seleccionamos o no cada sección
               var x = cartaUsuarioDraw.x+cartaWidth/2+offset;
               var y = cartaUsuarioDraw.y+cartaHeight/2;
               var dist = Math.sqrt(Math.pow(usuario.mousex-x, 2) + Math.pow(usuario.mousey-y, 2));
               var ang = pointDirection(usuario.mousex, usuario.mousey, x, y);

               if (inRange(dist, 30, 75) && absAngleDifference(ang, m*45+45+22.5) <= 22.5) {
                    if (usuario.spMenuA[m] != "sprMenuAS") {
                         usuario.cargaImagenesMenus = 1;
                         usuario.spMenuA[m] = "sprMenuAS";
                    }
                    usuario.menuSeleccionado = m+1;
                    if (usuario.menuSeleccionado == 8) usuario.menuSeleccionado = 0;
               }
               else {
                    if (usuario.spMenuA[m] != "sprMenuA") {
                         usuario.cargaImagenesMenus = 1;
                         usuario.spMenuA[m] = "sprMenuA";
                    }
               }
          }
     }
}

function gestionCandado(socket, data, partida, usuario) { // Permite bloquear o desbloquear las normas
     if (usuario.mousex <= 70 && usuario.mousey <= 70) {
          if (usuario.mousePress) { // Al hacer click, alterna
               usuario.candado = !usuario.candado;
          }
     }
}

function gestionTrigger(socket, data, partida, usuario) { // Gestión del umbral de Trigger y el Trigger generado
     if (usuario.comenzado) {
          // Sumamos o restamos Trigger
          var dif = usuario.umbralTrigger - usuario.triggerGenerado;
          var ganar = Math.min(1, dif);

          // UP
          if (usuario.comenzado && usuario.mousex >= 970 && usuario.mousex <= 970+25 && usuario.mousey >= 665 && usuario.mousey < 665+25) {
               if (usuario.mousePress) {
                    if (usuario.candado) {
                         usuario.trigger = Math.min(usuario.trigger+ganar, 12);
                         usuario.triggerGenerado = Math.min(usuario.triggerGenerado+ganar, 12);
                    }
                    else {
                         usuario.trigger = Math.min(usuario.trigger+1, 12);
                    }
               }
          }
          // DOWN
          if (usuario.comenzado && usuario.mousex >= 970 && usuario.mousex <= 970+25 && usuario.mousey >= 690 && usuario.mousey < 690+25) {
               if (usuario.mousePress) {
                    usuario.trigger = Math.max(usuario.trigger-1, 0);
               }
          }

          // Reiniciamos el Trigger generado
          if (usuario.comenzado && usuario.mousex >= 920 && usuario.mousex <= 920+50 && usuario.mousey >= 660 && usuario.mousey < 660+50) {
               if (usuario.mousePress) {
                    usuario.triggerGenerado = 0;
                    usuario.trigger = 0;
               }
          }
     }
}

function gestionNuevoTurno(socket, data, partida, usuario) { // Iniciamos un nuevo turno
     if (usuario.comenzado && usuario.mousePress && usuario.mousex > 1100-150 && usuario.mousex < 1100+150 && usuario.mousey > 578 && usuario.mousey < 578+50) {
          setNuevoTurno(partida, usuario);
     }
}

function gestionPostCiclo(socket, data, partida, usuario) { // Ajustes al acabar el ciclo
     // Enviamos isLadoNormal para la primera carta. Será true si este cliente corresponde a las 31 primeras cartas.
     usuario.mousePress = false;
     usuario.mouseRelease = false;

     // Gestionamos las sesiones reduciendo el contador. Si se vacía, la sesión desaparece
     for (var i = 0; i < sesiones.length; ++i) {
          --sesiones[i].cont;
          if (sesiones[i].cont <= 0) {
               sesiones.splice(i, 1);
          }
     }
}

function cargarImagenesHuecos(socket, partida, usuario) {
     if (usuario.cargaImagenesHuecos > 0) {
          --usuario.cargaImagenesHuecos;

          var hue = new Array();
          for (j = 0; j < nHuecos; ++j) {
               var huecoUsuario = getHuecoUsuario(partida.huecos[j], usuario.usuarioID);
               hue.push({hue:huecoUsuario.image});
          }
          socket.emit('cargarImagenesHuecos', {hue:hue});
     }
}

function cargarImagenesCartas(socket, partida, usuario) {
     if (usuario.cargaImagenesCartas > 0) {
          --usuario.cargaImagenesCartas;

          var car = new Array();
          for (i = 0; i < nCartas; ++i) {
               car.push({car:partida.cartas[i].cid, cla:partida.cartas[i].sprClase, esp:partida.cartas[i].sprEspecie, ele:partida.cartas[i].sprElemento});
          }
          socket.emit('cargarImagenesCartas', {car:car});
     }
}

function cargarImagenesMenus(socket, partida, usuario) {
     if (usuario.cargaImagenesMenus > 0) {
          --usuario.cargaImagenesMenus;

          socket.emit('cargarImagenesMenus', {men:usuario.spMenuA});
     }
}

//############################################################################################################################################################################################################################
//#################################### MÉT-ODOS HELPER #############################################################################################################################################################
//############################################################################################################################################################################################################################

function getEfectivo(a, d) { // Atacante vs defensor. 1 si es efectivo y hace daño, -1 si es débil y él se hace daño, 0 si es empate y ambos se hacen daño
     if (a == d) return 0;
     else if (a == 'G' || d == 'G') return 1;
     else {
          if (a == 'A' && (d == 'C' || d == 'V' || d == 'T')) return 1;
          else if (a == 'C' && (d == 'T' || d == 'R')) return 1;
          else if (a == 'T' && (d == 'V' || d == 'R')) return 1;
          else if (a == 'R' && (d == 'A' || d == 'V')) return 1;
          else if (a == 'V' && d == 'C') return 1;
          else return -1;
     }
}

function miCampo(i) { // Devuelve si el índice pertenece a tus huecos y no del rival
     return i >= 0 && i < 93;
}

function isDeUnaZonaAOtra(i, j, isDespl) { // Comprueba si las posiciones "i" y "j" están en Zonas distintas (implícito: en huecos !vert).
// Si isDespl (es desplazamiento), ambas puertas cuentan para la misma pues permite desplazar. Si no (como efectos) cuentan como distintas.
     var zi = getZona(i), zj = getZona(j);
     // Si tenemos ambos lados de la puerta, los igualamos para desplazamiento
     if (isDespl) {
          if (zi == 3 && zj == 4) zi = 4;
          else if (zi == 4 && zj == 3) zj = 4;
     }
     return zi > 0 && zj > 0 && zi != zj;
}

function getZona(i) { // Devuelve la zona dado un índice. Las zonas son "1", "2", "3" (Puerta L), "4" (Puerta R), "5" y "6". Si no pertenece a ninguna zona, -1.
     if ((i >= 61 && i <= 63) || (i >= 123 && i <= 125)) return 1;
     else if ((i >= 67 && i <= 69) || (i >= 129 && i <= 131)) return 2;
     else if (i == 73 || i == 74 || i == 135 || i == 136) return 3;
     else if (i == 77 || i == 78 || i == 139 || i == 140) return 4;
     else if ((i >= 81 && i <= 83) || (i >= 143 && i <= 145)) return 5;
     else if ((i >= 87 && i <= 89) || (i >= 149 && i <= 151)) return 6;
     else return -1;
}

function getNVangRes(i) { // Devuelve cuanto debes sumar/restar a la posición de la Vanguardia para ir a su Reserva anexada, según si es de 2 o 3 posiciones
     if (getZona(i) == 3 || getZona(i) == 4) return 2;
     else return 3;
}

function setNuevoTurno(partida, usuario) {
	// Calculamos el Umbral de Trigger
	usuario.umbralTrigger = 0;
	for (var j = 0; j < nHuecos; ++j) {
          var jOcupado = isHuecoOcupado(usuario, partida, j);
		if (!partida.huecos[j].vert && !jOcupado && miCampo(j)) ++usuario.umbralTrigger;
	}
	usuario.umbralTrigger = Math.round(usuario.umbralTrigger*relacionUmbralTrigger);

	// Volteamos boca arriba y en vertical todas las cartas, reiniciamos el Trigger...
	usuario.trigger = 0;
	usuario.triggerGenerado = 0;
	usuario.isMenu = false;

	for (var i = 0; i < nCartas; ++i) {
		// Sólo reinicia TUS cartas. Las del rival quedan en su posición para reaccionar a ellas4
          var huecoOcupado = getHuecoOcupadoPorLado(partida, i, usuario.usuarioID);
		if (miCampo(huecoOcupado)) {
			partida.cartas[i].volteada = false;
			partida.cartas[i].angle = 90;
		}
	}
}

function nuevaPartida(data, crea) { // Creamos una nueva partida con t-odos los datos para ir tirando
     // Sólo creamos la partida la primera vez
     var ind = -1;

     if (crea) {
          partidas.push(new obPartida());
          partidas[nPartidas].partidaID = data.partidaID;
          ind = nPartidas;

          // TODO TRUCOS
          /*partidas[nPartidas].usuarios[0].generalColocado = true;
          partidas[nPartidas].usuarios[0].nComenzado = 2;
          partidas[nPartidas].usuarios[0].comenzado = true;
          partidas[nPartidas].usuarios[1].generalColocado = true;
          partidas[nPartidas].usuarios[1].nComenzado = 2;
          partidas[nPartidas].usuarios[1].comenzado = true;*/
     }
     else {
          for (var i = 0; i < nPartidas; ++i) {
               if (partidas[i].partidaID == data.partidaID) {
                    ind = i;
                    break;
               }
          }
     }

     // Rellenamos el Creador o el Rival según haya hueco.
     // Si el primer usuario está vacío inserta al creador...
     if (partidas[ind].usuarios[0].usuarioID == "") partidas[ind].usuarios[0].usuarioID = data.usuarioID;
     // Si no, si no eres el creador y hay hueco en el segundo, inserta al rival
     else if (partidas[ind].usuarios[0].usuarioID != data.usuarioID && partidas[ind].usuarios[1].usuarioID == "") partidas[ind].usuarios[1].usuarioID = data.usuarioID;
     // Si no, no te asignas a ninguna partida

     if (crea) ++nPartidas;
}

function isCartaSeleccionada(usuario, partida, iCarta) { // ¿Estás encima de la carta?
     var carta = partida.cartas[iCarta];
     var huecoOcupado = getHuecoOcupadoPorLado(partida, iCarta, usuario.usuarioID);
     if (huecoOcupado >= 0) {
          var hueco = partida.huecos[huecoOcupado];
          var cartaUsuario = getCartaUsuario(partida.cartas[iCarta], usuario.usuarioID);
          return usuario.mousex > cartaUsuario.x+getCartaXOffset(carta, hueco) && usuario.mousex < cartaUsuario.x+getCartaXOffset(carta, hueco)+getCartaWidth(carta)
          && usuario.mousey > cartaUsuario.y+getCartaYOffset(carta, hueco) && usuario.mousey < cartaUsuario.y+getCartaYOffset(carta, hueco)+getCartaHeight(carta);
     }
     else return false;
}

function isHuecoSeleccionado(usuario, partida, jHueco) { // ¿Estás encima del hueco?
     if (jHueco >= 0) {
          var hueco = partida.huecos[jHueco];
          return usuario.mousex > getHuecoX(hueco, usuario.usuarioID)+hueco.xoffset && usuario.mousex < getHuecoX(hueco, usuario.usuarioID)+hueco.xoffset+hueco.width
          && usuario.mousey > getHuecoY(hueco, usuario.usuarioID)+hueco.yoffset && usuario.mousey < getHuecoY(hueco, usuario.usuarioID)+hueco.yoffset+hueco.height;
     }
     else return false;
}

function getCartaUsuario(carta, usuarioID) {
     if (carta.cartaUsuario[0].usuarioID == usuarioID) return carta.cartaUsuario[0];
     else return carta.cartaUsuario[1];
}

function getHuecoUsuario(hueco, usuarioID) {
     if (hueco.huecoUsuario[0].usuarioID == usuarioID) return hueco.huecoUsuario[0];
     else return hueco.huecoUsuario[1];
}

// Nos indica si el usuario que consulta está consultando una carta de su lado (normal) o no
function isLadoNormal(partida, iCarta, usuarioID) {
     if (iCarta <= 30) {
          return partida.usuarios[0].usuarioID == usuarioID;
     }
     else {
          return partida.usuarios[1].usuarioID == usuarioID;
     }
}

// Obtenemos el hueco en el lado normal, si la carta es tuya, o en el lado alterado, si es del rival
function getHuecoOcupadoPorLado(partida, iCarta, usuarioID) {
     var isTuLado = isLadoNormal(partida, iCarta, usuarioID);
     var huecoOcupado = partida.cartas[iCarta].huecoOcupado;

     // Si es tu lado, devuelve el hueco sin problemas
     if (isTuLado) return huecoOcupado;
     // Si es el lado rival... debes moverlas a su lado
     else {
          // Si están en el Ejército, devuelve -1, pues no deben mostrarse ni interactuarse de ninguna forma
          if (huecoOcupado <= 30) return -1;
          // Si no, reajusta para el lado rival
          else {
               return huecoOcupado+62;
          }
     }
}

function isHuecoOcupado(usuario, partida, jHueco) { // ¿Está el hueco ocupado? Iteramos por todas las cartas para ahorrarnos guardar la variable ocupado
     return getICarta(usuario, partida, jHueco) != -1;
}

function getICarta(usuario, partida, jHueco) { // Si está ocupado el hueco, obtiene qué carta es
     for (var i = 0; i < nCartas; ++i) {
          if (getHuecoOcupadoPorLado(partida, i, usuario.usuarioID) == jHueco) return i;
     }
     return -1;
}

function getCartaXOffset(carta, hueco) {
     if (hueco.vert) return 0;
     else {
          if (carta.angle == 0 || carta.angle == 180) return 0;
          else return offset;
     }
}

function getCartaYOffset(carta, hueco) {
     if (hueco.vert) return 0;
     else {
          if (carta.angle == 0 || carta.angle == 180) return offset;
          else return 0;
     }
}

function getCartaWidth(carta) {
     if (carta.angle == 0 || carta.angle == 180) return cartaHeight;
     else return cartaWidth;
}

function getCartaHeight(carta) {
     if (carta.angle == 0 || carta.angle == 180) return cartaWidth;
     else return cartaHeight;
}

function getHuecoX(hueco, usuarioID) {
     if (hueco.huecoUsuario[0].usuarioID == usuarioID) return hueco.huecoUsuario[0].x;
     else return hueco.huecoUsuario[1].x;
}

function getHuecoY(hueco, usuarioID) {
     if (hueco.huecoUsuario[0].usuarioID == usuarioID) return hueco.huecoUsuario[0].y;
     else return hueco.huecoUsuario[1].y;
}

// Devuelve los huecos iniciales de las cartas al crear y unirte a partida
function getHuecosInicialesCartas(start) {
     var huecos = "";
     for (var i = start; i < (start+nCartas/2); ++i) {
          huecos += conCeros(i);
     }
     return huecos;
}

// Dado un array de id's de cartas y datos de cartas, devuelve concatenados sus PV
function getPVsDeCartas(array, cartas) {
     var pvs = "";
     for (var i = 0; i < array.length; ++i) { // Para cada carta, tenemos que obtener sus datos y enviarlos a la llamada
          for (var j = 0; j < cartas.length; ++j) {
               if (cartas[j].cartaID == Number(array[i])) {
                    pvs += cartas[j].cartaPV;
               }
          }
     }
     return pvs;
}

function getSesion(usuarioID) {
     for (var i = 0; i < sesiones.length; ++i) {
          if (sesiones[i].usuarioID == usuarioID) return sesiones[i];
     }
     return null;
}

//############################################################################################################################################################################################################################
//#################################### MÉT-ODOS CALCULADORES ############################################################################################################################################################
//############################################################################################################################################################################################################################

function angular(angle) {
     var ang = angle;
     while (ang >= 360) ang -= 360;
     while (ang < 0) ang += 360;
     return ang;
}

function tiendeAX(value, x, inc) {
     if (value < x) return Math.min(value+inc, x);
     else if (value > x) return Math.max(value-inc, x);
     else return value;
}

function inRange(val, x, y) { // ¿Está Val entre x e y?
     return val >= x && val <= y;
}

function pointDirection(x1, y1, x2, y2) {
    var angle = 360 - Math.atan2(y1-y2, x1-x2)*180/Math.PI;

    if (angle < 0){
        angle += 360;
    }
     else if (angle >= 360){
        angle -= 360;
    }

    return angle;
}

function angleDifference(x, y) {
     var a = x*Math.PI/180;
     var b = y*Math.PI/180;
     return -Math.atan2(Math.sin(a-b), Math.cos(a-b))*180/Math.PI;
}

function absAngleDifference(x, y) {
     var a = x*Math.PI/180;
     var b = y*Math.PI/180;
     return Math.abs(Math.atan2(Math.sin(a-b), Math.cos(a-b))*180/Math.PI);
}

function conCeros(i) {
     if (i <= 9) return "00" + i;
     else if (i <= 99) return "0" + i;
     else return i;
}

//############################################################################################################################################################################################################################
//#################################### LOS DATOS DE LAS CARTAS ###############################################################################################################################################################
//############################################################################################################################################################################################################################

// Dado un usuarioID y parámetros del mazo deseado (TODO) devuelve la lista de ID's de las cartas
function getListaCartas(baraja, modo) {
     var arr;
     if (baraja == "Raziel") arr = [
          "0000", "0001", "0002", "0002", "0003", "0004", "0005", "0005", "0005", "0006", "0007", "0007", "0007", "0008", "0009", "0010",
          "0011", "0012", "0013", "0014", "0015", "0016", "0016", "0017", "0017", "0018", "0019", "0020", "0020", "0020", "0020"
     ];
     else if (baraja == "Saleh") arr = [
          "0021", "0022", "0023", "0024", "0025", "0026", "0027", "0028", "0029", "0030", "0031", "0032", "0033", "0034", "0035", "0036",
          "0037", "0038", "0039", "0040", "0041", "0042", "0043", "0044", "0045", "0046", "0047", "0048", "0049", "0050", "0051"
     ];

     if (modo == "junto") return arr.join('');
     else if (modo == "comas") return arr.join(',');
     else return arr;
}

//#############################################################################################################################################################################################
//#################################### ACCESOS A BASE DE DATOS ################################################################################################################################
//#############################################################################################################################################################################################

// En base al usuario leído realiza acciones
function doFromUsuario(func, socket, data) {
     pool.getConnection((errDoFromUsuario, con) => {
          if (errDoFromUsuario) throw errDoFromUsuario;
          con.query("select * from Usuarios where usuarioID = '" + data.usuarioID + "';", (errSelectDoFromUsuario, resultSelectDoFromUsuario) => {
               if (errSelectDoFromUsuario) throw errSelectDoFromUsuario;
               var cuenta = null;
               if (resultSelectDoFromUsuario.length > 0) {
                    cuenta = resultSelectDoFromUsuario[0];
               }
               func(socket, cuenta, data);
          });
          con.release();
     });
}

// Inicia sesión con los datos recuperados de la ventana, o registra el usuario si no existe
function iniciarSesion(socket, cuenta, data) {
     if (cuenta != null) {
          // Inicio de sesión exitoso
          if (cuenta.usuarioPass == data.usuarioPass) {
               socket.emit('login');
               socket.emit('nuevoMensaje', {mid:1000, desc:null});
               setSesion(data.usuarioID, data.usuarioPass);

               // Mostramos las partidas del usuario
               pool.getConnection((errIniciarSesion, con) => {
                    if (errIniciarSesion) throw errIniciarSesion;
                    con.query("select partidaID from Partidas where partidaCreadorUsuarioID = '" + cuenta.usuarioID + "' or partidaRivalUsuarioID = '" + cuenta.usuarioID + "';", (errSelectIniciarSesion, resultSelectIniciarSesion) => {
                         if (errSelectIniciarSesion) throw errSelectIniciarSesion;
                         for (i = 0; i < resultSelectIniciarSesion.length; ++i) {
                              socket.emit('nuevaPartidaConsultada', {partidaID:resultSelectIniciarSesion[i].partidaID});
                         }
                    });
                    con.release();
               });
          }
          else {
               addIntentoFallido(data.usuarioID, data.usuarioPass);
               socket.emit('nuevoMensaje', {mid:1001, desc:null});
          }
     }
     // Registramos la cuenta
     else {
          pool.getConnection((errIniciarSesionElse, con) => {
               if (errIniciarSesionElse) throw errIniciarSesionElse;
               con.query("insert into Usuarios (usuarioID, usuarioPass) values ('" + data.usuarioID + "', '" + data.usuarioPass + "');");
               con.release();
          });
          socket.emit('nuevoMensaje', {mid:1002, desc:null});
     }
}

// Dado un usuario correcto (o no) en la cuenta, viniéndonos un partidaID y un barajaID del data, creamos partida si no existe, o la continuamos
function crearPartida(socket, cuenta, data) {
     // Usuario correcto, lo asignamos a una nueva partida
     if (cuenta != null && cuenta.usuarioPass == data.usuarioPass) {
          pool.getConnection((errCrearPartida, con) => {
               if (errCrearPartida) throw errCrearPartida;
               con.query("select * from Partidas where partidaID = '" + data.partidaID + "';", (errSelectCrearPartida, resultSelectCrearPartida) => {
                    if (errSelectCrearPartida) throw errSelectCrearPartida;

                    if (resultSelectCrearPartida.length == 0) { // Si no existe la partida, la crea, y luego simplemente cargamos las cartas al tablero desde BD
                         var ids = getListaCartas(data.barajaID, "junto");
                         var hcs = getHuecosInicialesCartas(0);
                         var pvs = getPVsDeCartas(getListaCartas(data.barajaID, ""), infoCartas);
                         var angles = "";
                         for (var i = 0; i < 31; ++i) {
                              angles += "090090";
                              pvs += "0";
                              hcs += "0-1";
                              ids += "00-1";
                         }
                         con.query("insert into Partidas (partidaID, partidaCreadorUsuarioID, partidaRivalUsuarioID, partidaCartasID, partidaCartasHueco, partidaCartasPV, partidaCartasAngle) values ('"
                              + data.partidaID + "', '" + cuenta.usuarioID + "', null, '" + ids + "', '" + hcs + "', '" + pvs + "', '" + angles + "');", (errSelectCrearPartida3, r) => {
                              if (errSelectCrearPartida3) throw errSelectCrearPartida3;
                              cargarCartas(socket, data, pvs, true, 0);
                         });
                    }
                    else { // Si ya ha sido creada...
                         // Si eres creador o rival, simplemente cargamos las cartas al tablero desde BD
                         if (resultSelectCrearPartida[0].partidaCreadorUsuarioID == cuenta.usuarioID || resultSelectCrearPartida[0].partidaRivalUsuarioID == cuenta.usuarioID) {
                              socket.emit('partidaIniciada');
                              setSesion(data.usuarioID, data.usuarioPass);

                              for (var i = 0; i < nPartidas; ++i) {
                                   if (partidas[i].partidaID == data.partidaID) {
                                        if (partidas[i].usuarios[0].usuarioID == data.usuarioID) {
                                             partidas[i].usuarios[0].cargaImagenesHuecos = 1;
                                             partidas[i].usuarios[0].cargaImagenesCartas = 1;
                                             partidas[i].usuarios[0].cargaImagenesMenus = 1;
                                        }
                                        else {
                                             partidas[i].usuarios[1].cargaImagenesHuecos = 1;
                                             partidas[i].usuarios[1].cargaImagenesCartas = 1;
                                             partidas[i].usuarios[1].cargaImagenesMenus = 1;
                                        }
                                   }
                              }
                         }
                         // Si hay hueco para rival y no eres creador, te unes a ella y asignas tu mazo...
                         else if (resultSelectCrearPartida[0].partidaCreadorUsuarioID != cuenta.usuarioID && resultSelectCrearPartida[0].partidaRivalUsuarioID == null) {
                              var ids = resultSelectCrearPartida[0].partidaCartasID.substring(0, 31*4) + getListaCartas(data.barajaID, "junto");
                              var hcs = resultSelectCrearPartida[0].partidaCartasHueco.substring(0, 31*3) + getHuecosInicialesCartas(nCartas/2);
                              var pvs = resultSelectCrearPartida[0].partidaCartasPV.substring(0, 31*1) + getPVsDeCartas(getListaCartas(data.barajaID, ""), infoCartas);
                              var angles = resultSelectCrearPartida[0].partidaCartasAngle.substring(0, 31*3);
                              for (var i = 0; i < 31; ++i) {
                                   angles += "090";
                              }
                              con.query("update Partidas set partidaRivalUsuarioID = '" + cuenta.usuarioID + "', partidaCartasID = '" + ids + "', partidaCartasHueco = '"
                              + hcs + "', partidaCartasPV = '" + pvs + "', partidaCartasAngle = '" + angles + "' where partidaID = '" + data.partidaID + "';", (errSelectCrearPartida3, r) => {
                                   if (errSelectCrearPartida3) throw errSelectCrearPartida3;
                                   cargarCartas(socket, data, pvs, false, 31);
                              });
                         }
                         // En cualquier otro caso muestra mensaje de que no puedes entrar a esta partida
                         else {
                              socket.emit('nuevoMensaje', {mid:1004, desc:null});
                              entrar = false;
                         }
                    }
               });
               con.release();
          });
     }
     // Usuario incorrecto, no puede crear una Partida
     else {
          addIntentoFallido(data.usuarioID, data.usuarioPass);
          socket.emit('nuevoMensaje', {mid:1003, desc:null});
     }
}

// Cargamos las cartas de base de datos al campo. Ocurre tanto al crearlo como en cada cargada
function cargarCartas(socket, data, pvs, crea, iStart) {
     pool.getConnection((errCargarCartas, con) => {
          if (errCargarCartas) throw errCargarCartas;
          var arrayS = getListaCartas(data.barajaID, "comas"); // Obtenemos el array de id's de cartas, puede haber repeticiones
          // Buscamos todas las cartas. No habrá repeticiones, pero obtenemos sus datos
          iAsignaCarta = 0;
          var array = getListaCartas(data.barajaID, ""); // Obtenemos el array de id's de cartas, puede haber repeticiones

          nuevaPartida(data, crea);
          socket.emit('partidaIniciada');
          setSesion(data.usuarioID, data.usuarioPass);

          // Aquí la partida ya existe o ha sido creada. La buscamos y le asignamos "cargaImagenes" a true para que en su primer ciclo cargue t-odo.
          var iPartida = -1;
          for (var i = 0; i < nPartidas; ++i) {
               if (partidas[i].partidaID == data.partidaID) {
                    iPartida = i;
                    partidas[i].usuarios[0].cargaImagenesHuecos = 1;
                    partidas[i].usuarios[0].cargaImagenesCartas = 1;
                    partidas[i].usuarios[0].cargaImagenesMenus = 1;
                    partidas[i].usuarios[1].cargaImagenesHuecos = 1;
                    partidas[i].usuarios[1].cargaImagenesCartas = 1;
                    partidas[i].usuarios[1].cargaImagenesMenus = 1;
               }
          }

          iAsignaCarta = iStart;

          // Asigna a todas las cartas de qué lado son cada usuario
          var ind = 0;
          if (partidas[iPartida].cartas[0].cartaUsuario[0].usuarioID != "" && partidas[iPartida].cartas[0].cartaUsuario[0].usuarioID != data.usuarioID) ind = 1;
          for (var i = 0; i < nCartas; ++i) {
               partidas[iPartida].cartas[i].cartaUsuario[ind].usuarioID = data.usuarioID;
          }

          for (var i = 0; i < array.length; ++i) {
               // En base a un bucle de la lista (cartas repetidas) obtenemos los datos de la query 3 (sin repetir)
               // Dado el cartaID del array, debemos buscar coincidencia en result2 y pasar esos datos
               for (var j = 0; j < infoCartas.length; ++j) {
                    if (Number(array[i]) == infoCartas[j].cartaID) {
                         modificaCarta(partidas[iPartida],
                              Number(array[i]), pvs.substring(i, i+1), infoCartas[j].cartaRango,
                              infoCartas[j].cartaClase, 'sprClase' + infoCartas[j].cartaClase,
                              'sprEspecie' + infoCartas[j].cartaEspecie, 'sprElemento' + infoCartas[j].cartaElemento
                         );
                         break;
                    }
               }
          }

          // Nos asignamos los huecos
          for (var j = 0; j < nHuecos; ++j) {
               partidas[iPartida].huecos[j].huecoUsuario[ind].usuarioID = data.usuarioID;
          }
     });
}

// Esto se ejecuta UNA SOLA VEZ, una por creador y otra por rival, para cargar las cartas
function modificaCarta(partida, cid, pv, rango, clase, sprClase, sprEspecie, sprElemento) {
     partida.cartas[iAsignaCarta].cid = cid;
     partida.cartas[iAsignaCarta].rango = rango;
     partida.cartas[iAsignaCarta].pv = pv;
     partida.cartas[iAsignaCarta].pvmax = pv;
     partida.cartas[iAsignaCarta].clase = clase;
     partida.cartas[iAsignaCarta].sprClase = sprClase;
     partida.cartas[iAsignaCarta].sprEspecie = sprEspecie;
     partida.cartas[iAsignaCarta].sprElemento = sprElemento;
     partida.cartas[iAsignaCarta].general = iAsignaCarta == 0 || iAsignaCarta == 31;

     var iHueco = iAsignaCarta;
     if (iHueco >= 31) iHueco -= 31;
     partida.cartas[iAsignaCarta].huecoOcupado = iHueco;

     ++iAsignaCarta;
}

// En base al usuario y partida leídos realiza acciones asíncronas
function doFromUsuarioYPartida(func, socket, data) {
     pool.getConnection((errDoFromUsuarioYPartida, con) => {
          if (errDoFromUsuarioYPartida) throw errDoFromUsuarioYPartida;
          con.query("select * from Usuarios where usuarioID = '" + data.usuarioID + "';", (errSelectDoFromUsuarioYPartida, resultSelectDoFromUsuarioYPartida) => {
               if (errSelectDoFromUsuarioYPartida) throw errSelectDoFromUsuarioYPartida;
               if (resultSelectDoFromUsuarioYPartida.length > 0 && resultSelectDoFromUsuarioYPartida[0].usuarioPass == data.usuarioPass) {
                    con.query("select * from Partidas where partidaID = '" + data.partidaID + "' and (partidaCreadorUsuarioID = '" + data.usuarioID + "' or partidaRivalUsuarioID = '" + data.usuarioID + "');", (errSelectDoFromUsuarioYPartida2, resultSelectDoFromUsuarioYPartida2) => {
                         if (errSelectDoFromUsuarioYPartida2) throw errSelectDoFromUsuarioYPartida2;
                         if (resultSelectDoFromUsuarioYPartida2.length > 0) {
                              setSesion(data.usuarioID, data.usuarioPass);
                              continueFromUsuarioYPartidaChecked(func, socket, data);
                         }
                    });
               }
          });
          con.release();
     });
}

// A este punto el usuario y la partida han sido validados
function continueFromUsuarioYPartidaChecked(func, socket, data) {
     var usuario = null;
     for (var i = 0; i < nPartidas; ++i) {
          if (partidas[i].partidaID == data.partidaID) {
               if (partidas[i].usuarios[0].usuarioID == data.usuarioID) usuario = partidas[i].usuarios[0];
               else if (partidas[i].usuarios[1].usuarioID == data.usuarioID) usuario = partidas[i].usuarios[1];
               if (usuario != null) func(socket, partidas[i], usuario, data);
          }
     }
}

// Evento al clicar el ratón
function setMousePress(socket, partida, usuario, data) {
     usuario.mousePress = data.mousePress;
}

// Evento al soltar el ratón
function setMouseRelease(socket, partida, usuario, data) {
     usuario.mouseRelease = data.mouseRelease;
}

// Evento al mover el ratón
function setMouseMove(socket, partida, usuario, data) {
     usuario.mousex = data.mousex;
     usuario.mousey = data.mousey;
}

// Añade la sesión si no existe
function setSesion(usuarioID, usuarioPass) {
     var encontrada = false;
     for (var i = 0; i < sesiones.length; ++i) {
          if (sesiones[i].usuarioID == usuarioID && sesiones[i].usuarioPass == usuarioPass) encontrada = true;
     }

     if (!encontrada) {
          var ses = new obSesion();
          ses.usuarioID = usuarioID;
          ses.usuarioPass = usuarioPass;
          ses.cont = 60*60*60; // 1 hora de sesión activa (aprox)
          sesiones.push(ses);
     }
}

// La sesión para el usuarioID y la partidaID está activa?
function isSesionActiva(usuarioID, usuarioPass, partidaID) {
     for (var i = 0; i < sesiones.length; ++i) {
          if (sesiones[i].usuarioID == usuarioID && sesiones[i].usuarioPass == usuarioPass) {
               for (var j = 0; j < nPartidas; ++j) {
                    if (partidas[j].partidaID == partidaID && (partidas[j].usuarios[0].usuarioID == usuarioID || partidas[j].usuarios[1].usuarioID == usuarioID)) return true;
               }
               return false;
          }
     }
     return false;
}

function isSesionActivaSoloUsuario(usuarioID, usuarioPass) {
     for (var i = 0; i < sesiones.length; ++i) {
          if (sesiones[i].usuarioID == usuarioID && sesiones[i].usuarioPass == usuarioPass) return true;
     }
     return false;
}

function isSesionBloqueada(usuarioID) {
     for (var i = 0; i < sesiones.length; ++i) {
          if (sesiones[i].usuarioID == usuarioID) return sesiones[i].bloqueada > 0;
     }
     return false;
}

function addIntentoFallido(usuarioID, usuarioPass) {
     for (var i = 0; i < sesiones.length; ++i) {
          if (sesiones[i].usuarioID == usuarioID && sesiones[i].usuarioPass != usuarioPass) {
               ++sesiones[i].intentosFallidos;
               if (sesiones[i].intentosFallidos >= 5) sesiones[i].bloqueada = 60*60*10; // Se bloquea durante 10 minutos
               break;
          }
     }
     return true;
}

// TODO hacer mét-odo para almacenar de la estructura partidas y usuarios hacia base de datos, y otro para traerlas de vuelta.
// La primera se ejecutaría cada X segundos y/o al realizar ciertas acciones, la segunda se haría cada vez que el server inicia.
