//############################################################################################################################################################################################################################
//#################################### VARIABLES E INICIALIZACIONES ##########################################################################################################################################################
//############################################################################################################################################################################################################################

// Variables de control del programa
var canvas = null; // canvas sobre el que trabajaremos
var ctx = null; // contexto del canvas
var mousex, mousey; // Coordenadas del ratón
var marginLeft = 0; // Para ajustar el mouse
var res = 1; // Se hará zoom en el cliente pero el servidor trabaja a 1:1
var candadoAngle = 0; // Para que el candado se agite
var nHuecos = 1+2*(4+2+4)+5+5+6*10+8*3*2+4*2*2;
var nCartas = 31+31;
var huecos = new Array(); // Las imágenes
var cartas = new Array(), clase = new Array(), especie = new Array(), elemento = new Array(); // Las imágenes

for (var i = 0; i < nHuecos; ++i) {
	huecos.push(new Image());
}
for (var i = 0; i < nCartas; ++i) {
	cartas.push(new Image());
	clase.push(new Image());
	especie.push(new Image());
	elemento.push(new Image());
}

// Variables de apariencia
var offset = 13;
var pvWidth = 11;
var pvHeight = 10;
var cartaWidth = 64;
var cartaHeight = 90;

// Tiles y backgrounds
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

var sprCandadoC = 'https://i.imgur.com/yE0JICH.png'; // Candado cerrado
var sprCandadoCS = 'https://i.imgur.com/J6Isyer.png'; // Candado cerrado seleccionado
var sprCandadoO = 'https://i.imgur.com/CFDgobl.png'; // Candado abierto
var sprCandadoOS = 'https://i.imgur.com/HAhlAid.png'; // Candado abierto seleccionado
var spCandado = new Image(); spCandado.src = sprCandadoC; // Candado

var spTrigger = new Image(); spTrigger.src = 'https://i.imgur.com/gxvoW05.png'; // El Trigger
var sprTriggerU = 'https://i.imgur.com/SRiYAWO.png'; // Icono de aumentar Trigger U sin seleccionar
var sprTriggerUS = 'https://i.imgur.com/KYBGf4a.png'; // Icono de aumentar Trigger U seleccionado
var sprTriggerD = 'https://i.imgur.com/0zXeqZn.png'; // Icono de reducir Trigger D sin seleccionar
var sprTriggerDS = 'https://i.imgur.com/PrBj2TJ.png'; // Icono de reducir Trigger D seleccionado
var spTriggerU = new Image(); spTriggerU.src = sprTriggerU; // Icono de aumentar Trigger U
var spTriggerD = new Image(); spTriggerD.src = sprTriggerD; // Icono de reducir Trigger D

var sprMensajeRestriccion = 'https://i.imgur.com/ibGCEPY.png'; // Mensaje de restricción o acción impuesta por bloqueo activo
var sprMensajeInformacion = 'https://i.imgur.com/0GDr9vM.png'; // Mensaje informativo de algo que ha ocurrido

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
	canvas.style.background = '#000';
	ctx = canvas.getContext('2d');
     ctx.fillStyle = 'rgba(255, 0, 255, 1)';

	var r1 = window.innerWidth/ctx.canvas.width;
	var r2 = window.innerHeight/ctx.canvas.height;
	if (r1 < r2) res = r1; else res = r2;
	ctx.canvas.width = 1280*res;
  	ctx.canvas.height = 720*res;
	marginLeft = (window.innerWidth-1280*res)/2-8;
	ctx.canvas.style = 'margin-left:' + marginLeft + 'px; margin-top:-16px;';

     //############################################################################################################################################################################################################################
     //#################################### ENVIAR SEÑALES AL SERVIDOR PARA LA LÓGICA ###################################################################################################################################################################
     //############################################################################################################################################################################################################################

	// Hacemos click
	canvas.onmousedown = function (e) {
		socket.emit('mousePress', {mousex:(e.x-marginLeft)/res, mousey:e.y/res});
	};

	// Movemos el ratón
	canvas.onmousemove = function (e) {
		socket.emit('mouseMove', {mousex:(e.x-marginLeft)/res, mousey:e.y/res});

          mousex = (e.x-marginLeft)/res;
          mousey = e.y/res;
	};

     // Bucle main
     setInterval(main, 10);

     function main() {
          socket.emit('main');
     }

	//############################################################################################################################################################################################################################
     //#################################### RECIBIR SEÑALES PARA MOSTRAR DATOS ###################################################################################################################################################################
     //############################################################################################################################################################################################################################

     socket.on('cargarHuecos', (data) => {
          for (var j = 0; j < nHuecos; ++j) {
               huecos[j].src = window[data.huecos[j].image];
          }
     });

     socket.on('cargarCartas', (data) => {
          for (var i = 0; i < nCartas; ++i) {
               cartas[i].src = data.cartas[i].image;
               clase[i].src = window[data.cartas[i].sprClase];
               especie[i].src = window[data.cartas[i].sprEspecie];
               elemento[i].src = window[data.cartas[i].sprElemento];
          }
     });

	socket.on('mainDraw', (data) => {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = "rgba(255, 0, 255, 1)";
		drawCampo(data);
		drawCartas(data);
		//drawClases(data);
		drawCampoComeback(data); // <- TODO drawMenu()
	});

	function drawCampo(data) {
		var xCampo = data.xCampo;

          // El fondo del campo con las zonas
          ctx.drawImage(spFondoNucleos, (18+xCampo)*res, 0, 350*res, 720*res);
	     ctx.drawImage(spFondoParamos, (370+xCampo)*res, 0, 350*res, 720*res);
	     ctx.drawImage(spFondoPuerta, (726+xCampo)*res, 0, 480*res, 720*res);
	     ctx.drawImage(spFondoRuinas, (1200+xCampo)*res, 0, 350*res, 720*res);
	     ctx.drawImage(spFondoPozos, (1550+xCampo)*res, 0, 350*res, 720*res);

	     ctx.drawImage(spFondoSep, (360+xCampo)*res, 0, 40*res, 720*res);
	     ctx.drawImage(spFondoSep, (710+xCampo)*res, 0, 40*res, 720*res);
	     ctx.drawImage(spFondoSep, (1178+xCampo)*res, 0, 40*res, 720*res);
	     ctx.drawImage(spFondoSep, (1530+xCampo)*res, 0, 40*res, 720*res);

          // Los huecos
	     for (var j = 0; j < nHuecos; ++j) {
	          setAlphaParte(data.huecos[j].y, mousey);

               var image = huecos[j];

	          ctx.drawImage(image, data.huecos[j].x*res, data.huecos[j].y*res, data.huecos[j].width*res, data.huecos[j].height*res);
	          //ctx.fillText(j, huecos[j].x, huecos[j].y);

               var tc = 0;
               if (!data.huecos[j].ocupado && !data.huecos[j].vert && miCampo(j)) {
               	ctx.drawImage(spHuecoTrigger[tc], (
					data.huecos[j].x + 45 - data.huecoTriggerSize/2)*res, (data.huecos[j].y + 45 - data.huecoTriggerSize/2)*res,
					data.huecoTriggerSize*res, data.huecoTriggerSize*res);
	               ++tc;
	               if (tc == 6) tc = 0;
	          }
	     }
	     resetAlphaParte();

	     // Candado
	     drawImageRotate(spCandado, 10*Math.sin(candadoAngle*Math.PI/180), 30, 20, 0, 0, 50, 50, 25, 10);
	}

     function drawCartas(data) {
	     for (var i = 0; i < nCartas; ++i) {
	          if (data.cartas[i].huecoOcupado >= 0) {
	               // Dibujar la miniatura de la carta o el trasero si está boca abajo
	               var dib = cartas[i];

	               // Vemos si está volteada la carta del deck
                    if (data.cartas[i].volteada) dib.src = sprTraseroDMC1;

	               // Los offsets
	               var xo = data.cartas[i].x;
	               var yo = data.cartas[i].y;
	               var xf = offset*(!data.huecos[data.cartas[i].huecoOcupado].vert);
	               var yf = 0;

	               setAlphaParte(data.cartas[i].y, mousey);

	               // Dibuja la carta
	               drawImageRotateTwo(dib, spSinPV, data.cartas[i].angleDraw-90, xo+cartaWidth/2, yo+cartaHeight/2, xf, yf, cartaWidth, cartaHeight, cartaWidth/2, cartaHeight/2);

                    // Los iconos de la carta
                    var cla = clase[i];
                    var esp = especie[i];
                    var ele = elemento[i];
                    ctx.drawImage(cla, (data.cartas[i].x+xf+5+15)*res, (data.cartas[i].y+5)*res, 25*res, 25*res);
                    ctx.drawImage(esp, (data.cartas[i].x+xf+5)*res, (data.cartas[i].y+5+30)*res, 25*res, 25*res);
                    ctx.drawImage(ele, (data.cartas[i].x+xf+5+30)*res, (data.cartas[i].y+5+30)*res, 25*res, 25*res);

	               // Carta seleccionada...
	               if (isSeleccionada(data.cartas[i])) {
	                    // ... Dibuja el marco rojo de seleccionada
	                    drawImageRotate(spCartaSeleccionada, data.cartas[i].angleDraw-90, xo+cartaWidth/2, yo+cartaHeight/2, xf, yf, cartaWidth, cartaHeight, cartaWidth/2, cartaHeight/2);

	                    // Dibuja el número si está en el Ejército, para saber cuál robas
	                    if (data.cartas[i].huecoOcupado < 31) {
	                         ctx.fillStyle="rgba(0, 0, 0, 0.8)";
	                         ctx.fillRect((data.cartas[i].x+2)*res, (data.cartas[i].y+2)*res, (cartaWidth-4)*res, (cartaHeight-4)*res);

	                         ctx.font = 50*res + "px Georgia";
	                         ctx.fillStyle = "white";
	                         ctx.textAlign="center";
	                         ctx.fillText(data.cartas[i].huecoOcupado, (data.cartas[i].x+cartaWidth/2)*res, (data.cartas[i].y+60)*res);
	                         ctx.textAlign="left";
	                    }
	               }

	               // Dibuja el marco amarillo del General
	               if (data.cartas[i].general) {
	                    drawImageRotate(spCartaGeneral, data.cartas[i].angleDraw-90, xo+cartaWidth/2, yo+cartaHeight/2, xf, yf, cartaWidth, cartaHeight, cartaWidth/2, cartaHeight/2);
	               }

	               resetAlphaParte();
	          }
	     }
     }

	function drawCampoComeback(data) { // Muestra el lado derecho del campo
	     // Los PV de la carta pequeña
	     for (var i = 0; i < nCartas; ++i) {
	          if (data.cartas[i].huecoOcupado >= 0) {
	               setAlphaParte(data.cartas[i].y, mousey);

	               // Los offsets
	               var xf = offset*(!data.huecos[data.cartas[i].huecoOcupado].vert);
	               var yf = 0;

	               if (!data.huecos[data.cartas[i].huecoOcupado].vert) for (var j = 0; j < data.cartas[i].pvmax; ++j) {
	                    if (j < data.cartas[i].pv) {
	                         ctx.drawImage(spPV, (data.cartas[i].x+cartaWidth-16 - j*11+xf)*res, (data.cartas[i].y+cartaHeight-12+yf)*res);
	                    }
	                    else {
	                         ctx.drawImage(spPVB, (data.cartas[i].x+cartaWidth-16 - j*11+xf)*res, (data.cartas[i].y+cartaHeight-12+yf)*res);
	                    }
	               }
	          }
	     }

	     resetAlphaParte();

	     //drawMenu();

	     // El fondo comeback
	     ctx.drawImage(spFondoSep, -25*res, 0, 40*res, 720*res);
	     ctx.drawImage(spFondoDerecha, (1280-360)*res, 0, 360*res, 720*res);
	     ctx.drawImage(spFondoSep, (1280-390)*res, 0, 40*res, 720*res);
	     ctx.drawImage(spFondoSep, (1280-15)*res, 0, 40*res, 720*res);
	     //ctx.drawImage(spFondoDerechaMitad, 1280-360, 0);

	     // La carta gigante
		var img = new Image(); img.src = sprCartaVacia;
		if (data.sprCartaDraw != "") {
			img.src = data.sprCartaDraw;
	     }
		ctx.drawImage(img, 940*res, 20*res, 320*res, 450*res);

	     // Los PV de la carta gigante
	     for (var i = 0; i < nCartas; ++i) {
	          if (data.cartas[i].huecoOcupado >= 0) {
	               if (data.cartas[i].seleccionada && !data.huecos[data.cartas[i].huecoOcupado].vert) for (var j = 0; j < data.cartas[i].pvmax; ++j) {
	                    if (j < data.cartas[i].pv) ctx.drawImage(spPVL, (1178 - j*33)*res, 35*res, 33*res, 21*res);
	                    else ctx.drawImage(spPVBL, (1178 - j*33)*res, 35*res, 33*res, 21*res);
	               }
	          }
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

     function isSeleccionada(carta) { // ¿Estás encima de la carta?
          return mousex > carta.x+carta.xoffset && mousex < carta.x+carta.xoffset+carta.width && mousey > carta.y+carta.yoffset && mousey < carta.y+carta.yoffset+carta.height;
     }

     //############################################################################################################################################################################################################################
     //#################################### PRONTO TOdO ESTO DESAPARECERÁ ############################################################################################################################################################
     //############################################################################################################################################################################################################################

	/*function drawMenu() { // Dibujamos el menú de las cartas
	     // El menú
	     if (menuScale > 0) for (var m = 0; m < 8; ++m) {
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
	               drawImageRotateTwo(spMenuA[7-m], icono, m*45+menuScale*360, cartas[imenuDraw].x+cartaWidth/2+offset, cartas[imenuDraw].y+cartaHeight/2, 0, 0, menuWidth*menuScale, menuHeight*menuScale, -20, menuHeight);
	          }
	     }
	}

	function drawClases() { // El círculo giratorio central para mostrar las clases al pasar por encima
	     // El círculo rotatorio pequeño
	     drawImageRotate(spClases, clasesAngle, 967 + xCampo, 587, 0, 0, clasesSize, clasesSize, clasesSize/2, clasesSize/2);
	}

	function drawTrigger() { // Muestra el umbral de Trigger y el Trigger generado
	     if (comenzado) {
	          // El umbral de Trigger numérico
	          ctx.font = "20px Georgia";
	          ctx.fillStyle = "white";
	          ctx.fillText("Umbral de Trigger = "+umbralTrigger, 1050, 610);
	          ctx.fillText("Trigger total generado = "+triggerGenerado, 1017, 635);

	          // El Trigger total
	          ctx.drawImage(spTrigger, 880, 640);

	          // Marcamos el actual
	          ctx.fillStyle="rgba(0, 0, 0, 0.8)";
	          var wd = 23;
	          ctx.fillRect(995, 670, (12-trigger)*wd, 50);
	          ctx.fillRect(990, 670, 5, 50);

	          ctx.fillStyle = "white";
	          ctx.font = "17px Georgia";
	          ctx.fillText("Trigger actual", 1100, 675);

	          // Flecha rotatoria
	          drawImageRotate(spReiniciarTrigger, reiniciarTriggerAngle, 945, 690, 0, 0, 50, 50, 25, 25);

	          // Las flechas de suma y resta
	          var sc1 = 1.5-0.5*Math.cos(triggerFlechaUAngle*Math.PI/180);
	          drawImageRotate(spTriggerU, 0, 982.5, 677.5, 0, 0, 25*sc1, 25*sc1, 12.5*sc1, 12.5*sc1);

	          var sc2 = 1.5-0.5*Math.cos(triggerFlechaDAngle*Math.PI/180);
	          drawImageRotate(spTriggerD, 0, 982.5, 702.5, 0, 0, 25*sc2, 25*sc2, 12.5*sc2, 12.5*sc2);
	     }
	}

	function drawMensajes() { // Los mensajes de información y restricción que aparecen arriba
	     // Dibuja cada mensaje
	     for (var i = 0; i < nMensajes; ++i) {
	          ctx.font = "13px Georgia";
	          ctx.fillStyle = "rgba(255, 255, 255, "+mensajes[i].alpha+")";
	          ctx.globalAlpha = mensajes[i].alpha;
	          ctx.drawImage(mensajes[i].image, 100, mensajes[i].y-30);
	          ctx.globalAlpha = 1;
	          ctx.fillText(mensajes[i].text, 110, mensajes[i].y);
	     }
	}

	function drawNuevoTurno() { // Iniciamos un nuevo turno
	     if (comenzado) {
	          // El botón de Nuevo Turno
	          var sc = 1 + 0.5*Math.sin(nuevoTurnoAngle*Math.PI/180);
	          drawImageRotate(spNuevoTurno, 0, 1100, 518, 0, 0, 150*sc, 50, 75*sc, 0);

	          ctx.font = "20px Georgia";
	          ctx.fillStyle = "white";
	          ctx.fillText("Iniciar Turno", 1040, 550);
	     }
	}

	function drawSwapLimbo() {
	     ctx.drawImage(spLimboBoton, 1164+xCampo, 517);
	}

	function drawSistema() {
	     ctx.font = "10px Georgia";
	     ctx.fillStyle = "rgba(255, 255, 255, 1)";

	     ctx.font = "14px Georgia";
	     ctx.fillText("Núm. Ejército rival = " + nEjercitoRival, 1220+xCampo, 710);
	}*/
});
