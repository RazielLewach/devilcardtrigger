//############################################################################################################################################################################################################################
//#################################### VARIABLES E INICIALIZACIONES ##########################################################################################################################################################
//############################################################################################################################################################################################################################

// Gestión de variables en sockets
var usuarioID = "", usuarioPass = "", partidaID = ""; // Variables de sesión que serán enviadas y validadas en servidor para verificar tus inputs

// Variables de control del programa
var canvas = null; // canvas sobre el que trabajaremos
var pantalla = null; // La pantalla para logins y tal
var ctx = null; // contexto del canvas
var mousex, mousey; // Coordenadas del ratón
var marginLeft = 0; // Para ajustar el mouse
var res = 1; // Se hará zoom en el cliente pero el servidor trabaja a 1:1
var loginScreen = true; // ¿Estamos iniciando sesión?
var clasesAngle = 0; // Ángulo del círculo de clases
var huecoTriggerAng = 0; // El icono del Trigger en los huecos
var huecoTriggerSize = 1; // Iconos palpitantes de Trigger en huecos
var nuevoTurnoAngle = 0; // Ángulo para nuevo turno
var nHuecos = 1+2*(4+2+4)+5+5+6*10+8*3*2+4*2*2;
var nCartas = 31+31;

var huecosDraw = new Array(); // Las imágenes
for (var i = 0; i < nHuecos; ++i) {
	huecosDraw.push(new Image());
}

var cartasDraw = new Array(), claseDraw = new Array(), especieDraw = new Array(), elementoDraw = new Array(); // Las imágenes
for (var i = 0; i < nCartas; ++i) {
	cartasDraw.push(new Image());
	claseDraw.push(new Image());
	especieDraw.push(new Image());
	elementoDraw.push(new Image());
}

var menuDraw = new Array(); // Las imágenes
for (var i = 0; i < 8; ++i) {
	menuDraw.push(new Image());
}

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

	else if (id == 1000) this.text = "¡Has iniciado sesión correctamente!";
	else if (id == 1001) this.text = "Contraseña incorrecta para este usuario...";
	else if (id == 1002) this.text = "Has registrado el usuario. Vuelve a presionar para iniciar sesión.";
	else if (id == 1003) this.text = "Este usuario es incorrecto...";
	else if (id == 1004) this.text = "No puedes entrar a esta partida...";
	// nuevoMensaje(, null); //
}

function nuevoMensaje(id, value) {
	mensajes.push(new obMensaje(id, value));
	++nMensajes;
}

// Variables de apariencia

var offset = 13;
var pvWidth = 11;
var pvHeight = 10;
var cartaWidth = 64;
var cartaHeight = 90;
var menuWidth = 106;
var menuHeight = 89;
var clasesSize = 40; // Tamaño

// Tiles y backgrounds
var sprLoginScreen = 'https://i.imgur.com/gmxnA0p.png'; // Pantalla de inicio de sesión

var spFondoPuerta = new Image(); spFondoPuerta.src = 'https://i.imgur.com/cCF1FeK.png'; // Fondo del campo
var spFondoRuinas = new Image(); spFondoRuinas.src = 'https://i.imgur.com/19io16q.png'; // Fondo del campo
var spFondoPozos = new Image(); spFondoPozos.src = 'https://i.imgur.com/ebmO81S.png'; // Fondo del campo
var spFondoParamos = new Image(); spFondoParamos.src = 'https://i.imgur.com/CR8c7TG.png'; // Fondo del campo
var spFondoNucleos = new Image(); spFondoNucleos.src = 'https://i.imgur.com/6eos7n1.png'; // Fondo del campo
var spFondoSep = new Image(); spFondoSep.src = 'https://i.imgur.com/hdv4qw7.png'; // Fondo separador
var spFondoDerecha = new Image(); spFondoDerecha.src = 'https://i.imgur.com/RedxK2H.png'; // Fondo a la derecha ajeno al campo
var spFondoDerechaMitad = new Image(); spFondoDerechaMitad.src = 'https://i.imgur.com/mCeAZfh.png'; // Fondo a la derecha mitad ajeno al campo

var sprCartaVacia = 'https://i.imgur.com/93v2Y4e.png'; // Carta base vacía transparente GRANDE
var sprCartaHueco = 'https://i.imgur.com/MXxqIae.png'; // Hueco para carta que rota
var sprCartaHuecoVerde = 'https://i.imgur.com/JIastGm.png'; // Hueco para carta que rota Verde
var sprCartaHuecoRojo = 'https://i.imgur.com/FWVHf9d.png'; // Hueco para carta que rota
var sprCartaHuecoVert = 'https://i.imgur.com/mErTBiz.png'; // Hueco para carta vertical
var sprCartaSeleccionada = 'https://i.imgur.com/yMkxspa.png'; // Hueco seleccionada
var sprCartaGeneral = 'https://i.imgur.com/EpVHXr4.png'; // Único General
var sprCartaPruebas = 'https://i.imgur.com/0WY1mVR.png'; // Carta de pruebas
var spCartaDraw = new Image(); spCartaDraw.src = sprCartaVacia; // Fondo de la carta sin nada
var spCartaSeleccionada = new Image(); spCartaSeleccionada.src = sprCartaSeleccionada; // Carta seleccionada
var spCartaGeneral = new Image(); spCartaGeneral.src = sprCartaGeneral; // Único General

var spCandado = new Image(); spCandado.src = 'https://i.imgur.com/yE0JICH.png'; // Candado cerrado

var spHuecoTrigger = new Array(); // Iconos de Trigger palpitante para el hueco
var it1 = new Image(); it1.src = 'https://i.imgur.com/qmWkZh6.png'; spHuecoTrigger.push(it1);
var it2 = new Image(); it2.src = 'https://i.imgur.com/lSLkl7x.png'; spHuecoTrigger.push(it2);
var it3 = new Image(); it3.src = 'https://i.imgur.com/550FD8h.png'; spHuecoTrigger.push(it3);
var it4 = new Image(); it4.src = 'https://i.imgur.com/2Wa2h8F.png'; spHuecoTrigger.push(it4);
var it5 = new Image(); it5.src = 'https://i.imgur.com/NjB0DEg.png'; spHuecoTrigger.push(it5);
var it6 = new Image(); it6.src = 'https://i.imgur.com/KT7RnTN.png'; spHuecoTrigger.push(it6);

var spPV = new Image(); spPV.src = 'https://i.imgur.com/klAOy63.png'; // Barra de PV
var spPVL = new Image(); spPVL.src = 'https://i.imgur.com/RmqjFMO.png'; // Barra de PV larga
var spPVB = new Image(); spPVB.src = 'https://i.imgur.com/3yXimnI.png'; // Barra de PV vacía
var spPVBL = new Image(); spPVBL.src = 'https://i.imgur.com/ngm0Tqx.png'; // Barra de PV vacía larga
var spSinPV = new Image(); spSinPV.src = 'https://i.imgur.com/W0RdkbY.png'; // Carta sin PV, para las miniaturas

var spTrigger = new Image(); spTrigger.src = 'https://i.imgur.com/gxvoW05.png'; // El Trigger
var sprTriggerU = 'https://i.imgur.com/SRiYAWO.png'; // Icono de aumentar Trigger U sin seleccionar
var sprTriggerUS = 'https://i.imgur.com/KYBGf4a.png'; // Icono de aumentar Trigger U seleccionado
var sprTriggerD = 'https://i.imgur.com/0zXeqZn.png'; // Icono de reducir Trigger D sin seleccionar
var sprTriggerDS = 'https://i.imgur.com/PrBj2TJ.png'; // Icono de reducir Trigger D seleccionado
var spTriggerU = new Image(); spTriggerU.src = sprTriggerU; // Icono de aumentar Trigger U
var spTriggerD = new Image(); spTriggerD.src = sprTriggerD; // Icono de reducir Trigger D

var spMensajeRestriccion = new Image(); spMensajeRestriccion.src = 'https://i.imgur.com/ibGCEPY.png'; // Mensaje de restricción

var sprReiniciarTrigger = 'https://i.imgur.com/8acH4tf.png'; // Círculo flecha de reiniciar sin seleccionar
var sprReiniciarTriggerS = 'https://i.imgur.com/0nMfedu.png'; // Círculo flecha de reiniciar seleccionado
var spReiniciarTrigger = new Image(); spReiniciarTrigger.src = sprReiniciarTrigger; // Círculo flecha de reiniciar

var sprNuevoTurnoB = 'https://i.imgur.com/bCpaCXU.png'; // Botón de nuevo turno en negro
var sprNuevoTurno = 'https://i.imgur.com/xtK7Wdi.png'; // Botón de nuevo turno en rojo
var spNuevoTurno = new Image(); spNuevoTurno.src = sprNuevoTurnoB; // Botón de nuevo turno

var sprClases = 'https://i.imgur.com/ygoQKUg.png'; // Botón para mostrar clases
var sprClasesS = 'https://i.imgur.com/IsGwqeZ.png'; // Botón seleccionado para mostrar clases
var spClases = new Image(); spClases.src = sprClases; // Botón para mostrar clases
var spClasesDraw = new Image(); spClasesDraw.src = 'https://i.imgur.com/tkNBlIL.png'; // Círculo de clases grande

var sprClaseG = 'https://i.imgur.com/FOkvZte.png'; // Clase General
var sprClaseA = 'https://i.imgur.com/qkBnfMA.png'; // Clase Asesino
var sprClaseR = 'https://i.imgur.com/uizcMYL.png'; // Clase Rastreador
var sprClaseC = 'https://i.imgur.com/kAYkUWj.png'; // Clase Comando
var sprClaseT = 'https://i.imgur.com/sctgRlo.png'; // Clase Tanque
var sprClaseV = 'https://i.imgur.com/tnfMG1f.png'; // Clase Vigía

var sprEspecieH = 'https://i.imgur.com/BH2D97h.png'; // Espécie Humano
var sprEspecieI = 'https://i.imgur.com/r62Izdo.png'; // Espécie Insecto
var sprEspecieE = 'https://i.imgur.com/5K6yry3.png'; // Espécie Espectro
var sprEspecieA = 'https://i.imgur.com/hL6hFo1.png'; // Espécie Artificial

var sprElementoF = 'https://i.imgur.com/wMXv6zb.png'; // Elemento Fuego
var sprElementoE = 'https://i.imgur.com/BY6oQ56.png'; // Elemento Eléctrico
var sprElementoT = 'https://i.imgur.com/s7pYes5.png'; // Elemento Tóxico
var sprElementoN = 'https://i.imgur.com/rki0Ld6.png'; // Elemento Nulo

var sprLimboBotonOff = 'https://i.imgur.com/2c14oQE.png'; // Botón para swapear Limbo Off
var sprLimboBotonOn = 'https://i.imgur.com/RK9BdUe.png'; // Botón para swapear Limbo On
var sprLimboBotonOffS = 'https://i.imgur.com/mNNl8F0.png'; // Botón para swapear Limbo Off Selected
var sprLimboBotonOnS = 'https://i.imgur.com/TxPT4FD.png'; // Botón para swapear Limbo On Selected
var spLimboBoton = new Image(); spLimboBoton.src = sprLimboBotonOn;

var sprMenuA = 'https://i.imgur.com/OYoj8tT.png'; // Menu interno
var sprMenuAS = 'https://i.imgur.com/yQwGf9t.png'; // Menu interno selected

var sprTraseroDMC1 = 'https://i.imgur.com/NzlCNel.png'; // Trasero de DMC1

var spMenuPVL = new Image(); spMenuPVL.src = 'https://i.imgur.com/ko2ZJjO.png'; // PV -
var spMenuPVM = new Image(); spMenuPVM.src = 'https://i.imgur.com/CXNPTU7.png'; // PV +
var spMenuG = new Image(); spMenuG.src = 'https://i.imgur.com/9iiTyhP.png'; // Girar
var spMenuV = new Image(); spMenuV.src = 'https://i.imgur.com/ifAiKjU.png'; // Voltear

// TODAS LAS CARTAS

var spCarta = new Array();

var aux1 = 'https://i.imgur.com/041PRtj.png'; spCarta.push(aux1);
var aux2 = 'https://i.imgur.com/B2xhKWU.png'; spCarta.push(aux2);
var aux3 = 'https://i.imgur.com/NxPM7Ge.png'; spCarta.push(aux3);
var aux4 = 'https://i.imgur.com/UngHMSr.png'; spCarta.push(aux4);
var aux5 = 'https://i.imgur.com/IjHqkUI.png'; spCarta.push(aux5);
var aux6 = 'https://i.imgur.com/ExvjVEH.png'; spCarta.push(aux6);
var aux7 = 'https://i.imgur.com/rUmbp8D.png'; spCarta.push(aux7);
var aux8 = 'https://i.imgur.com/F0PbGhO.png'; spCarta.push(aux8);
var aux9 = 'https://i.imgur.com/CTJt2Sn.png'; spCarta.push(aux9);
var aux10 = 'https://i.imgur.com/nlqBm3T.png'; spCarta.push(aux10);
var aux11 = 'https://i.imgur.com/wsXi1ik.png'; spCarta.push(aux11);
var aux12 = 'https://i.imgur.com/pYQWeTV.png'; spCarta.push(aux12);
var aux13 = 'https://i.imgur.com/yhrcl8s.png'; spCarta.push(aux13);
var aux14 = 'https://i.imgur.com/wAy23v4.png'; spCarta.push(aux14);
var aux15 = 'https://i.imgur.com/kpPNCkx.png'; spCarta.push(aux15);
var aux16 = 'https://i.imgur.com/eVJCVQU.png'; spCarta.push(aux16);
var aux17 = 'https://i.imgur.com/4W1QPup.png'; spCarta.push(aux17);
var aux18 = 'https://i.imgur.com/ycWgPmy.png'; spCarta.push(aux18);
var aux19 = 'https://i.imgur.com/5Gjih8z.png'; spCarta.push(aux19);
var aux20 = 'https://i.imgur.com/7wmw3Mh.png'; spCarta.push(aux20);
var aux21 = 'https://i.imgur.com/aXyQ1jg.png'; spCarta.push(aux21);

var aux22 = 'https://i.imgur.com/em4NjRe.png'; spCarta.push(aux22);
var aux23 = 'https://i.imgur.com/Y17XG1h.png'; spCarta.push(aux23);
var aux24 = 'https://i.imgur.com/eM9HEOu.png'; spCarta.push(aux24);
var aux25 = 'https://i.imgur.com/gm36IEV.png'; spCarta.push(aux25);
var aux26 = 'https://i.imgur.com/02BZ1GQ.png'; spCarta.push(aux26);
var aux27 = 'https://i.imgur.com/D2HauUW.png'; spCarta.push(aux27);
var aux28 = 'https://i.imgur.com/kcNzQsZ.png'; spCarta.push(aux28);
var aux29 = 'https://i.imgur.com/qXJH68a.png'; spCarta.push(aux29);
var aux30 = 'https://i.imgur.com/GaVHi6p.png'; spCarta.push(aux30);
var aux31 = 'https://i.imgur.com/k4XH4v0.png'; spCarta.push(aux31);
var aux32 = 'https://i.imgur.com/Y5zCfqS.png'; spCarta.push(aux32);
var aux33 = 'https://i.imgur.com/bqEQtKS.png'; spCarta.push(aux33);
var aux34 = 'https://i.imgur.com/vFSLF1I.png'; spCarta.push(aux34);
var aux35 = 'https://i.imgur.com/jbWtdbh.png'; spCarta.push(aux35);
var aux36 = 'https://i.imgur.com/jYSjQy0.png'; spCarta.push(aux36);
var aux37 = 'https://i.imgur.com/ai4uNS8.png'; spCarta.push(aux37);
var aux38 = 'https://i.imgur.com/LWr2cnj.png'; spCarta.push(aux38);
var aux39 = 'https://i.imgur.com/fGqt36Z.png'; spCarta.push(aux39);
var aux40 = 'https://i.imgur.com/9J1alw3.png'; spCarta.push(aux40);
var aux41 = 'https://i.imgur.com/I6kpm9Q.png'; spCarta.push(aux41);
var aux42 = 'https://i.imgur.com/j8OfGd8.png'; spCarta.push(aux42);
var aux43 = 'https://i.imgur.com/6gB7Wdc.png'; spCarta.push(aux43);
var aux44 = 'https://i.imgur.com/a7HvvDr.png'; spCarta.push(aux44);
var aux45 = 'https://i.imgur.com/SapZzOj.png'; spCarta.push(aux45);
var aux46 = 'https://i.imgur.com/ijECbX5.png'; spCarta.push(aux46);
var aux47 = 'https://i.imgur.com/vygJ2xR.png'; spCarta.push(aux47);
var aux48 = 'https://i.imgur.com/aAaoqES.png'; spCarta.push(aux48);
var aux49 = 'https://i.imgur.com/NCIdZKi.png'; spCarta.push(aux49);
var aux50 = 'https://i.imgur.com/288V28H.png'; spCarta.push(aux50);
var aux51 = 'https://i.imgur.com/LUVVak6.png'; spCarta.push(aux51);
var aux52 = 'https://i.imgur.com/uGPVJwz.png'; spCarta.push(aux52);

$(function(){
     //#############################################################################################################################################################################################
     //#################################### LOS INCLUDES Y CONEXIONES ############################################################################################################################
     //#############################################################################################################################################################################################

     // Crea la conexión
     var socket = io.connect(
          'http://localhost:8080/'
          //'https://devilcardtrigger.herokuapp.com/'
     );

	canvas = document.getElementById('canvas');
	pantalla = document.getElementById('pantalla');
	ctx = canvas.getContext('2d');
     ctx.fillStyle = 'rgba(255, 255, 255, 1)';

	var divIniciarSesion = document.getElementById('divIniciarSesion');
	var inpUsuario = $('#inpUsuario');
     var inpContrasena = $('#inpContrasena');
     var btnIniciarSesion = $('#btnIniciarSesion');
     var selectInfo = document.getElementById('selectInfo');

	var divMenuUsuario = document.getElementById('divMenuUsuario');

	var selectBaraja = $('#selectBaraja');
	var btnCrearPartida = $('#btnCrearPartida');
     var inpCrearPartida = $('#inpCrearPartida');

	var sectionPartidas = $('#sectionPartidas');

     //############################################################################################################################################################################################################################
     //#################################### ENVIAR SEÑALES AL SERVIDOR PARA LA LÓGICA ###################################################################################################################################################################
     //############################################################################################################################################################################################################################

	// Hacemos click
	canvas.onmousedown = function (e) {
		socket.emit('mousePress', {mousex:(e.x-marginLeft)/res, mousey:e.y/res, usuarioID:usuarioID, usuarioPass:usuarioPass, partidaID:partidaID});
	};

	// Soltamos click
	canvas.onmouseup = function (e) {
		socket.emit('mouseRelease', {mousex:(e.x-marginLeft)/res, mousey:e.y/res, usuarioID:usuarioID, usuarioPass:usuarioPass, partidaID:partidaID});
	};

	// Movemos el ratón
	canvas.onmousemove = function (e) {
		socket.emit('mouseMove', {mousex:(e.x-marginLeft)/res, mousey:e.y/res, usuarioID:usuarioID, usuarioPass:usuarioPass, partidaID:partidaID});

          mousex = (e.x-marginLeft)/res;
          mousey = e.y/res;
	};

	// Si modificamos el usuario o la contraseña todo el progreso se revierte
	inpUsuario.on('input', function (e) {
		divMenuUsuario.style = "visibility:hidden;";
	});

	inpContrasena.on('input', function (e) {
		divMenuUsuario.style = "visibility:hidden;";
	});

	// Iniciamos sesión o registramos el usuarui
     btnIniciarSesion.click(function(){
          socket.emit('iniciarSesion', {usuarioID:inpUsuario.val(), usuarioPass:inpContrasena.val()});
		usuarioID = inpUsuario.val();
		usuarioPass = inpContrasena.val();
     });

	// Iniciamos sesión de vuelta
	socket.on('login', function() {
		divMenuUsuario.style = "visibility:visible;";

		// Limpiamos la lista de partidas
		sectionPartidas.empty();
	});

	// Creamos partida o la continuamos según si ya existe
	btnCrearPartida.click(function(){
		socket.emit('crearPartida', {usuarioID:inpUsuario.val(), usuarioPass:inpContrasena.val(), partidaID:inpCrearPartida.val(), barajaID:selectBaraja.val()});
		partidaID = inpCrearPartida.val();
	});

	socket.on('partidaCreada', (data) => {
		loginScreen = false;
		divIniciarSesion.style.display = "none";
	});

	// Consultamos las partidas
	socket.on('nuevaPartidaConsultada', (data) => {
		sectionPartidas.append('<p style="margin-bottom:-20px;">' + data.partidaID + '</p>');
	});

	// Pulsar enter en los campos de texto
	inpUsuario.on('keypress', function(e) {
  		if (e.keyCode === 13) btnIniciarSesion.click();
	});

	inpContrasena.on('keypress', function(e) {
  		if (e.keyCode === 13) btnIniciarSesion.click();
	});

	inpCrearPartida.on('keypress', function(e) {
  		if (e.keyCode === 13) btnCrearPartida.click();
	});

	// Genera mensajes
	socket.on('nuevoMensaje', (data) => {
		nuevoMensaje(data.mid, data.desc);
	});

     // Bucle main
     setInterval(main, 10);

     function main() {
		if (loginScreen) {
			mainAux(null);
		}
		else {
          	socket.emit('main', {usuarioID:usuarioID, usuarioPass:usuarioPass, partidaID:partidaID});
		}
     }

	//############################################################################################################################################################################################################################
     //#################################### RECIBIR SEÑALES PARA MOSTRAR DATOS ###################################################################################################################################################################
     //############################################################################################################################################################################################################################

	socket.on('cargarImagenesHuecos', (data) => {
          for (var j = 0; j < nHuecos; ++j) {
               if (data.hue[j].hue != "") huecosDraw[j].src = window[data.hue[j].hue];
          }
     });

	socket.on('cargarImagenesCartas', (data) => {
		for (var i = 0; i < nCartas; ++i) {
               cartasDraw[i].src = spCarta[data.car[i].car];
               if (data.car[i].cla != "") claseDraw[i].src = window[data.car[i].cla];
               if (data.car[i].esp != "") especieDraw[i].src = window[data.car[i].esp];
               if (data.car[i].ele != "") elementoDraw[i].src = window[data.car[i].ele];
          }
     });

	socket.on('cargarImagenesMenus', (data) => {
		for (var i = 0; i < 8; ++i) {
			if (data.men[i] != "") menuDraw[i].src = window[data.men[i]];
		}
     });

	socket.on('main', (data) => {
		mainAux(data);
	});

	function mainAux(data) {
		// Lógica
		if (data != null) {
			gestionClases(data);
		}
		gestionSistema();
		gestionMensajes();

		// Dibujo
		if (data != null) {
			drawCampo(data);
			drawSistema(data);
			drawSwapLimbo(data);
			drawCartas(data);
			drawClases(data);
			drawCampoComeback(data);
			drawTrigger(data);
			drawMensajes(data);
			drawNuevoTurno(data);
		}
		drawMensajes();
	}

	//############################################################################################################################################################################################################################
	//#################################### FUNCIONES DE LÓGICA ##############################################################################################################################################################
	//############################################################################################################################################################################################################################

	function gestionSistema() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "rgba(255, 255, 255, 1)";

		// La resolución de pantalla
		var windowWidth = 1280;
		var windowHeight = 720;

		var r1 = window.innerWidth/windowWidth;
		var r2 = window.innerHeight/windowHeight;
		if (r1 < r2) res = r1; else res = r2;
		ctx.canvas.width = windowWidth*res;
	  	ctx.canvas.height = windowHeight*res;
		if (loginScreen) ctx.canvas.height = 250*res; // En el login solo tenemos canvas para los mensajes
		marginLeft = (window.innerWidth-windowWidth*res-16)/2;
		ctx.canvas.style = 'margin-left:' + marginLeft + 'px; margin-top:-16px;';

		if (loginScreen) {
			pantalla.style = "background-image:url('" + sprLoginScreen + "'); width:" + windowWidth*res + "px; height:" + windowHeight*res + "px;"
			+ " background-repeat:no-repeat; margin-left:" + marginLeft + "px; margin-top:-16px; background-size:cover; padding-top:16px; overflow:hidden;";
		}
		else {
			pantalla.style = "";
		}

		// Símbolos de Trigger palpitantes
	     huecoTriggerAng = angular(huecoTriggerAng+1);
	     huecoTriggerSize = 50*(1+Math.cos(huecoTriggerAng*Math.PI/180)/2);



		// Botón de Nuevo Turno
		spNuevoTurno.src = sprNuevoTurnoB;

          if (mousex > 1100-150 && mousex < 1100+150 && mousey > 518 && mousey < 518+50) {
               spNuevoTurno.src = sprNuevoTurno;
               nuevoTurnoAngle = angular(nuevoTurnoAngle+5);
          }
          else {
               if (nuevoTurnoAngle != 0 && nuevoTurnoAngle != 180) nuevoTurnoAngle = angular(nuevoTurnoAngle+5);
               if (nuevoTurnoAngle == 180) nuevoTurnoAngle = 0;
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

	function gestionClases(data) { // El círculo giratorio central para mostrar las clases al pasar por encima
	     if (mousex > data.xCampo+967-clasesSize/2 && mousex < data.xCampo+967+clasesSize/2 && mousey > 587-clasesSize/2 && mousey < 587+clasesSize/2) {
	          clasesSize = Math.min(clasesSize+1, 250);
	     }
	     else {
	          clasesSize = Math.max(clasesSize-1, 40);
	     }

	     if (clasesSize > 40) {
	          spClases.src = sprClasesS;
	          clasesAngle = angular(clasesAngle+2);
	     }
	     else {
	          spClases.src = sprClases;
	     }
	}

	//############################################################################################################################################################################################################################
	//#################################### FUNCIONES DE DIBUJO ##############################################################################################################################################################
	//############################################################################################################################################################################################################################

	function drawCampo(data) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "rgba(255, 255, 255, 1)";

          // El fondo del campo con las zonas
          ctx.drawImage(spFondoNucleos, (18+data.xCampo)*res, 0, 350*res, 720*res);
	     ctx.drawImage(spFondoParamos, (370+data.xCampo)*res, 0, 350*res, 720*res);
	     ctx.drawImage(spFondoPuerta, (726+data.xCampo)*res, 0, 480*res, 720*res);
	     ctx.drawImage(spFondoRuinas, (1200+data.xCampo)*res, 0, 350*res, 720*res);
	     ctx.drawImage(spFondoPozos, (1550+data.xCampo)*res, 0, 350*res, 720*res);

	     ctx.drawImage(spFondoSep, (360+data.xCampo)*res, 0, 40*res, 720*res);
	     ctx.drawImage(spFondoSep, (710+data.xCampo)*res, 0, 40*res, 720*res);
	     ctx.drawImage(spFondoSep, (1178+data.xCampo)*res, 0, 40*res, 720*res);
	     ctx.drawImage(spFondoSep, (1530+data.xCampo)*res, 0, 40*res, 720*res);

          // Los huecos
	     for (var j = 0; j < nHuecos; ++j) {
	          setAlphaParte(data.hue[j].y, mousey);

               var image = huecosDraw[j];

	          ctx.drawImage(image, data.hue[j].x*res, data.hue[j].y*res, data.hue[j].width*res, data.hue[j].height*res);
	          //ctx.fillText(j, huecos[j].x, huecos[j].y);

               var tc = 0;
               if (!data.hue[j].ocupado && !data.hue[j].vert && miCampo(j)) {
               	ctx.drawImage(spHuecoTrigger[tc], (
					data.hue[j].x + 45 - data.huecoTriggerSize/2)*res, (data.hue[j].y + 45 - data.huecoTriggerSize/2)*res,
					data.huecoTriggerSize*res, data.huecoTriggerSize*res);
	               ++tc;
	               if (tc == 6) tc = 0;
	          }
	     }
	     resetAlphaParte();

	     // Candado
	     if (data.candado) {
			drawImageRotate(spCandado, 0, 30, 20, 0, 0, 50, 50, 25, 10);
		}
	}

	function drawSistema(data) {
	     ctx.fillStyle = "rgba(255, 255, 255, 1)";
	     ctx.font = 14*res + "px Georgia";
	     ctx.fillText("Núm. Ejército rival = " + data.nEjercitoRival, (1220+data.xCampo)*res, 710*res);
	}

	function drawSwapLimbo(data) {
		var bot = new Image();
		if (data.sprLimboBoton != "") bot.src = window[data.sprLimboBoton];
	     ctx.drawImage(bot, (1164+data.xCampo)*res, 517*res, 25*res, 75*res);
	}

     function drawCartas(data) {
	     for (var i = 0; i < nCartas; ++i) {
	          if (data.car[i].huecoOcupado >= 0) {
	               // Dibujar la miniatura de la carta o el trasero si está boca abajo
	               var dib = new Image();

	               // Vemos si está volteada la carta del deck
                    if (data.car[i].volteada) dib.src = sprTraseroDMC1;
				else dib.src = cartasDraw[i].src;

	               // Los offsets
	               var xo = data.car[i].x;
	               var yo = data.car[i].y;
	               var xf = offset*(!data.hue[data.car[i].huecoOcupado].vert);
	               var yf = 0;

	               setAlphaParte(data.car[i].y, mousey);

	               // Dibuja la carta
	               drawImageRotateTwo(dib, spSinPV, data.car[i].angleDraw-90, xo+cartaWidth/2, yo+cartaHeight/2, xf, yf, cartaWidth, cartaHeight, cartaWidth/2, cartaHeight/2);

                    // Los iconos de la carta
                    var cla = claseDraw[i];
                    var esp = especieDraw[i];
                    var ele = elementoDraw[i];
                    ctx.drawImage(cla, (data.car[i].x+xf+5+15)*res, (data.car[i].y+5)*res, 25*res, 25*res);
                    ctx.drawImage(esp, (data.car[i].x+xf+5)*res, (data.car[i].y+5+30)*res, 25*res, 25*res);
                    ctx.drawImage(ele, (data.car[i].x+xf+5+30)*res, (data.car[i].y+5+30)*res, 25*res, 25*res);

	               // Carta seleccionada...
	               if (data.car[i].seleccionada) {
	                    // ... Dibuja el marco rojo de seleccionada
	                    drawImageRotate(spCartaSeleccionada, data.car[i].angleDraw-90, xo+cartaWidth/2, yo+cartaHeight/2, xf, yf, cartaWidth, cartaHeight, cartaWidth/2, cartaHeight/2);

	                    // Dibuja el número si está en el Ejército, para saber cuál robas
	                    if (data.car[i].huecoOcupado < 31) {
	                         ctx.fillStyle="rgba(0, 0, 0, 0.8)";
	                         ctx.fillRect((data.car[i].x+2)*res, (data.car[i].y+2)*res, (cartaWidth-4)*res, (cartaHeight-4)*res);

	                         ctx.font = 50*res + "px Georgia";
	                         ctx.fillStyle = "white";
	                         ctx.textAlign="center";
	                         ctx.fillText(data.car[i].huecoOcupado, (data.car[i].x+cartaWidth/2)*res, (data.car[i].y+60)*res);
	                         ctx.textAlign="left";
	                    }
	               }

	               // Dibuja el marco amarillo del General
	               if (data.car[i].general) {
	                    drawImageRotate(spCartaGeneral, data.car[i].angleDraw-90, xo+cartaWidth/2, yo+cartaHeight/2, xf, yf, cartaWidth, cartaHeight, cartaWidth/2, cartaHeight/2);
	               }

	               resetAlphaParte();
	          }
	     }
     }

	function drawClases(data) { // El círculo giratorio central para mostrar las clases al pasar por encima
		// El círculo rotatorio pequeño
		drawImageRotate(spClases, clasesAngle, 967 + data.xCampo, 587, 0, 0, clasesSize, clasesSize, clasesSize/2, clasesSize/2);
	}

	function drawCampoComeback(data) { // Muestra el lado derecho del campo
	     // Los PV de la carta pequeña
	     for (var i = 0; i < nCartas; ++i) {
	          if (data.car[i].huecoOcupado >= 0) {
	               setAlphaParte(data.car[i].y, mousey);

	               // Los offsets
	               var xf = offset*(!data.hue[data.car[i].huecoOcupado].vert);
	               var yf = 0;

	               if (!data.hue[data.car[i].huecoOcupado].vert) for (var j = 0; j < data.car[i].pvmax; ++j) {
	                    if (j < data.car[i].pv) {
	                         ctx.drawImage(spPV, (data.car[i].x+cartaWidth-16 - j*8+xf)*res, (data.car[i].y+cartaHeight-12+yf)*res);
	                    }
	                    else {
	                         ctx.drawImage(spPVB, (data.car[i].x+cartaWidth-16 - j*8+xf)*res, (data.car[i].y+cartaHeight-12+yf)*res);
	                    }
	               }
	          }
	     }

	     resetAlphaParte();

	     drawMenu(data);

	     // El fondo comeback
	     ctx.drawImage(spFondoSep, -27*res, 0, 40*res, 720*res);
	     ctx.drawImage(spFondoDerecha, (1280-360)*res, 0, 360*res, 720*res);
	     ctx.drawImage(spFondoSep, (1280-390)*res, 0, 40*res, 720*res);
	     ctx.drawImage(spFondoSep, (1281-15)*res, 0, 40*res, 720*res);
	     //ctx.drawImage(spFondoDerechaMitad, 1280-360, 0);

	     // La carta gigante
		var img = new Image(); img.src = sprCartaVacia;
		if (data.cartaDrawID != -1) {
			img = cartasDraw[Number(data.cartaDrawID)];
	     }
		ctx.drawImage(img, 940*res, 20*res, 320*res, 450*res);

	     // Los PV de la carta gigante
	     for (var i = 0; i < nCartas; ++i) {
	          if (data.car[i].huecoOcupado >= 0) {
	               if (data.car[i].seleccionada && !data.hue[data.car[i].huecoOcupado].vert) for (var j = 0; j < data.car[i].pvmax; ++j) {
	                    if (j < data.car[i].pv) ctx.drawImage(spPVL, (1178 - j*33)*res, 35*res, 33*res, 21*res);
	                    else ctx.drawImage(spPVBL, (1178 - j*33)*res, 35*res, 33*res, 21*res);
	               }
	          }
	     }
	}

	function drawMenu(data) { // Dibujamos el menú de las cartas
	     // El menú
	     if (data.menuScale > 0) for (var m = 0; m < 8; ++m) {
	          // Preparamos los iconos de los menús
	          var icono = new Image();

	          if (m == 0) { // 0: Restar PV
	               icono = spMenuPVL;
	          }
	          else if (m == 7) { // 7: Girar carta
	               icono = spMenuG;
	          }
	          else if (m == 6) { // 5: Voltear
	               icono = spMenuV;
	          }
	          else if (m == 5) { // 5: Sumar PV
	               icono = spMenuPVM;
	          }

	          // Dibujamos los menús, seleccionados o no
	          if (m != 2 && m != 3) { // Excluimos las 2 de abajo porque quizás no son necesarias y así vemos los PV avanzar en tiempo real
				setAlphaParte(data.car[data.imenuDraw].y, mousey);
	               drawImageRotateTwo(menuDraw[7-m], icono, m*45+data.menuScale*360, data.car[data.imenuDraw].x+cartaWidth/2+offset, data.car[data.imenuDraw].y+cartaHeight/2, 0, 0, menuWidth*data.menuScale, menuHeight*data.menuScale, -20, menuHeight);
				resetAlphaParte();
			}
	     }
	}

	function drawTrigger(data) { // Muestra el umbral de Trigger y el Trigger generado
	     if (data.comenzado) {
	          // El umbral de Trigger numérico
	          ctx.font = 20*res + "px Georgia";
	          ctx.fillStyle = "white";
	          ctx.fillText("Umbral de Trigger = "+data.umbralTrigger, 1050*res, 610*res);
	          ctx.fillText("Trigger total generado = "+data.triggerGenerado, 1017*res, 635*res);

	          // El Trigger total
	          ctx.drawImage(spTrigger, 880*res, 640*res, 400*res, 80*res);

	          // Marcamos el actual
	          ctx.fillStyle="rgba(0, 0, 0, 0.8)";
	          var wd = 23;
	          ctx.fillRect(995*res, 670*res, (12-data.trigger)*wd*res, 50*res);
	          ctx.fillRect(990*res, 670*res, 5*res, 50*res);

	          ctx.fillStyle = "white";
	          ctx.font = 17*res + "px Georgia";
	          ctx.fillText("Trigger actual", 1100*res, 675*res);

	          // Flecha rotatoria
	          drawImageRotate(spReiniciarTrigger, 0, 945, 690, 0, 0, 50, 50, 25, 25);

	          // Las flechas de suma y resta
	          drawImageRotate(spTriggerU, 0, 982.5, 677.5, 0, 0, 25, 25, 12.5, 12.5);

	          drawImageRotate(spTriggerD, 0, 982.5, 702.5, 0, 0, 25, 25, 12.5, 12.5);
	     }
	}

	function drawMensajes() { // Los mensajes de información y restricción que aparecen arriba
	     // Dibuja cada mensaje
	     for (var i = 0; i < nMensajes; ++i) {
	          ctx.font = 13*res + "px Georgia";
	          ctx.fillStyle = "rgba(255, 255, 255, "+mensajes[i].alpha+")";
	          ctx.globalAlpha = mensajes[i].alpha;
	          ctx.drawImage(spMensajeRestriccion, 100*res, (mensajes[i].y-30)*res, 500*res, 50*res);
	          ctx.globalAlpha = 1;
	          ctx.fillText(mensajes[i].text, 110*res, mensajes[i].y*res);
	     }
	}

	function drawNuevoTurno(data) { // Iniciamos un nuevo turno
	     if (data.comenzado) {
	          // El botón de Nuevo Turno
	          var sc = 1 + 0.5*Math.sin(data.nuevoTurnoAngle*Math.PI/180);
			var spNuevoTurno = new Image();
			if (data.sprNuevoTurno != "") spNuevoTurno.src = window[data.sprNuevoTurno];
	          drawImageRotate(spNuevoTurno , 0, 1100, 518, 0, 0, 150*sc, 50, 75*sc, 0);

	          ctx.font = 20*res + "px Georgia";
	          ctx.fillStyle = "white";
	          ctx.fillText("Iniciar Turno", 1040*res, 550*res);
	     }
	}

	//############################################################################################################################################################################################################################
     //#################################### MÉTODOS HELPER ###################################################################################################################################################################
     //############################################################################################################################################################################################################################

     function drawImageRotate(image, angle, positionX, positionY, xoffset, yoffset, width, height, axisX, axisY) { // Dibuja una imagen rotada
          // Save the current co-ordinate system before we screw with it
         ctx.save();
         // Move to the middle of where we want to draw our image
         ctx.translate(positionX*res+xoffset*res, positionY*res+yoffset*res);
         // Rotate around that point, converting our angle from degrees to radians
         ctx.rotate(angle*Math.PI/180);
         // Draw it up and to the left by half the width and height of the image
         ctx.drawImage(image, -axisX*res, -axisY*res, width*res, height*res);
         // And restore the co-ords to how they were when we began
         ctx.restore();
     }

     function drawImageRotateTwo(image, icono, angle, positionX, positionY, xoffset, yoffset, width, height, axisX, axisY) { // Dibuja una imagen rotada y luego otra encima, igual rotada
          drawImageRotate(image, angle, positionX, positionY, xoffset, yoffset, width, height, axisX, axisY);
          drawImageRotate(icono, angle, positionX, positionY, xoffset, yoffset, width, height, axisX, axisY);
     }

     function setAlphaParte(y, my) {
          var yl = 405;
          ctx.globalAlpha = 0.25 + 0.75*((y > yl && my > yl) || (y <= yl && my <= yl));
     }

     function resetAlphaParte() {
          ctx.globalAlpha = 1;
     }

     function miCampo(i) { // Devuelve si el índice pertenece a tus huecos y no del rival
          return i < 93;
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
});
