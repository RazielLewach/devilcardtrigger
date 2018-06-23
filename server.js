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
     //host:"eu-cdbr-west-02.cleardb.net", user:"bd0a2b4ce07342", password:"5e67cbaed168786", database:"heroku_8f53c8984463c5b"
     port:puertoSQL, host:"localhost", user:"root", password:"password", database:"dctdb"
});

pool.getConnection((errStart, con) => {
     if (errStart) throw errStart;
     console.log("¡Conectado a la base de datos!");

     // Gestiones de tablas
     //con.query("drop table if exists Cartas;", function (errDrop) {if (errDrop) throw errDrop; console.log("La tabla de Cartas ha sido borrada");});
     //con.query("drop table if exists Partidas;", function (errDrop) {if (errDrop) throw errDrop; console.log("La tabla de Partidas ha sido borrada");});
     //con.query("drop table if exists Usuarios;", function (errDrop) {if (errDrop) throw errDrop; console.log("La tabla de Usuarios ha sido borrada");});

     //con.query("create table if not exists Usuarios (usuarioID varchar(50) not null, usuarioPass varchar(50) not null, primary key (usuarioID));", function (errCreate) {if (errCreate) throw errCreate; console.log("La tabla de Usuarios ha sido creada");});
     //con.query("create table if not exists Partidas (partidaID varchar(50) not null, partidaCreadorUsuarioID varchar(50) not null, partidaRivalUsuarioID varchar(50), partidaCartasID varchar(248) not null, partidaCartasHueco varchar(186) not null, partidaCartasPV varchar(62) not null, primary key (partidaID), foreign key (partidaCreadorUsuarioID) references Usuarios(usuarioID), foreign key (partidaRivalUsuarioID) references Usuarios(usuarioID));", function (errCreate) {if (errCreate) throw errCreate; console.log("La tabla de Partidas ha sido creada");});
     //con.query("create table if not exists Cartas (cartaID int not null, cartaNombre varchar(50) not null, cartaPV int not null, cartaRango int not null, cartaClase varchar(1) not null, cartaEspecie varchar(1) not null, cartaElemento varchar(1) not null, primary key (cartaID));", function (errCreate) {if (errCreate) throw errCreate; console.log("La tabla de Cartas ha sido creada");});

     /*for (var i = 0; i <= 52; ++i) {
          con.query("delete from Cartas where cartaID = '" + i + "';", function (errDelete) {if (errDelete) throw errDelete; console.log("Carta borrada");});
     }*/

     /*var ica = 0;
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (0, '0', 4, 0, 'G', 'E', 'N');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (1, '1', 2, 1, 'V', 'A', 'N');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (2, '2', 2, 1, 'T', 'E', 'T');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (3, '3', 2, 1, 'T', 'E', 'N');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (4, '4', 2, 1, 'T', 'E', 'N');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (5, '5', 4, 0, 'V', 'A', 'N');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (6, '6', 1, 2, 'C', 'A', 'N');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (7, '7', 3, 1, 'V', 'E', 'N');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (8, '8', 2, 0, 'V', 'E', 'N');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (9, '9', 2, 0, 'T', 'A', 'T');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (10, '10', 2, 2, 'R', 'A', 'T');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (11, '11', 2, 3, 'R', 'E', 'T');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (12, '12', 3, 2, 'T', 'E', 'T');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (13, '13', 2, 3, 'A', 'A', 'N');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (14, '14', 3, 0, 'V', 'A', 'N');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (15, '15', 2, 1, 'C', 'E', 'N');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (16, '16', 2, 0, 'V', 'A', 'N');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (17, '17', 3, 4, 'A', 'A', 'N');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (18, '18', 2, 1, 'T', 'E', 'N');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (19, '19', 1, 0, 'V', 'A', 'T');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (20, '20', 2, 0, 'V', 'A', 'N');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});

     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (21, '21', 4, 0, 'G', 'I', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (22, '22', 1, 0, 'V', 'I', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (23, '23', 2, 0, 'V', 'H', 'E');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (24, '24', 2, 1, 'V', 'I', 'E');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (25, '25', 2, 1, 'T', 'I', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (26, '26', 3, 3, 'R', 'H', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (27, '27', 1, 0, 'V', 'I', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (28, '28', 4, 1, 'V', 'H', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (29, '29', 2, 2, 'C', 'I', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (30, '30', 3, 3, 'A', 'I', 'E');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (31, '31', 2, 1, 'T', 'H', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (32, '32', 2, 1, 'C', 'I', 'E');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (33, '33', 1, 0, 'V', 'I', 'E');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (34, '34', 3, 2, 'C', 'H', 'E');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (35, '35', 2, 2, 'R', 'H', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (36, '36', 2, 2, 'C', 'H', 'E');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (37, '37', 3, 2, 'T', 'I', 'E');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (38, '38', 2, 1, 'T', 'H', 'E');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (39, '39', 3, 1, 'T', 'H', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (40, '40', 2, 2, 'R', 'I', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (41, '41', 2, 1, 'T', 'I', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (42, '42', 2, 0, 'V', 'H', 'E');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (43, '43', 2, 1, 'T', 'H', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (44, '44', 2, 0, 'V', 'I', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (45, '45', 2, 0, 'T', 'I', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (46, '46', 2, 1, 'V', 'I', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (47, '47', 3, 0, 'V', 'H', 'E');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (48, '48', 2, 1, 'C', 'H', 'E');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (49, '49', 3, 4, 'A', 'I', 'F');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (50, '50', 2, 0, 'V', 'I', 'E');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     con.query("insert into Cartas (cartaID, cartaNombre, cartaPV, cartaRango, cartaClase, cartaEspecie, cartaElemento) values (51, '51', 2, 0, 'V', 'I', 'E');", function (errInsert) {if (errInsert) throw errInsert; ++ica; console.log("La carta número " + ica + " ha sido añadida");});
     */

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

// VARIABLES TEMPORALES DE DATOS EN ESTRUCTURAS COMPLEJAS QUE REQUIEREN ACCESO A BASE DE DATOS. LAS GUARDAMOS AQUI PARA UTILIZARLAS
var mousex = 0;
var mousey = 0;
var mousePress = false;
var mouseRelease = false;
var xCampo = 0;
var generalColocado = false;
var nComenzado = 0;
var comenzado = 0;
var candado = false;
var umbralTrigger = 0;
var trigger = 0;
var triggerGenerado = 0;
var swapLimbo = false;
var swapeando = 0;
var claseSeleccionada = '';
var nEjercitoRival = 0;
var spMenuA = new Array(); for (var i = 0; i < 8; ++i) spMenuA.push('');
var isMenu = false;
var imenu = 0;
var imenuDraw = 0;
var menuSeleccionado = 0;
var menuScale = 0;
var cartas = new Array(); for (var i = 0; i < nCartas; ++i) cartas.push(new obCarta());
var cartaDrawID = 0;
var huecos = new Array(); for (var i = 0; i < nHuecos; ++i) huecos.push(new obHueco(0, 0, 0, false));
var sprLimboBoton = '';
var cargaImagenes = false;

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
     generaGridDeHuecos(this.huecos, 1, 340, 510, 1, 1, cartaHeight-25, cartaHeight+10, false); // General
     //
     generaGridDeHuecos(this.huecos, 1, 48, 419, 1, 4, cartaHeight-25, cartaHeight+10, false); // Fila superior L
     generaGridDeHuecos(this.huecos, 1, 308, 410, 1, 2, cartaHeight-25, cartaHeight+10, false); // Fila superior M
     generaGridDeHuecos(this.huecos, 1, 438, 419, 1, 4, cartaHeight-25, cartaHeight+10, false); // Fila superior R
     //
     generaGridDeHuecos(this.huecos, 1, 0, 510, 1, 5, cartaHeight-25, cartaHeight+10, false); // Fila intermedia L
     generaGridDeHuecos(this.huecos, 1, 420, 510, 1, 5, cartaHeight-25, cartaHeight+10, false); // Fila intermedia R
     //
     generaGridDeHuecos(this.huecos, 1, 48, 601, 1, 4, cartaHeight-25, cartaHeight+10, false); // Fila inferior L
     generaGridDeHuecos(this.huecos, 1, 308, 610, 1, 2, cartaHeight-25, cartaHeight+10, false); // Fila inferior M
     generaGridDeHuecos(this.huecos, 1, 438, 601, 1, 4, cartaHeight-25, cartaHeight+10, false); // Fila inferior R
     // Limbo tuyo
     generaGridDeHuecos(this.huecos, 2, 1100, 420, 1, 10, cartaHeight-25, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 2, 1145, 510, 1, 10, cartaHeight-25, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 2, 1100, 600, 1, 10, cartaHeight-25, cartaHeight+10, false);
     // Vanguardia + Reserva tuya
     generaGridDeHuecos(this.huecos, 0, 10, 210, 2, 3, cartaHeight+10, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 0, 360, 210, 2, 3, cartaHeight+10, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 0, 710, 210, 2, 2, cartaHeight+10, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 0, 930, 210, 2, 2, cartaHeight+10, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 0, 1180, 210, 2, 3, cartaHeight+10, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 0, 1530, 210, 2, 3, cartaHeight+10, cartaHeight+10, false);
     // Limbo rival
     generaGridDeHuecos(this.huecos, 2, 1100, 420, 1, 10, cartaHeight-25, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 2, 1145, 510, 1, 10, cartaHeight-25, cartaHeight+10, false);
     generaGridDeHuecos(this.huecos, 2, 1100, 600, 1, 10, cartaHeight-25, cartaHeight+10, false);
     // Vanguardia + Reserva rival
     generaGridDeHuecos(this.huecos, 0, 10, 110, 2, 3, cartaHeight+10, cartaHeight+10, true);
     generaGridDeHuecos(this.huecos, 0, 360, 110, 2, 3, cartaHeight+10, cartaHeight+10, true);
     generaGridDeHuecos(this.huecos, 0, 710, 110, 2, 2, cartaHeight+10, cartaHeight+10, true);
     generaGridDeHuecos(this.huecos, 0, 930, 110, 2, 2, cartaHeight+10, cartaHeight+10, true);
     generaGridDeHuecos(this.huecos, 0, 1180, 110, 2, 3, cartaHeight+10, cartaHeight+10, true);
     generaGridDeHuecos(this.huecos, 0, 1530, 110, 2, 3, cartaHeight+10, cartaHeight+10, true);
}

function obUsuario() {
     // Funcionamiento básico de los usuarios y la partida
     this.usuarioID = "";
     this.mousePress = false; // click pulsado actualmente
     this.mouseRelease = false; // Click alzado actualmente
     this.mousex, this.mousey; // Coordenadas del ratón
     this.xCampo = 0; // Desplaza el campo horizontalmente
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
     // Las cartas
     this.cartaDrawID = -1; // La carta gigante
     // Los huecos
     this.sprLimboBoton = ""; // Eso
}


// Las cartas

function obCarta() {
	this.cid = -1; // El sprite
	this.x = 0; // La coordenada x
	this.y = 0; // La coordenada y
	this.xstart = 0; // Coordenadas iniciales
	this.ystart = 0; // That
	this.pv = 0; // Los PV actuales
	this.pvmax = 0; // Los PV máximos
	this.seleccionada = false; // ¿Está el mouse encima?
	this.pulsada = false; // ¿Le has hecho click?
	this.xoff = 0; // Al clicar, el x respecto al borde, para arrastrar bien
	this.yoff = 0; // Igual con la y
	this.huecoOcupado = -1; // índice del hueco ocupado
	this.width = cartaWidth;
	this.height = cartaHeight;
	this.angle = 90;
	this.angleDraw = 90; // Para dibujo gradual
	this.xpress = 0; // Coordenadas al clicar
	this.ypress = 0;
	this.xoffset = 0;
	this.yoffset = 0;
	this.volteada = false; // ¿Está volteada?
	this.general = false; // ¿Es General?
	this.rango = 0; // El Rango de la Criatura
	this.clase = ''; // La clase
	this.sprClase = ""; // Cuál de las 6 Clases es (A, R, C, G, V, X = General)
	this.sprEspecie = ""; // Cuál de las 6 Espécies es (H, B, E, A, D, I, M)
	this.sprElemento = ""; // Cuál de los 6 Elementos es (F, R, S, L, G, T, N)
}

// Los huecos

function obHueco(ind, x, y, vert) {
	this.ind = ind; // ¿Vanguardia (0), Ejército (1), Limbo (2)?
	this.x = x; // La coordenada x
	this.y = y; // La coordenada y
	this.ocupado = false; // ¿Tiene carta ocupando?
	this.image = "sprCartaHueco";
	this.width = cartaHeight;
	this.height = cartaHeight;
	this.xoffset = 0;
	this.yoffset = 0;
	this.vert = vert;
	this.xstart = this.x; // Coordenadas iniciales básicas
	this.ystart = this.y;
	this.icarta = -1; // id de la carta anexada (i)

	if (vert) {
		this.image = "sprCartaHuecoVert";
		this.width = cartaWidth;
		this.x += offset;
		this.xstart += offset;
	}

	if (ind == 1) { // Los 31 huecos del Ejército se consideran ocupados
		this.ocupado = true;
	}
}

function generaGridDeHuecos(objeto, ind, x, y, nRow, nCol, sepW, sepH, resUp) {
	for (var i = 0; i < nRow; ++i) {
		for (var j = 0; j < nCol; ++j) {
			objeto.push(new obHueco(ind, x+j*sepW, y+i*sepH*(1 - 2*resUp), i == 1 || nRow == 1 || nCol == 1));
		}
	}
}

//############################################################################################################################################################################################################################
//#################################### TRUCOS PARA TESTEOS ###################################################################################################################################################################
//############################################################################################################################################################################################################################

//asignaCartasRaziel(0);
//asignaCartasSaleh(0);

/*generalColocado = true;
nComenzado = 2;
comenzado = true;

cartas[0].huecoOcupado = 61;
huecos[61].ocupado = true;
huecos[61].icarta = 0;
cartas[1].huecoOcupado = 62;
huecos[62].ocupado = true;
huecos[62].icarta = 1;
cartas[2].huecoOcupado = 63;
huecos[63].ocupado = true;
huecos[63].icarta = 2;
huecos[0].ocupado = false;
huecos[1].ocupado = false;
huecos[2].ocupado = false;*/

//#############################################################################################################################################################################################
//#################################### CONEXIÓN INICIAL, RECIBIR SEÑALES DEL CLIENTE PARA ENVIARLAS DE VUELTA #######################################################################################################################################
//#############################################################################################################################################################################################

// Llamada inicial cada vez que un usuario conecta. También definimos los métodos del socket
io.on('connection', (socket) => {
     console.log('Nuevo usuario conectado');

     socket.on('mousePress', (data) => {
          var dataAux = data;
          dataAux.mousePress = true;
          doFromUsuarioYPartida(setMousePress, socket, dataAux);
     });

     socket.on('mouseRelease', (data) => {
          var dataAux = data;
          dataAux.mouseRelease = true;
          doFromUsuarioYPartida(setMouseRelease, socket, dataAux);
     });

     socket.on('mouseMove', (data) => {
          doFromUsuarioYPartida(setMouseMove, socket, data);
     });

     // Iniciamos sesión o registramos el usuario
     socket.on('iniciarSesion', (data) => {
          doFromUsuario(iniciarSesion, socket, data);
     });

     // Crear partida
     socket.on('crearPartida', (data) => {
          doFromUsuario(crearPartida, socket, data);
     });

     socket.on('unirseAPartida', (data) => {
          doFromUsuario(unirseAPartida, socket, data);
     });

     socket.on('main', (data) => { // De aquí leer el ID del que lo llama para saber qué cliente es
          doFromUsuarioYPartida(getAllVariables, socket, data);

          // En cada step, enviamos las imágenes a cargar sólo cuando toca
          // Gestionar que CADA VEZ QUE UN USUARIO CREA/SE UNA A UNA PARTIDA, ASIGNAR CARGAIMAGENES A TRUE PARA QUE LAS CARGUE EN SU SIGUIENTE MAIN.
          if (cargaImagenes) {
               cargarImagenesHuecos(socket);
               cargarImagenesCartas(socket);
               cargarImagenesMenus(socket);
               cargaImagenes = false;
          }

          gestionHuecos(socket, data);
          gestionSwapLimbo(socket, data);
          gestionCartas(socket, data);
          gestionCartaSeleccionada(socket, data);
          gestionArrastrarCarta(socket, data);
          gestionMenu(socket, data);
          gestionCandado(socket, data);
          gestionTrigger(socket, data);
          gestionNuevoTurno(socket, data);

          // Los arrays de huecos y cartas
          /*var hue = new Array();
          for (j = 0; j < nHuecos; ++j) {
               hue.push({hue:huecos[j].image, x:huecos[j].x, y:huecos[j].y, width:huecos[j].width, height:huecos[j].height, ocupado:huecos[j].ocupado, vert:huecos[j].vert});
          }

          var car = new Array();
          for (j = 0; j < nCartas; ++j) {
               car.push({car:cartas[i].cid, cla:cartas[i].sprClase, esp:cartas[i].sprEspecie, ele:cartas[i].sprElemento,
               x:cartas[j].x, y:cartas[j].y, huecoOcupado:cartas[j].huecoOcupado, volteada:cartas[j].volteada, angleDraw:cartas[j].angleDraw,
               xoffset:cartas[j].xoffset, yoffset:cartas[j].yoffset, width:cartas[j].width, height:cartas[j].height, general:cartas[j].general,
               pv:cartas[j].pv, pvmax:cartas[j].pvmax, seleccionada:cartas[j].seleccionada});
          }*/

          // Enviamos la señal
          socket.emit('main', {
               hue:huecos, car:cartas, men:spMenuA, generalColocado:generalColocado, comenzado:comenzado, candado:candado, xCampo:xCampo,
               cartaDrawID:cartaDrawID, menuScale:menuScale, imenuDraw:imenuDraw, umbralTrigger:umbralTrigger, triggerGenerado:triggerGenerado, trigger:trigger,
               sprLimboBoton:sprLimboBoton, nEjercitoRival:nEjercitoRival
          });

          mousePress = false;
          mouseRelease = false;

          doFromUsuarioYPartida(setAllVariables, socket, data);
     });
});

//############################################################################################################################################################################################################################
//#################################### FUNCIONES DE LÓGICA ##############################################################################################################################################################
//############################################################################################################################################################################################################################

function cargarImagenesHuecos(socket) {
     var hue = new Array();
     for (j = 0; j < nHuecos; ++j) {
          hue.push({hue:huecos[j].image});
     }
     socket.emit('cargarImagenesHuecos', {hue:hue});
}

function cargarImagenesCartas(socket) {
     var car = new Array();
     for (i = 0; i < nCartas; ++i) {
          car.push({car:cartas[i].cid, cla:cartas[i].sprClase, esp:cartas[i].sprEspecie, ele:cartas[i].sprElemento});
     }
     socket.emit('cargarImagenesCartas', {car:car});
}

function cargarImagenesMenus(socket) {
     socket.emit('cargarImagenesMenus', {men:spMenuA});
}

function gestionHuecos(socket, data) { // Simplemente gestión huecos
     for (var j = 0; j < nHuecos; ++j) {
          // Los huecos colocados acorde.
          // Si no es Limbo (gestión normal) o es Limbo pero -> es tuyo y no pide swapear o es del rival y pide swapear, posición normal
          if (huecos[j].ind == 2) {
               if (
                    (!swapLimbo && miCampo(j)) || (swapLimbo && !miCampo(j))
               ) {
                    huecos[j].x = tiendeAX(huecos[j].x, huecos[j].xstart + 50+xCampo, 40 + 1000*(swapeando == 0));
               }
               else {
                    huecos[j].x = tiendeAX(huecos[j].x, 2200 + 50+xCampo, 40 + 1000*(swapeando == 0));
               }
          }
          else {
               huecos[j].x = huecos[j].xstart + 50+xCampo;
          }

          // Las clases para comparar
          if (huecos[j].vert) huecos[j].image = "sprCartaHuecoVert";
          else huecos[j].image = "sprCartaHueco";

          if (!miCampo(j) && huecos[j].icarta != -1 && claseSeleccionada != '') {
               var efectivo = getEfectivo(claseSeleccionada, cartas[huecos[j].icarta].clase);
               if (efectivo == 1 || efectivo == 0) huecos[j].image = "sprCartaHuecoVerde";
               else if (efectivo == -1) huecos[j].image = "sprCartaHuecoRojo";
          }
     }

     if (swapeando > 0) --swapeando;
}

function gestionSwapLimbo(socket, data) {
     if (mousex > 1164+xCampo && mousex < 1164+xCampo+20 && mousey > 517 && mousey < 517+70) {
          if (!swapLimbo) {
               sprLimboBoton = "sprLimboBotonOnS";
          }
          else {
               sprLimboBoton = "sprLimboBotonOffS";
          }

          if (mousePress) {
               swapLimbo = !swapLimbo;
               swapeando = ctSwapeando;
          }
     }
     else {
          if (!swapLimbo) {
               sprLimboBoton = "sprLimboBotonOn";
          }
          else {
               sprLimboBoton = "sprLimboBotonOff";
          }
     }
}

function gestionCartas(socket, data) {
     for (var i = 0; i < nCartas; ++i) {
          if (cartas[i].huecoOcupado >= 0) {
               var idHueco = cartas[i].huecoOcupado;

               if (idHueco < 31) cartas[i].volteada = false;
               if (!generalColocado && idHueco > 0 && idHueco < 31) cartas[i].volteada = true;
               if (comenzado && idHueco < 31) cartas[i].volteada = true;
               if (idHueco < 31 && !candado) cartas[i].volteada = false;

               var dif = angleDifference(cartas[i].angleDraw, cartas[i].angle);
               cartas[i].angleDraw += Math.sign(dif)*Math.min(10, Math.abs(dif));
          }
     }
}

function gestionCartaSeleccionada(socket, data) { // Mostramos la carta seleccionada, comprobando si está el ratón encima de cada una
     // Crear variable local cartaDrawID para guardar la carta seleccionada y enviar el STRING al socket
     cartaDrawID = -1;
     for (var i = 0; i < nCartas; ++i) {
          cartas[i].seleccionada = false;
          if (isSeleccionada(cartas[i])) {
               cartaDrawID = cartas[i].cid;
               cartas[i].seleccionada = true;
          }
     }
}

function gestionArrastrarCarta(socket, data) { // Al clicar y mantener una carta, la arrastra
     for (var i = 0; i < nCartas; ++i) { // Para cada carta...
          if (isSeleccionada(cartas[i]) && mousePress) { // ... si tienes el ratón encima y pulsas, la marcas como agarrada
               if (generalColocado || (!generalColocado && cartas[i].general)) {
                    // Si está volteada y en el Ejército no dejamos arrastrar hasta colocar el General
                    if (miCampo(cartas[i].huecoOcupado)) {
                         // Sólo puedo interactuar si es mía
                         cartas[i].pulsada = true;
                         cartas[i].xoff = mousex-cartas[i].x;
                         cartas[i].yoff = mousey-cartas[i].y;
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
          else if (mouseRelease) {
               // Justo al soltarla, si está tocando un hueco, se ajusta a él
               if (cartas[i].pulsada) {
                    var dejada = false; // ¿La dejas sobre hueco?
                    for (var j = 0; j < nHuecos; ++j) { // Tomando la carta pulsada, para cada hueco...
                         if (isSeleccionada(huecos[j])) { // ... si estamos seleccionando ese hueco...
                              var jp = cartas[i].huecoOcupado; // Hueco previo
                              var swapea = huecos[j].ocupado && huecos[jp].ocupado && !huecos[jp].vert && !huecos[j].vert;
                              if (!huecos[j].ocupado || swapea) { // Swap de Vanguardia
                                   if (!cartas[i].general || (cartas[i].general && !huecos[j].vert)) {
                                        // Si está el candado restringe la invocación
                                        var invoca = candado && jp >= 61 && huecos[jp].vert && !huecos[j].vert;
                                        if (!invoca || (invoca && trigger >= cartas[i].rango)) {
                                             // Si está el candado restringue el desplazamiento
                                             var desplaza = candado && isDeUnaZonaAOtra(jp, j, true);
                                             if (!desplaza || (desplaza && !cartas[i].volteada && cartas[i].angle == 90)) {
                                                  // No interactúes con el campo rival
                                                  var tuCampo = miCampo(jp) && miCampo(j);
                                                  if (tuCampo) {
                                                       if (invoca) {
                                                            trigger -= cartas[i].rango;
                                                            socket.emit('nuevoMensaje', {mid:3, desc:cartas[i].rango}); // Trigger pagado por invocación
                                                       }
                                                       // Si viene boca abajo del Ejército, lo pone boca arriba
                                                       if (jp < 31) cartas[i].volteada = false;
                                                       if (!swapea) huecos[jp].ocupado = false; // Desocupa el anterior si no swapea
                                                       huecos[j].ocupado = true; // Lo ocupa
                                                       dejada = true;
                                                       if (!generalColocado) { // Comenzamos oficialmente la partida
                                                            generalColocado = true;
                                                            huecos[0].x = -9000;
                                                            huecos[0].xstart = -9000;
                                                       }
                                                       else { // Tras colocar el general, debemos colocar 2 criaturas fuera (no deja que sea el General a estas alturas)
                                                            if (jp < 31 && j >= 31) { // La colocamos fuera con éxito
                                                                 ++nComenzado;
                                                                 if (nComenzado == 2) comenzado = true;
                                                            }
                                                            else if (jp >= 31 && j < 31) { // Si eres graciosillo y la vuelves adentro lo tenemos en cuenta
                                                                 --nComenzado;
                                                            }
                                                       }
                                                       // Moverse de una zona a otra pone boca abajo en horizontal si hay candado
                                                       if (desplaza) {
                                                            cartas[i].volteada = true;
                                                            cartas[i].angle = 0;
                                                            cartas[i].xoffset = 0;
                                                            cartas[i].yoffset = offset;
                                                            cartas[i].width = cartaHeight;
                                                            cartas[i].height = cartaWidth;
                                                            socket.emit('nuevoMensaje', {mid:9, desc:null}); // Desplazas
                                                       }
                                                       // Swapear Criaturas de la Vanguardia
                                                       if (swapea) {
                                                            var is = huecos[j].icarta; // i siguiente
                                                            // Carta de la Vanguardia objetivo a la anterior Vanguardia
                                                            cartas[is].huecoOcupado = jp;
                                                            huecos[jp].icarta = is;
                                                       }

                                                       // Índices
                                                       var ls = getNVangRes(jp), rs = getNVangRes(j);

                                                       // Por defecto desocupamos ambos huecos de las Reservas
                                                       huecos[jp+ls].ocupado = false;
                                                       huecos[jp+ls].icarta = -1;
                                                       huecos[j+rs].ocupado = false;
                                                       huecos[j+rs].icarta = -1;

                                                       // Swapear Criaturas de las Reservas al mover entre Vanguardias
                                                       if (getZona(jp) > 0 && getZona(j) > 0) {
                                                            for (var k = 0; k < nCartas; ++k) {
                                                                 // Carta de la Reserva objetivo (si hay) a la anterior Reserva, sólo en caso de que el hueco objetivo esté vacío
                                                                 if (cartas[k].huecoOcupado == j+rs && huecos[j+rs].ocupado) {
                                                                      cartas[k].huecoOcupado = jp+ls;
                                                                      huecos[jp+ls].icarta = k;
                                                                      huecos[jp+ls].ocupado = true;
                                                                 }
                                                                 // Carta de la Reserva anterior (si hay) a la Reserva objetivo
                                                                 //else if (cartas[k].huecoOcupado == jp+ls && getZona(jp) == getZona(j)) {
                                                                 //     cartas[k].huecoOcupado = j+rs;
                                                                 //     huecos[j+rs].icarta = k;
                                                                 //     huecos[j+rs].ocupado = true;
                                                                 //}
                                                            }
                                                       }

                                                       // Oficializamos el nuevo hueco ocupado
                                                       cartas[i].huecoOcupado = j;
                                                       huecos[j].icarta = i;

                                                       // Al mover a un hueco no girable, lo pone en vertical y lo ajusta/resetea
                                                       if (huecos[j].vert) {
                                                            cartas[i].angle = 90;
                                                            cartas[i].xoffset = 0;
                                                            cartas[i].yoffset = 0;
                                                            cartas[i].width = cartaWidth;
                                                            cartas[i].height = cartaHeight;
                                                            cartas[i].pv = cartas[i].pvmax;
                                                            cartas[i].volteada = false;
                                                            if (imenu == i) {
                                                                 isMenu = false;
                                                            }
                                                       }
                                                       else {
                                                            if (cartas[i].angle == 90 || cartas[i].angle == 270) { // Al poner en hueco girable... dale offset hombre
                                                                 cartas[i].xoffset = offset;
                                                                 cartas[i].yoffset = 0;
                                                            }
                                                       }
                                                  }
                                                  else {
                                                       socket.emit('nuevoMensaje', {mid:12, desc:null}); // Interactuar con campo rival
                                                  }
                                             }
                                             else if (desplaza) {
                                                  socket.emit('nuevoMensaje', {mid:10, desc:null}); // No puede desplazar
                                             }
                                        }
                                        else if (invoca) {
                                             socket.emit('nuevoMensaje', {mid:4, desc:cartas[i].rango}); // Trigger para invocación no suficiente
                                        }
                                   }
                                   else {
                                        socket.emit('nuevoMensaje', {mid:1, desc:null}); // No puedes sacar el General de la Vanguardia
                                   }
                              }
                              else if (huecos[j].ocupado && cartas[i].huecoOcupado != j) {
                                   socket.emit('nuevoMensaje', {mid:11, desc:null}); // Hueco ocupado, no desplazas
                              }
                         }
                    }
                    if (!dejada) { // Si no encontraste hueco...
                         cartas[i].x = cartas[i].xstart;
                         cartas[i].y = cartas[i].ystart;
                    }

                    cartas[i].pulsada = false; // ... en cuanto sueltas el click se te va.
               }

               if (cartas[i].pulsada) {
                    cartas[i].xpress = 0;
                    cartas[i].ypress = 0;
               }
          }

          // Si está pulsada, la arrastramos
          if (cartas[i].pulsada) {
               cartas[i].x = mousex-cartas[i].xoff;
               cartas[i].y = mousey-cartas[i].yoff;
          }
          // Las coordenadas de las cartas, se arrastran automáticamente hasta el hueco
          else {
               // Excepto si están fuera
               if (cartas[i].huecoOcupado == -1) {
                    cartas[i].y = -100;
                    cartas[i].ystart = -100;
               }
               else {
                    cartas[i].x = huecos[cartas[i].huecoOcupado].x;
                    cartas[i].y = huecos[cartas[i].huecoOcupado].y;
                    cartas[i].xstart = huecos[cartas[i].huecoOcupado].x;
                    cartas[i].ystart = huecos[cartas[i].huecoOcupado].y
               }
          }
     }
}

function gestionMenu(socket, data) { // Todas las opciones del menú y su control
     for (var i = 0; i < nCartas; ++i) { // Para cada carta...
          if (isSeleccionada(cartas[i])) { // ... seleccionada que se puede girar ...
               if (mousePress && cartas[i].pulsada) {
                    // Si es tuya
                    if (miCampo(cartas[i].huecoOcupado)) {
                         cartas[i].xpress = cartas[i].x;
                         cartas[i].ypress = cartas[i].y;
                         if (menuSeleccionado == -1) {
                              isMenu = false;
                              claseSeleccionada = '';
                         }
                    }
                    else {
                         socket.emit('nuevoMensaje', {mid:12, desc:null}); // Toca tus cartas sólo
                    }
               }
               else if (mouseRelease && !huecos[cartas[i].huecoOcupado].vert) {
                    if (miCampo(cartas[i].huecoOcupado)) {
                         if (Math.abs(cartas[i].x-cartas[i].xpress) < 10 && Math.abs(cartas[i].y-cartas[i].ypress) < 10) {

                              // Ocultamos el menú si procede
                              if (isMenu && menuScale == 1) {
                                   // Si has pulsado sobre el mismo que está mostrando su menú y está mostrado, lo oculta.
                                   // Sólo si NO hay seleccionado ningún menú
                                   if (menuSeleccionado == -1) {
                                        isMenu = false;
                                        imenu = i;
                                        claseSeleccionada = '';
                                   }
                              }
                              // Mostramos el menú en caso contrario
                              else if (!isMenu && menuScale == 0) {
                                   isMenu = true
                                   imenu = i;
                                   claseSeleccionada = cartas[i].clase;
                              }
                         }
                    }
                    else {
                         socket.emit('nuevoMensaje', {mid:12, desc:null}); // No tocar el campo rival
                    }
               }
          }

          // Seleccionamos las opciones del menú
          if (mousePress && isMenu && i == imenu) {

               if (menuSeleccionado == 0) { // Restar PV
                    cartas[i].pv = Math.max( cartas[i].pv-1, 0);
               }
               else if (menuSeleccionado == 1) { // Girar
                    // Si el candado está ACTIVADO no deja rotarla boca abajo
                    if (!candado || candado && !cartas[i].volteada) {
                         cartas[i].angle -= 90;
                         if (cartas[i].angle <= -90) cartas[i].angle = 270;

                         if (cartas[i].angle == 90 || cartas[i].angle == 270) {
                              cartas[i].xoffset = offset;
                              cartas[i].yoffset = 0;
                              cartas[i].width = cartaWidth;
                              cartas[i].height = cartaHeight;
                         }
                         else {
                              cartas[i].xoffset = 0;
                              cartas[i].yoffset = offset;
                              cartas[i].width = cartaHeight;
                              cartas[i].height = cartaWidth;
                         }
                    }
                    else {
                         if (cartas[i].angle == 90 || cartas[i].angle == 270) {
                              socket.emit('nuevoMensaje', {mid:7, desc:null}); // No rotar sacrificada
                         }
                         else {
                              socket.emit('nuevoMensaje', {mid:8, desc:null}); // No rotar desplazada
                         }
                    }
               }
               else if (menuSeleccionado == 2) { // Voltear
                    if (!candado || candado && !cartas[i].volteada) {
                         cartas[i].volteada = !cartas[i].volteada;

                         // Si el candado está ACTIVADO, funcionalidad sacrificio, sumamos Trigger acorde y siempre la pone en vertical
                         if (candado && cartas[i].volteada) {
                              cartas[i].angle = 90;
                              var dif = umbralTrigger - triggerGenerado;
                              var ganar = Math.min(cartas[i].rango+1, dif);
                              trigger += ganar;
                              triggerGenerado += ganar;
                              socket.emit('nuevoMensaje', {mid:2, desc:ganar}); // Trigger ganado por sacrificio
                         }
                    }
                    else {
                         if (cartas[i].angle == 90) {
                              socket.emit('nuevoMensaje', {mid:5, desc:null}); // No deja voltear sacrificada
                         }
                         else if (cartas[i].angle == 0) {
                              socket.emit('nuevoMensaje', {mid:6, desc:null}); // No deja voltear desplazada
                         }
                    }
               }
               else if (menuSeleccionado == 3) { // Sumar PV
                    cartas[i].pv = Math.min( cartas[i].pv+1, cartas[i].pvmax);
               }
          }
     }

     // Animación de menú gradual al aparecer/irse
     if (isMenu) {
          menuScale = Math.min(menuScale+0.05, 1);
          imenuDraw = imenu;
     }
     else {
          menuScale = Math.max(menuScale-0.05, 0);
          if (menuScale == 0) imenuDraw = imenu;
     }

     // Selecciona el menú correcto
     menuSeleccionado = -1;
     if (menuScale > 0) {
          for (var m = 0; m < 8; ++m) {
               // Según la distancia y el ángulo del ratón con el centro de la carta seleccionamos o no cada sección
               var x = cartas[imenuDraw].x+cartaWidth/2+offset;
               var y = cartas[imenuDraw].y+cartaHeight/2;
               var dist = Math.sqrt(Math.pow(mousex-x, 2) + Math.pow(mousey-y, 2));
               var ang = pointDirection(mousex, mousey, x, y);

               if (inRange(dist, 30, 75) && absAngleDifference(ang, m*45+45+22.5) <= 22.5) {
                    spMenuA[m] = "sprMenuAS";
                    menuSeleccionado = m+1;
                    if (menuSeleccionado == 8) menuSeleccionado = 0;
               }
               else {
                    spMenuA[m] = "sprMenuA";
               }
          }
          cargarImagenesMenus(socket);
     }
}

function gestionCandado(socket, data) { // Permite bloquear o desbloquear las normas
     if (mousex <= 70 && mousey <= 70) {
          if (mousePress) { // Al hacer click, alterna
               candado = !candado;
          }
     }
}

function gestionTrigger(socket, data) { // Gestión del umbral de Trigger y el Trigger generado
     if (comenzado) {
          // Sumamos o restamos Trigger
          var dif = umbralTrigger - triggerGenerado;
          var ganar = Math.min(1, dif);

          // UP
          if (comenzado && mousex >= 970 && mousex <= 970+25 && mousey >= 665 && mousey < 665+25) {
               triggerFlechaUAngle = angular(triggerFlechaUAngle+5);

               if (mousePress) {
                    if (candado) {
                         trigger = Math.min(trigger+ganar, 12);
                         triggerGenerado = Math.min(triggerGenerado+ganar, 12);
                    }
                    else {
                         trigger = Math.min(trigger+1, 12);
                    }
               }
          }
          else {
               if (triggerFlechaUAngle != 0) triggerFlechaUAngle = angular(triggerFlechaUAngle+5);
          }
          // DOWN
          if (comenzado && mousex >= 970 && mousex <= 970+25 && mousey >= 690 && mousey < 690+25) {
               triggerFlechaDAngle = angular(triggerFlechaDAngle+5);

               if (mousePress) {
                    trigger = Math.max(trigger-1, 0);
               }
          }
          else {
               if (triggerFlechaDAngle != 0) triggerFlechaDAngle = angular(triggerFlechaDAngle+5);
          }

          // Reiniciamos el Trigger generado
          if (comenzado && mousex >= 920 && mousex <= 920+50 && mousey >= 660 && mousey < 660+50) {
               if (mousePress) {
                    triggerGenerado = 0;
                    trigger = 0;
               }
          }
     }
}

function gestionNuevoTurno(socket, data) { // Iniciamos un nuevo turno
     if (comenzado && mousePress && mousex > 1100-150 && mousex < 1100+150 && mousey > 518 && mousey < 518+50) {
          setNuevoTurno();
     }
}

//############################################################################################################################################################################################################################
//#################################### MÉTODOS HELPER #############################################################################################################################################################
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
     return i < 93;
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

function setNuevoTurno() {
	// Calculamos el Umbral de Trigger
	umbralTrigger = 0;
	for (var j = 0; j < nHuecos; ++j) {
		if (!huecos[j].vert && !huecos[j].ocupado && miCampo(j)) ++umbralTrigger;
	}
	umbralTrigger = Math.round(umbralTrigger*relacionUmbralTrigger);

	// Volteamos boca arriba y en vertical todas las cartas, reiniciamos el Trigger...
	trigger = 0;
	triggerGenerado = 0;
	isMenu = false;

	for (var i = 0; i < nCartas/2; ++i) {
		// Sólo reinicia TUS cartas. Las del rival quedan en su posición para reaccionar a ellas
		if (miCampo(cartas[i].huecoOcupado)) {
			cartas[i].volteada = false;
			cartas[i].angle = 90;
		}
	}
}

function nuevaPartida(data) { // Creamos una nueva partida con todos los datos para ir tirando
     partidas.push(new obPartida());
     partidas[nPartidas].partidaID = data.partidaID;

     // Rellenamos el Creador o el Rival según haya hueco
     var ret = existeUsuario(nPartidas, data.usuarioID);
     if (ret == 0) partidas[nPartidas].usuarios[0].usuarioID = data.usuarioID;
     else if (ret == 1) partidas[nPartidas].usuarios[1].usuarioID = data.usuarioID;

     ++nPartidas;
}

function existeUsuario(i, usuario) { // Si el usuario no existe en la partida i, devuelve 0. Si existe como Creador, 1. Si existe como rival, 2.
     if (partidas[i].usuarios[0].usuarioID == usuario) return 1;
     else if (partidas[i].usuarios[1].usuarioID == usuario) return 2;
     else return 0;
}

//############################################################################################################################################################################################################################
//#################################### MÉTODOS CALCULADORES ############################################################################################################################################################
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

function isSeleccionada(carta) { // ¿Estás encima de la carta?
     return mousex > carta.x+carta.xoffset && mousex < carta.x+carta.xoffset+carta.width && mousey > carta.y+carta.yoffset && mousey < carta.y+carta.yoffset+carta.height;
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
          "0037", "0038", "0039", "0040", "0041", "0042", "0043", "0044", "0045", "0046", "0047", "0048", "0049", "0050", "0051", "0052"
     ];

     if (modo == "junto") return arr.join('');
     else if (modo == "comas") return arr.join(',');
     else return arr;
}

// Devuelve los huecos iniciales de las cartas al crear y unirte a partida
function getHuecosInicialesCartas(start) {
     var huecos = "";
     for (var i = start; i <= (start+nCartas/2); ++i) {
          huecos += conCeros(i);
     }
     return huecos;
}

function conCeros(i) {
     if (i <= 9) return "00" + i;
     else if (i <= 99) return "0" + i;
     else return i;
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

function modificaCarta(cid, pv, rango, clase, sprClase, sprEspecie, sprElemento) {
     cartas[iAsignaCarta].cid = cid;
     cartas[iAsignaCarta].rango = rango;
     cartas[iAsignaCarta].pv = pv;
     cartas[iAsignaCarta].pvmax = pv;
     cartas[iAsignaCarta].clase = clase;
     cartas[iAsignaCarta].sprClase = sprClase;
     cartas[iAsignaCarta].sprEspecie = sprEspecie;
     cartas[iAsignaCarta].sprElemento = sprElemento;

     cartas[iAsignaCarta].huecoOcupado = iAsignaCarta;
     var jj = cartas[iAsignaCarta].huecoOcupado;
     if (jj >= 0) huecos[jj].icarta = iAsignaCarta;
     if (iAsignaCarta == 0) {
          cartas[iAsignaCarta].general = true;
     }

     // Esto sólo se hará UNA vez y para cargar tus cartas.

     ++iAsignaCarta;
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
               if (resultSelectDoFromUsuario.length > 0) cuenta = resultSelectDoFromUsuario[0];
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
          else socket.emit('nuevoMensaje', {mid:1001, desc:null});
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
                         var arrayS = getListaCartas(data.barajaID, "comas"); // Obtenemos el array de id's de cartas, puede haber repeticiones
                         con.query("select * from Cartas where cartaID in (" + arrayS + ");", (errSelectCrearPartida2, resultSelectCrearPartida2) => {
                              if (errSelectCrearPartida2) throw errSelectCrearPartida2;
                              var array = getListaCartas(data.barajaID, ""); // Obtenemos el array de id's de cartas, puede haber repeticiones
                              var pvs = getPVsDeCartas(array, resultSelectCrearPartida2);
                              con.query("insert into Partidas (partidaID, partidaCreadorUsuarioID, partidaRivalUsuarioID, partidaCartasID, partidaCartasHueco, partidaCartasPV) values ('"
                                   + data.partidaID + "', '" + cuenta.usuarioID + "', null, '" + getListaCartas(data.barajaID, "junto") + "', '" + getHuecosInicialesCartas(0)
                                   + "', '" + pvs + "');", (errSelectCrearPartida3, r) => {
                                   if (errSelectCrearPartida3) throw errSelectCrearPartida3;
                                   cargarCartas(true, socket, data, pvs);
                              });
                         });
                    }
                    else { // Si ya ha sido creada...
                         // Si eres creador o rival, simplemente cargamos las cartas al tablero desde BD
                         if (resultSelectCrearPartida[0].partidaCreadorUsuarioID == cuenta.usuarioID || resultSelectCrearPartida[0].partidaRivalUsuarioID == cuenta.usuarioID) {
                              cargarCartas(false, socket, data, resultSelectCrearPartida[0].cartaPV);
                         }
                         // Si hay hueco para rival y no eres creador, te unes a ella y asignas tu mazo...
                         else if (resultSelectCrearPartida[0].partidaCreadorUsuarioID != cuenta.usuarioID && resultSelectCrearPartida[0].partidaRivalUsuarioID == null) {
                              var arrayS = getListaCartas(data.barajaID, "comas"); // Obtenemos el array de id's de cartas, puede haber repeticiones
                              con.query("select * from Cartas where cartaID in (" + arrayS + ");", (errSelectCrearPartida2, resultSelectCrearPartida2) => {
                                   if (errSelectCrearPartida2) throw errSelectCrearPartida2;
                                   var array = getListaCartas(data.barajaID, ""); // Obtenemos el array de id's de cartas, puede haber repeticiones
                                   var pvs = getPVsDeCartas(array, resultSelectCrearPartida2);
                                   con.query("update Partidas set partidaRivalUsuarioID = '" + cuenta.usuarioID + "', partidaCartasID = '" + getListaCartas(data.barajaID, "junto")
                                   + "', partidaCartasHueco = '" + getHuecosInicialesCartas(nCartas/2) + "', partidaCartasPV = '" + pvs + "' where partidaID = '" + data.partidaID + "';", (errSelectCrearPartida3, r) => {
                                        if (errSelectCrearPartida3) throw errSelectCrearPartida3;
                                        cargarCartas(false, socket, data, pvs);
                                   });
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
     else socket.emit('nuevoMensaje', {mid:1003, desc:null});
}

// Cargamos las cartas de base de datos al campo. Ocurre tanto al crearlo como en cada cargada
function cargarCartas(crea, socket, data, pvs) {
     pool.getConnection((errCargarCartas, con) => {
          if (errCargarCartas) throw errCargarCartas;
          var arrayS = getListaCartas(data.barajaID, "comas"); // Obtenemos el array de id's de cartas, puede haber repeticiones
          con.query("select * from Cartas where cartaID in (" + arrayS + ");", (errSelectCrearPartida2, resultSelectCrearPartida2) => {
               // Buscamos todas las cartas. No habrá repeticiones, pero obtenemos sus datos
               if (errSelectCrearPartida2) throw errSelectCrearPartida2;
               iAsignaCarta = 0;
               var array = getListaCartas(data.barajaID, ""); // Obtenemos el array de id's de cartas, puede haber repeticiones

               // TODO iAsignaCarta setearlo a 0 o a 31 para comenzar a contar en el lado bueno del array segun si... lo que sea. No almacenarla.

               for (var i = 0; i < array.length; ++i) {
                    // En base a un bucle de la lista (cartas repetidas) obtenemos los datos de la query 3 (sin repetir)
                    // Dado el cartaID del array, debemos buscar coincidencia en result2 y pasar esos datos
                    for (var j = 0; j < resultSelectCrearPartida2.length; ++j) {
                         if (Number(array[i]) == resultSelectCrearPartida2[j].cartaID) {
                              modificaCarta(
                                   Number(array[i]), pvs.substring(i, i+1), resultSelectCrearPartida2[j].cartaRango,
                                   resultSelectCrearPartida2[j].cartaClase, 'sprClase' + resultSelectCrearPartida2[j].cartaClase,
                                   'sprEspecie' + resultSelectCrearPartida2[j].cartaEspecie, 'sprElemento' + resultSelectCrearPartida2[j].cartaElemento
                              );
                              break;
                         }
                    }
               }

               if (crea) nuevaPartida(data);
               // Aquí la partida ya existe o ha sido creada. La buscamos y le asignamos "cargaImagenes" a true para que en su primer ciclo cargue todo.
               for (var i = 0; i < nPartidas; ++i) {
                    if (partidas[i].partidaID == data.partidaID) {
                         if (partidas[i].usuarios[0].usuarioID == data.usuarioID) partidas[i].usuarios[0].cargaImagenes = true;
                         else if (partidas[i].usuarios[1].usuarioID == data.usuarioID) partidas[i].usuarios[1].cargaImagenes = true;
                    }
               }
               socket.emit('partidaCreada');
          });
     });
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
     usuario.xCampo = data.xCampo;
}

// Obtén todas las variables de las estructuras para usarlas en local para ESTE usuario
function getAllVariables(socket, partida, usuario, data) {
     // Funcionamiento básico de los usuarios y la partida
     mousex = usuario.mousex;
     mousey = usuario.mousey;
     mousePress = usuario.mousePress;
     mouseRelease = usuario.mouseRelease;
     xCampo = Math.min(Math.max(-mousex*1.105, -1000), -20);
     generalColocado = usuario.generalColocado;
     nComenzado = usuario.nComenzado;
     comenzado = usuario.comenzado;
     candado = usuario.candado;
     umbralTrigger = usuario.umbralTrigger;
     trigger = usuario.trigger;
     triggerGenerado = usuario.triggerGenerado;
     swapLimbo = usuario.swapLimbo;
     swapeando = usuario.swapeando;
     claseSeleccionada = usuario.claseSeleccionada;
     nEjercitoRival = usuario.nEjercitoRival;
     // Menú
     spMenuA = usuario.spMenuA;
     isMenu = usuario.isMenu;
     imenu = usuario.imenu;
     imenuDraw = usuario.imenuDraw;
     menuSeleccionado = usuario.menuSeleccionado;
     menuScale = usuario.menuScale;
     // Las cartas
     cartas = partida.cartas;
     cartaDrawID = usuario.cartaDrawID;
     // Los huecos
     huecos = partida.huecos;
     sprLimboBoton = usuario.sprLimboBoton;
     // Extra
     cargaImagenes = usuario.cargaImagenes;
}

// Setea todas las variables locales a las estructuras para poderlas acceder entre instantes de turno. SIEMPRE deben almacenarse en la estructura de usuarios,
// Pues en cada step es la estructura que va a leerse para cargar cada turno. Así que lo guardamos ahí, y de ahí a base de datos en un paso posterior
// Notar que no todo debe guardarse en base de datos. Cosas como el estado del ratón se guarda en usuario para llevar la cuenta pero NO en base de datos.
function setAllVariables(socket, partida, usuario, data) {
     // Funcionamiento básico de los usuarios y la partida
     usuario.mousex = mousex;
     usuario.mousey = mousey;
     usuario.mousePress = mousePress;
     usuario.mouseRelease = mouseRelease;
     usuario.generalColocado = generalColocado; // Persistente
     usuario.nComenzado = nComenzado; // Persistente
     usuario.comenzado = comenzado; // Persistente
     usuario.candado = candado;
     usuario.umbralTrigger = umbralTrigger; // Persistente
     usuario.trigger = trigger; // Persistente
     usuario.triggerGenerado = triggerGenerado; // Persistente
     usuario.swapLimbo = swapLimbo;
     usuario.swapeando = swapeando;
     usuario.claseSeleccionada = claseSeleccionada;
     usuario.nEjercitoRival = nEjercitoRival; // Persistente
     // Menú
     usuario.spMenuA = spMenuA;
     usuario.isMenu = isMenu;
     usuario.imenu = imenu;
     usuario.imenuDraw = imenuDraw;
     usuario.menuSeleccionado = menuSeleccionado;
     usuario.menuScale = menuScale;
     // Las cartas
     partida.cartas = cartas; // Persistente
     usuario.cartaDrawID = cartaDrawID;
     // Los huecos
     partida.huecos = huecos; // Persistente
     usuario.sprLimboBoton = sprLimboBoton;
     // Extra
     usuario.cargaImagenes = cargaImagenes; // Persistente
}

// TODO hacer método para almacenar de la estructura partidas y usuarios hacia base de datos, y otro para traerlas de vuelta.
// La primera se ejecutaría cada X segundos y/o al realizar ciertas acciones, la segunda se haría cada vez que el server inicia.
