//#############################################################################################################################################################################################
//#################################### LOS INCLUDES Y CONEXIONES ############################################################################################################################
//#############################################################################################################################################################################################

// Includes
const port =
     process.env.PORT || 8080;
const express = require('express');
const http = require('http');
const app = express();
const server = app.listen(port);
const io = require('socket.io').listen(server);
const mysql = require('mysql');

// Inicializamos la base de datos
var con = mysql.createConnection({
     host: "eu-cdbr-west-02.cleardb.net", user: "bd0a2b4ce07342", password: "5e67cbaed168786", database: "heroku_8f53c8984463c5b"
     //host: "localhost", user: "root", password: "password", database: "dctdb"
});

// Gestiones de tablas
con.query("drop table usuarios;"); console.log("La tabla de usuarios ha sido borrada");
con.query("create table if not exists usuarios (usuario varchar(50) primary key not null, contrasena varchar(50) not null);"); console.log("La tabla de usuarios ha sido creada");

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

//############################################################################################################################################################################################################################
//#################################### VARIABLES E INICIALIZACIONES ##########################################################################################################################################################
//############################################################################################################################################################################################################################

// Variables de control de juego
var mousePress = false; // click pulsado actualmente
var mouseRelease = false; // Click alzado actualmente
var mousex, mousey, moving;

// Para saber a cuál de los clientes enviar datos
nClient = 0;
var clientID = new Array();
clientID.push(0);
clientID.push(0);

var nCartas = 31+31; // Número de cartas. 62 pues tomamos AMBOS MAZOS. Luego ir haciendo distinciones.
var agarrando = false; // ¿Estás agarrando una carta?
var xCampo = 0; // Desplaza el campo horizontalmente
var cambioCampo = false; // ¿Lo has cambiado ya?
var generalColocado = false; // Primero debes colocar el general o bloquea el resto de Ejército
var nComenzado = 0; // Al colocar 2, comienzas
var comenzado = false; // Tras colocar el General debes colocar 2 Criaturas para bloquear el resto del Ejército
var candado = true; // ¿Aplicamos el candado?
var candadoAngle = 0; // Para que el candado se agite
var umbralTrigger = 0; // Cantidad de Trigger que puedes generar al turno
var relacionUmbralTrigger = 1/2; // Constante de Umbral de Trigger
var trigger = 0; // Trigger generador ese turno
var triggerGenerado = 0; // La cuenta de Trigger ganado este turno, para ver cuanto deja obtener
var reiniciarTriggerAngle = 0; // Ángulo de la flecha circular
var triggerFlechaUAngle = 0; // Angulo de animacion de la flecha U
var triggerFlechaDAngle = 0; // Angulo de animacion de la flecha D
var nuevoTurnoAngle = 0; // Ángulo para nuevo turno
var huecoTriggerAng = 0;
var huecoTriggerSize = 1; // Iconos palpitantes de Trigger en huecos
var swapLimbo = false; // ¿El Limbo está swapeado?
var ctSwapeando = 25; // Cantidad de swapeo
var swapeando = ctSwapeando; // Contador para swapear el Limbo
var iAsignaCarta = 0; // Para asignar las cartas más fácilmente y crear la deck
var claseSeleccionada = ''; // La carta seleccionada en menú, su clase para comparaciones
var nEjercitoRival = 0; // Número de cartas del Ejército rival
var sprNuevoTurno = ""; // Botón de nuevo turno

var offset = 13;
var pvWidth = 11;
var pvHeight = 10;

// Menú

var spMenuA = new Array();

for (var i = 0; i < 8; ++i) {
	spMenuA.push("");
}

var isMenu = false; // ¿Menu abierto?
var imenu = 0; // Índice de carta con menu
var imenuDraw = 0; // Índice real para dibujar
var menuSeleccionado = -1; // Del 0 al 7 para interno, del 8 al 15 para externo
var menuScale = 0; // Animación progresiva

// Las cartas

function obCarta() {
	this.image = ""; // El sprite
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
	this.xoffset = offset;
	this.yoffset = 0;
	this.volteada = false; // ¿Está volteada?
	this.general = false; // ¿Es General?
	this.rango = 0; // El Rango de la Criatura
	this.clase = ''; // La clase
	this.sprClase = ""; // Cuál de las 6 Clases es (A, R, C, G, V, X = General)
	this.sprEspecie = ""; // Cuál de las 6 Espécies es (H, B, E, A, D, I, M)
	this.sprElemento = ""; // Cuál de los 6 Elementos es (F, R, S, L, G, T, N)
}

var cartas = new Array(); // Array de las cartas
var cartaWidth = 64;
var cartaHeight = 90;

for (var i = 0; i < nCartas; ++i) {
	cartas.push(new obCarta());
}

var sprCartaDraw = ""; // La carta gigante

// Genera y registra los huecos

var huecos = new Array(); // Array de huecos que rellenamos de forma automática al crearlos
var nHuecos = 0; // Se actualiza dinámicamente

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

function generaGridDeHuecos(ind, x, y, nRow, nCol, sepW, sepH, resUp) {
	for (var i = 0; i < nRow; ++i) {
		for (var j = 0; j < nCol; ++j) {
			huecos.push(new obHueco(ind, x+j*sepW, y+i*sepH*(1 - 2*resUp), i == 1 || nRow == 1 || nCol == 1));
			++nHuecos;
		}
	}
}

// Ejército
generaGridDeHuecos(1, 340, 510, 1, 1, cartaHeight-25, cartaHeight+10, false); // General

generaGridDeHuecos(1, 48, 419, 1, 4, cartaHeight-25, cartaHeight+10, false); // Fila superior L
generaGridDeHuecos(1, 308, 410, 1, 2, cartaHeight-25, cartaHeight+10, false); // Fila superior M
generaGridDeHuecos(1, 438, 419, 1, 4, cartaHeight-25, cartaHeight+10, false); // Fila superior R

generaGridDeHuecos(1, 0, 510, 1, 5, cartaHeight-25, cartaHeight+10, false); // Fila intermedia L
generaGridDeHuecos(1, 420, 510, 1, 5, cartaHeight-25, cartaHeight+10, false); // Fila intermedia R

generaGridDeHuecos(1, 48, 601, 1, 4, cartaHeight-25, cartaHeight+10, false); // Fila inferior L
generaGridDeHuecos(1, 308, 610, 1, 2, cartaHeight-25, cartaHeight+10, false); // Fila inferior M
generaGridDeHuecos(1, 438, 601, 1, 4, cartaHeight-25, cartaHeight+10, false); // Fila inferior R

// Limbo tuyo
generaGridDeHuecos(2, 1100, 420, 1, 10, cartaHeight-25, cartaHeight+10, false);
generaGridDeHuecos(2, 1145, 510, 1, 10, cartaHeight-25, cartaHeight+10, false);
generaGridDeHuecos(2, 1100, 600, 1, 10, cartaHeight-25, cartaHeight+10, false);

// Vanguardia + Reserva tuya
generaGridDeHuecos(0, 10, 210, 2, 3, cartaHeight+10, cartaHeight+10, false);
generaGridDeHuecos(0, 360, 210, 2, 3, cartaHeight+10, cartaHeight+10, false);
generaGridDeHuecos(0, 710, 210, 2, 2, cartaHeight+10, cartaHeight+10, false);
generaGridDeHuecos(0, 930, 210, 2, 2, cartaHeight+10, cartaHeight+10, false);
generaGridDeHuecos(0, 1180, 210, 2, 3, cartaHeight+10, cartaHeight+10, false);
generaGridDeHuecos(0, 1530, 210, 2, 3, cartaHeight+10, cartaHeight+10, false);

// Limbo rival
generaGridDeHuecos(2, 1100, 420, 1, 10, cartaHeight-25, cartaHeight+10, false);
generaGridDeHuecos(2, 1145, 510, 1, 10, cartaHeight-25, cartaHeight+10, false);
generaGridDeHuecos(2, 1100, 600, 1, 10, cartaHeight-25, cartaHeight+10, false);

// Vanguardia + Reserva rival
generaGridDeHuecos(0, 10, 110, 2, 3, cartaHeight+10, cartaHeight+10, true);
generaGridDeHuecos(0, 360, 110, 2, 3, cartaHeight+10, cartaHeight+10, true);
generaGridDeHuecos(0, 710, 110, 2, 2, cartaHeight+10, cartaHeight+10, true);
generaGridDeHuecos(0, 930, 110, 2, 2, cartaHeight+10, cartaHeight+10, true);
generaGridDeHuecos(0, 1180, 110, 2, 3, cartaHeight+10, cartaHeight+10, true);
generaGridDeHuecos(0, 1530, 110, 2, 3, cartaHeight+10, cartaHeight+10, true);

// Mensajes de error y de información

var mensajes = new Array();
nMensajes = 0;

function obMensaje(id, value) {
	this.text = ""; // Mensaje a mostrar, ahora lo asignamos
	this.y = -20; // Coordenada y bajando
	this.alpha = 1; // A partir de cierto punto comenzará a desaparecer

	if (id == 0) this.text = "El General es la primera carta a robar.";
	else if (id == 1) this.text = "El General debe estar en la Vanguardia.";
	else if (id == 2) this.text = "Sumas " + value + " Trigger por el sacrificio.";
	else if (id == 3) this.text = "Pagas " + value + " Trigger por la invocación.";
	else if (id == 4) this.text = "Necesitas " + value + " Trigger para invocar esta Criatura.";
	else if (id == 5) this.text = "No puedes voltear boca arriba una Criatura ya sacrificada.";
	else if (id == 6) this.text = "No puedes voltear boca arriba una Criatura ya desplazada entre zonas.";
	else if (id == 7) this.text = "No puedes rotar una Criatura ya sacrificada.";
	else if (id == 8) this.text = "No puedes rotar una Criatura ya desplazada entre zonas.";
	else if (id == 9) this.text = "Desplazas la Criatura de una zona a otra.";
	else if (id == 10) this.text = "No puedes desplazar una Criatura que ha tomado una acción.";
	else if (id == 11) this.text = "Hueco ocupado. Movimiento no permitido.";
	else if (id == 12) this.text = "No puedes interactuar con el lado del rival.";
	else if (id == 13) this.text = "No puedes guardar hasta tener en juego el General y 2 Criaturas más.";
	else if (id == 14) this.text = "Has guardado tu estado. Podrás retomar tu turno o dar paso a tu rival.";
	else if (id == 15) this.text = "Tu turno ha sido cargado con éxito para continuar.";
	else if (id == 16) this.text = "Campo del rival cargado con éxito. ¡Enfréntale!";
	else if (id == 17) this.text = "Este fichero es para visualizarse en el lado rival, no puede continuarse.";
	else if (id == 18) this.text = "Este fichero es para continuar el turno, no puede visualizarse en el lado rival.";
	// nuevoMensaje(, null); //
}

function nuevoMensaje(id, value) {
	mensajes.push(new obMensaje(id, value));
	++nMensajes;
}

var sprLimboBoton = ""; // Eso

//############################################################################################################################################################################################################################
//#################################### TRUCOS PARA TESTEOS ###################################################################################################################################################################
//############################################################################################################################################################################################################################

asignaCartasRaziel(0);
//asignaCartasSaleh(0);

generalColocado = true;
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
huecos[2].ocupado = false;

//#############################################################################################################################################################################################
//#################################### CONEXIÓN INICIAL, RECIBIR SEÑALES DEL CLIENTE PARA ENVIARLAS DE VUELTA #######################################################################################################################################
//#############################################################################################################################################################################################

// Llamada inicial cada vez que un usuario conecta. También definimos los métodos del socket
io.on('connection', (socket) => {
     if (nClient < 2) {
          console.log('Nuevo usuario conectado');
          clientID[nClient] = socket.id;
          ++nClient;

          socket.on('mousePress', (data) => {
               mousePress = true;
          });

          socket.on('mouseRelease', (data) => {
               mouseRelease = true;
          });

          socket.on('mouseMove', (data) => {
               mousex = data.mousex;
               mousey = data.mousey;
          });

          // Iniciamos sesión o registramos el usuario
          socket.on('iniciarSesion', (data) => {
               doFromUsuario(iniciarSesion, socket, data);
          });

          // Creamos un array de las imágenes de las cartas
          var hue = new Array();
          for (j = 0; j < nHuecos; ++j) {
               hue.push({hue:huecos[j].image});
          }

          // Enviamos la señal
          var car = new Array();
          for (i = 0; i < nCartas; ++i) {
               car.push({car:cartas[i].image, cla:cartas[i].sprClase, esp:cartas[i].sprEspecie, ele:cartas[i].sprElemento});
          }

          cargarImagenesHuecos(socket);
          cargarImagenesCartas(socket);
          cargarImagenesMenus(socket);

          socket.on('main', function() { // De aquí leer el ID del que lo llama para saber qué cliente es
               gestionMainLogic();
               gestionMouse();
               gestionHuecos();
               gestionSwapLimbo();
               gestionCartas();
               gestionCartaSeleccionada();
               gestionArrastrarCarta();
               gestionMenu(socket);
               gestionCandado();
               gestionTrigger();
               gestionMensajes();
               gestionNuevoTurno();

               // Los arrays de huecos y cartas
               var hue = new Array();
               for (j = 0; j < nHuecos; ++j) {
                    hue.push({x:huecos[j].x, y:huecos[j].y, width:huecos[j].width, height:huecos[j].height, ocupado:huecos[j].ocupado, vert:huecos[j].vert});
               }

               var car = new Array();
               for (j = 0; j < nCartas; ++j) {
                    car.push({x:cartas[j].x, y:cartas[j].y, huecoOcupado:cartas[j].huecoOcupado, volteada:cartas[j].volteada, angleDraw:cartas[j].angleDraw,
                    xoffset:cartas[j].xoffset, yoffset:cartas[j].yoffset, width:cartas[j].width, height:cartas[j].height, general:cartas[j].general,
                    pv:cartas[j].pv, pvmax:cartas[j].pvmax, seleccionada:cartas[j].seleccionada});
               }

               // Enviamos la señal
               socket.emit('main', {
                    hue:hue, car:car, men:spMenuA, xCampo:xCampo, huecoTriggerSize:huecoTriggerSize, generalColocado:generalColocado, comenzado:comenzado, candado:candado,
                    sprCartaDraw:sprCartaDraw, menuScale:menuScale, imenuDraw:imenuDraw, umbralTrigger:umbralTrigger, triggerGenerado:triggerGenerado, trigger:trigger,
                    nMensajes:nMensajes, mensajes:mensajes, sprNuevoTurno:sprNuevoTurno, nuevoTurnoAngle:nuevoTurnoAngle, sprLimboBoton:sprLimboBoton,
                    nEjercitoRival:nEjercitoRival
               });

               mouseRelease = false;
               mousePress = false
          });
     }
     else {
          console.log('No se pueden conectar más usuarios');
     }
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
          car.push({car:cartas[i].image, cla:cartas[i].sprClase, esp:cartas[i].sprEspecie, ele:cartas[i].sprElemento});
     }
     socket.emit('cargarImagenesCartas', {car:car});
}

function cargarImagenesMenus(socket) {
     socket.emit('cargarImagenesMenus', {men:spMenuA});
}

function gestionMainLogic() {
     // Símbolos de Trigger
     huecoTriggerAng = angular(huecoTriggerAng+1);
     huecoTriggerSize = 50*(1+Math.cos(huecoTriggerAng*Math.PI/180)/2);
}

function gestionMouse() {
     // Desplazar el campo
     xCampo = Math.min(Math.max(-mousex*1.105, -1000), -20);
}

function gestionHuecos() { // Simplemente gestión huecos
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

function gestionSwapLimbo() {
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

function gestionCartas() {
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

function gestionCartaSeleccionada() { // Mostramos la carta seleccionada, comprobando si está el ratón encima de cada una
     // Crear variable local sprCartaDraw para guardar la carta seleccionada y enviar el STRING al socket
     sprCartaDraw = "";
     for (var i = 0; i < nCartas; ++i) {
          cartas[i].seleccionada = false;
          if (isSeleccionada(cartas[i])) {
               sprCartaDraw = cartas[i].image;
               cartas[i].seleccionada = true;
          }
     }
}

function gestionArrastrarCarta() { // Al clicar y mantener una carta, la arrastra
     for (var i = 0; i < nCartas; ++i) { // Para cada carta...
          if (isSeleccionada(cartas[i]) && mousePress && !agarrando) { // ... si tienes el ratón encima y pulsas, la marcas como agarrada
               if (generalColocado || (!generalColocado && cartas[i].general)) {
                    // Si está volteada y en el Ejército no dejamos arrastrar hasta colocar el General
                    if (miCampo(cartas[i].huecoOcupado)) {
                         // Sólo puedo interactuar si es mía
                         cartas[i].pulsada = true;
                         agarrando = true;
                         cartas[i].xoff = mousex-cartas[i].x;
                         cartas[i].yoff = mousey-cartas[i].y;
                         break;
                    }
                    else {
                         nuevoMensaje(12, null); // Sólo toca tus cartas
                    }
               }
               else {
                    nuevoMensaje(0, null); // El General es la primera carta a robar
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
                                                            nuevoMensaje(3, cartas[i].rango); // Trigger pagado por invocación
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
                                                            nuevoMensaje(9, null); // Desplazas
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
                                                       nuevoMensaje(12, null); // Interactuar con campo rival
                                                  }
                                             }
                                             else if (desplaza) {
                                                  nuevoMensaje(10, null); // No puede desplazar
                                             }
                                        }
                                        else if (invoca) {
                                             nuevoMensaje(4, cartas[i].rango); // Trigger para invocación no suficiente
                                        }
                                   }
                                   else {
                                        nuevoMensaje(1, null); // No puedes sacar el General de la Vanguardia
                                   }
                              }
                              else if (huecos[j].ocupado && cartas[i].huecoOcupado != j) {
                                   nuevoMensaje(11, null); // Hueco ocupado, no desplazas
                              }
                         }
                    }
                    if (!dejada) { // Si no encontraste hueco...
                         cartas[i].x = cartas[i].xstart;
                         cartas[i].y = cartas[i].ystart;
                    }

                    cartas[i].pulsada = false; // ... en cuanto sueltas el click se te va.
                    agarrando = false;
               }

               if (agarrando) {
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

function gestionMenu(socket) { // Todas las opciones del menú y su control
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
                         nuevoMensaje(12, null); // Toca tus cartas sólo
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
                         nuevoMensaje(12, null); // No tocar el campo rival
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
                              nuevoMensaje(7, null); // No rotar sacrificada
                         }
                         else {
                              nuevoMensaje(8, null); // No rotar desplazada
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
                              nuevoMensaje(2, ganar); // Trigger ganado por sacrificio
                         }
                    }
                    else {
                         if (cartas[i].angle == 90) {
                              nuevoMensaje(5, null); // No deja voltear sacrificada
                         }
                         else if (cartas[i].angle == 0) {
                              nuevoMensaje(6, null); // No deja voltear desplazada
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

function gestionCandado() { // Permite bloquear o desbloquear las normas
     if (mousex <= 70 && mousey <= 70) {
          if (mousePress) { // Al hacer click, alterna
               candado = !candado;
          }
     }
}

function gestionTrigger() { // Gestión del umbral de Trigger y el Trigger generado
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
               reiniciarTriggerAngle = angular(reiniciarTriggerAngle+5);

               if (mousePress) {
                    triggerGenerado = 0;
                    trigger = 0;
               }
          }
     }
}

function gestionMensajes() { // Los mensajes de información y restricción que aparecen arriba
     // Va descendiendo cada mensaje hasta hacerlo desaparecer
     for (var i = 0; i < nMensajes; ++i) {
          mensajes[i].y += 1;

          if (mensajes[i].y >= 100) mensajes[i].alpha -= 0.01;
          if (mensajes[i].alpha <= 0) {
               mensajes.splice(i, 1); // At position i, remove 1 item
               --nMensajes;
          }
     }
}

function gestionNuevoTurno() { // Iniciamos un nuevo turno
     if (comenzado) {
          sprNuevoTurno = "sprNuevoTurnoB";

          if (mousex > 1100-150 && mousex < 1100+150 && mousey > 518 && mousey < 518+50) {
               sprNuevoTurno = "sprNuevoTurno";
               nuevoTurnoAngle = angular(nuevoTurnoAngle+5);

               if (mousePress) {
                    setNuevoTurno();
               }
          }
          else {
               if (nuevoTurnoAngle != 0 && nuevoTurnoAngle != 180) nuevoTurnoAngle = angular(nuevoTurnoAngle+5);
               if (nuevoTurnoAngle == 180) nuevoTurnoAngle = 0;
          }
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

function modificaCarta(src, pv, rango, clase, sprClase, sprEspecie, sprElemento) {
     cartas[iAsignaCarta].image = src;
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

     // Esto sólo se hará UNA vez y para cargar tus cartas. Quizás hasta sea de prueba.

     ++iAsignaCarta;
}

function asignaCartasRaziel(start) {
     iAsignaCarta = start;
     modificaCarta('https://i.imgur.com/041PRtj.png', 4, 0, 'G', 'sprClaseG', 'sprEspecieE', 'sprElementoN');
     modificaCarta('https://i.imgur.com/B2xhKWU.png', 2, 1, 'V', 'sprClaseV', 'sprEspecieA', 'sprElementoN');
     modificaCarta('https://i.imgur.com/B2xhKWU.png', 2, 1, 'V', 'sprClaseV', 'sprEspecieA', 'sprElementoN');
     modificaCarta('https://i.imgur.com/NxPM7Ge.png', 1, 1, 'T', 'sprClaseT', 'sprEspecieE', 'sprElementoT');
     modificaCarta('https://i.imgur.com/UngHMSr.png', 2, 1, 'T', 'sprClaseT', 'sprEspecieE', 'sprElementoN');
     modificaCarta('https://i.imgur.com/IjHqkUI.png', 2, 1, 'T', 'sprClaseT', 'sprEspecieE', 'sprElementoN');
     modificaCarta('https://i.imgur.com/IjHqkUI.png', 2, 1, 'T', 'sprClaseT', 'sprEspecieE', 'sprElementoN');
     modificaCarta('https://i.imgur.com/IjHqkUI.png', 2, 1, 'T', 'sprClaseT', 'sprEspecieE', 'sprElementoN');
     modificaCarta('https://i.imgur.com/ExvjVEH.png', 4, 0, 'V', 'sprClaseV', 'sprEspecieA', 'sprElementoN');
     modificaCarta('https://i.imgur.com/rUmbp8D.png', 1, 2, 'C', 'sprClaseC', 'sprEspecieA', 'sprElementoN');
     modificaCarta('https://i.imgur.com/rUmbp8D.png', 1, 2, 'C', 'sprClaseC', 'sprEspecieA', 'sprElementoN');
     modificaCarta('https://i.imgur.com/rUmbp8D.png', 1, 2, 'C', 'sprClaseC', 'sprEspecieA', 'sprElementoN');
     modificaCarta('https://i.imgur.com/F0PbGhO.png', 3, 1, 'V', 'sprClaseV', 'sprEspecieE', 'sprElementoN');
     modificaCarta('https://i.imgur.com/CTJt2Sn.png', 2, 0, 'V', 'sprClaseV', 'sprEspecieE', 'sprElementoN');
     modificaCarta('https://i.imgur.com/nlqBm3T.png', 2, 0, 'T', 'sprClaseT', 'sprEspecieA', 'sprElementoT');
     modificaCarta('https://i.imgur.com/wsXi1ik.png', 2, 2, 'R', 'sprClaseR', 'sprEspecieA', 'sprElementoT');
     modificaCarta('https://i.imgur.com/pYQWeTV.png', 2, 3, 'R', 'sprClaseR', 'sprEspecieE', 'sprElementoT');
     modificaCarta('https://i.imgur.com/yhrcl8s.png', 3, 2, 'T', 'sprClaseT', 'sprEspecieE', 'sprElementoT');
     modificaCarta('https://i.imgur.com/wAy23v4.png', 2, 3, 'A', 'sprClaseA', 'sprEspecieA', 'sprElementoN');
     modificaCarta('https://i.imgur.com/kpPNCkx.png', 3, 0, 'V', 'sprClaseV', 'sprEspecieA', 'sprElementoN');
     modificaCarta('https://i.imgur.com/eVJCVQU.png', 2, 1, 'C', 'sprClaseC', 'sprEspecieE', 'sprElementoN');
     modificaCarta('https://i.imgur.com/eVJCVQU.png', 2, 1, 'C', 'sprClaseC', 'sprEspecieE', 'sprElementoN');
     modificaCarta('https://i.imgur.com/4W1QPup.png', 2, 0, 'V', 'sprClaseV', 'sprEspecieA', 'sprElementoN');
     modificaCarta('https://i.imgur.com/4W1QPup.png', 2, 0, 'V', 'sprClaseV', 'sprEspecieA', 'sprElementoN');
     modificaCarta('https://i.imgur.com/ycWgPmy.png', 3, 4, 'A', 'sprClaseA', 'sprEspecieA', 'sprElementoN');
     modificaCarta('https://i.imgur.com/5Gjih8z.png', 2, 1, 'T', 'sprClaseT', 'sprEspecieE', 'sprElementoN');
     modificaCarta('https://i.imgur.com/7wmw3Mh.png', 1, 0, 'V', 'sprClaseV', 'sprEspecieA', 'sprElementoT');
     modificaCarta('https://i.imgur.com/7wmw3Mh.png', 1, 0, 'V', 'sprClaseV', 'sprEspecieA', 'sprElementoT');
     modificaCarta('https://i.imgur.com/7wmw3Mh.png', 1, 0, 'V', 'sprClaseV', 'sprEspecieA', 'sprElementoT');
     modificaCarta('https://i.imgur.com/7wmw3Mh.png', 1, 0, 'V', 'sprClaseV', 'sprEspecieA', 'sprElementoT');
     modificaCarta('https://i.imgur.com/aXyQ1jg.png', 2, 0, 'V', 'sprClaseV', 'sprEspecieA', 'sprElementoN');
}

function asignaCartasSaleh(start) {
     iAsignaCarta = start;
     modificaCarta('https://i.imgur.com/em4NjRe.png', 4, 0, 'G', 'sprClaseG', 'sprEspecieI', 'sprElementoF');
     modificaCarta('https://i.imgur.com/Y17XG1h.png', 1, 0, 'V', 'sprClaseV', 'sprEspecieI', 'sprElementoF');
     modificaCarta('https://i.imgur.com/eM9HEOu.png', 2, 0, 'V', 'sprClaseV', 'sprEspecieH', 'sprElementoE');
     modificaCarta('https://i.imgur.com/gm36IEV.png', 2, 1, 'V', 'sprClaseV', 'sprEspecieI', 'sprElementoE');
     modificaCarta('https://i.imgur.com/02BZ1GQ.png', 2, 1, 'T', 'sprClaseT', 'sprEspecieI', 'sprElementoF');
     modificaCarta('https://i.imgur.com/D2HauUW.png', 3, 3, 'R', 'sprClaseR', 'sprEspecieH', 'sprElementoF');
     modificaCarta('https://i.imgur.com/kcNzQsZ.png', 1, 0, 'V', 'sprClaseV', 'sprEspecieI', 'sprElementoF');
     modificaCarta('https://i.imgur.com/qXJH68a.png', 4, 1, 'V', 'sprClaseV', 'sprEspecieH', 'sprElementoF');
     modificaCarta('https://i.imgur.com/GaVHi6p.png', 2, 2, 'C', 'sprClaseC', 'sprEspecieI', 'sprElementoF');
     modificaCarta('https://i.imgur.com/k4XH4v0.png', 3, 3, 'A', 'sprClaseA', 'sprEspecieI', 'sprElementoE');
     modificaCarta('https://i.imgur.com/Y5zCfqS.png', 2, 1, 'T', 'sprClaseT', 'sprEspecieH', 'sprElementoF');
     modificaCarta('https://i.imgur.com/bqEQtKS.png', 2, 1, 'C', 'sprClaseC', 'sprEspecieI', 'sprElementoE');
     modificaCarta('https://i.imgur.com/vFSLF1I.png', 1, 0, 'V', 'sprClaseV', 'sprEspecieI', 'sprElementoE');
     modificaCarta('https://i.imgur.com/jbWtdbh.png', 3, 2, 'C', 'sprClaseC', 'sprEspecieH', 'sprElementoE');
     modificaCarta('https://i.imgur.com/jYSjQy0.png', 2, 2, 'R', 'sprClaseR', 'sprEspecieH', 'sprElementoF');
     modificaCarta('https://i.imgur.com/ai4uNS8.png', 2, 2, 'C', 'sprClaseC', 'sprEspecieH', 'sprElementoE');
     modificaCarta('https://i.imgur.com/LWr2cnj.png', 3, 2, 'T', 'sprClaseT', 'sprEspecieI', 'sprElementoE');
     modificaCarta('https://i.imgur.com/fGqt36Z.png', 2, 1, 'T', 'sprClaseT', 'sprEspecieH', 'sprElementoE');
     modificaCarta('https://i.imgur.com/9J1alw3.png', 3, 1, 'T', 'sprClaseT', 'sprEspecieH', 'sprElementoF');
     modificaCarta('https://i.imgur.com/I6kpm9Q.png', 2, 2, 'R', 'sprClaseR', 'sprEspecieI', 'sprElementoF');
     modificaCarta('https://i.imgur.com/j8OfGd8.png', 2, 1, 'T', 'sprClaseT', 'sprEspecieI', 'sprElementoF');
     modificaCarta('https://i.imgur.com/6gB7Wdc.png', 2, 0, 'V', 'sprClaseV', 'sprEspecieH', 'sprElementoE');
     modificaCarta('https://i.imgur.com/a7HvvDr.png', 2, 1, 'T', 'sprClaseT', 'sprEspecieH', 'sprElementoF');
     modificaCarta('https://i.imgur.com/SapZzOj.png', 2, 0, 'V', 'sprClaseV', 'sprEspecieI', 'sprElementoF');
     modificaCarta('https://i.imgur.com/ijECbX5.png', 2, 0, 'T', 'sprClaseT', 'sprEspecieI', 'sprElementoF');
     modificaCarta('https://i.imgur.com/vygJ2xR.png', 2, 1, 'V', 'sprClaseV', 'sprEspecieI', 'sprElementoF');
     modificaCarta('https://i.imgur.com/aAaoqES.png', 3, 0, 'V', 'sprClaseV', 'sprEspecieH', 'sprElementoE');
     modificaCarta('https://i.imgur.com/NCIdZKi.png', 2, 1, 'C', 'sprClaseC', 'sprEspecieH', 'sprElementoE');
     modificaCarta('https://i.imgur.com/288V28H.png', 3, 4, 'A', 'sprClaseA', 'sprEspecieI', 'sprElementoF');
     modificaCarta('https://i.imgur.com/LUVVak6.png', 2, 0, 'V', 'sprClaseV', 'sprEspecieI', 'sprElementoE');
     modificaCarta('https://i.imgur.com/uGPVJwz.png', 2, 0, 'V', 'sprClaseV', 'sprEspecieI', 'sprElementoE');
}

//#############################################################################################################################################################################################
//#################################### ACCESOS A BASE DE DATOS ################################################################################################################################
//#############################################################################################################################################################################################

// En base al usuario leído realiza acciones asíncronas
function doFromUsuario(func, socket, data) {
     con.query("select * from usuarios where usuario = '" + data.usuario + "';", function (err, result, fields) {
          if (err) throw err;
          else {
               var cuenta = null;
               if (result.length > 0) cuenta = result[0];

               func(socket, cuenta, data);
          }
     });
}

// Inicia sesión con los datos recuperados de la ventana, o registra el usuario si no existe
function iniciarSesion(socket, cuenta, data) {
     if (cuenta != null) {
          // Inicio de sesión exitoso
          if (cuenta.contrasena == data.contrasena) {
               socket.emit('login');
          }
          else {
               socket.emit('muestraMsgNoIniciaSesion');
          }
     }
     // Registramos la cuenta
     else {
          con.query("insert into usuarios (usuario, contrasena) values ('" + data.usuario + "', '" + data.contrasena + "');");
          socket.emit('muestraMsgRegistraUsuario');
     }
}
