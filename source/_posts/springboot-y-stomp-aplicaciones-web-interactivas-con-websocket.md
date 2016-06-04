---
title: Aplicaciones web interactivas usando WebSocket
id: 208
categories:
  - Java
  - Pet
  - Programming
  - Server Side
  - spring
  - Tutorials
date: 2015-12-06 13:58:51
tags:
---

Hace aproximadamente 6 meses durante el desarrollo del proyecto Connect2, me vi en la necesidad de realizar una transacción que debía enviar desde el navegador al servidor cierta información y luego finalizar la transacción y esperar que el servidor hiciera una petición a un web service y cuando obtenía la respuesta la mandaba al cliente. La solución rápida y sencilla a ese problema la pueden ver [aquí](http://juandavidvega.es/blog/?p=92 "Notificaciones Push en el navegador"). Sin embargo, me quede con la mala sensación de no haber explorado hasta el final el camino de los WebSockets y por eso he empezado esta serie de post.

&nbsp;

### **¿Qué planeo?**

Escribir tres post en los que explico una aplicación hechas sobre WebSockets, luego añadiré algo más de complejidad a la arquitectura pero la aplicación y su funcionamiento se mantendrán igual. En este primer post me voy a centrar en hacer el Chat, una aplicación con la que explico y uso lo más básico de WebSockets. La idea es avanzar hasta tener un ejemplo que pueda representar una miniaplicación real que pueda ser puesta en producción y que use múltiples elementos, pero que esté sus transacciones de red estén basadas en WebSockets.

&nbsp;

### **¿Qué estamos construyendo en este post?**

Este post es una guía de cómo construir una chat básico en el que los usuarios pueden unirse a un canal único y enviar mensajes a través de él. Usaré WebSocket, una fina capa que trabaja sobre TCP. Para encapsular los mensajes vamos a usar un “subprotocolo” llamado [STOMP](https://en.wikipedia.org/wiki/Streaming_Text_Oriented_Messaging_Protocol) que se usa para trasmitir mensajes de texto de manera que se puedan entender el cliente y el servidor. Añadiremos Spring para facilitar la gestión de WebSocket  (STOMP) en el servidor.

### **Nos ponemos manos a la obra**

Intentaré no perderme en los detalles, voy a guiar de forma algo más genérica el proceso de desarrollo, al contrario que en otros post iré dando información y un porque sobre cada uno de los pasos sin centrarme demasiado en el código.

### 
1\. Creamos el proyecto

Lo primero es crear un proyecto Maven, vamos a utilizar Maven para gestionar nuestra dependencia con Spring Messaging y para incluir el plugin para hacer el build de Spring Boot.

Deberíamos tener algo similar a esto:
<pre class="lang:default decode:true" data-url="https://raw.githubusercontent.com/jdvr/Chapp/master/pom.xml"></pre>

&nbsp;

###  2\. Nuestro modelo de mensajes

He decidido dividir los mensajes en dos tipos, los de entrada (peticiones) y los de salida (respuesta), de esta manera tenemos un mensaje de entrada para cuando se da de alta un usuario. 

<pre class="lang:java decode:true " data-url="https://raw.githubusercontent.com/jdvr/Chapp/master/src/main/java/es/juandavidvega/input/HelloMessage.java"></pre>
Solo incluye un Sender que es el nombre de usuario.

Y como mencioné, tenemos también un mensaje de salida para dar respuesta a esa unión de un nuevo usuario.
<pre class="lang:java decode:true" data-url="https://raw.githubusercontent.com/jdvr/Chapp/master/src/main/java/es/juandavidvega/output/GreetingMessage.java"></pre>

  El otro intercambio de mensajes que hay en nuestra aplicación es la de cuando un usuario envía un texto para publicarlo en la sala de chat, en ese caso esperamos un mensaje de entrada que tenga esta información: 

<pre class="lang:java decode:true" data-url="https://raw.githubusercontent.com/jdvr/Chapp/master/src/main/java/es/juandavidvega/input/UserMessage.java"></pre>
&nbsp;

Y como respuesta generamos un mensaje que está representado por una instancia de este objeto:
<pre class="lang:java decode:true" data-url="https://raw.githubusercontent.com/jdvr/Chapp/master/src/main/java/es/juandavidvega/output/ChatMessage.java"></pre>

  Una vez tenemos todos nuestros mensajes representados como objetos java me gustaría añadir que el envío y recepción de estos objetos entre el cliente y el servidor se hace en formato JSON, para esto Spring se encarga de gestionar la serialización y deserialización de los mensajes JSON a objetos Java usado Jackson JSON, la explicación de cómo funciona Jackson escapa al contexto de este post, así que si no lo conoces, solo es impórtante que entiendas que hay algo que está transformando esos mensajes de cliente a nuestros objetos Java y viceversa.     

### 3\. Manejador de esos mensajes

Para la gestión de mensajes que vamos a usar un controlador Spring, ahora mismo tenemos dos funcionalidades que cubrir, Un usuario que se une a la sala y Un usuario que manda un mensaje a la sala. Creamos una clase añadiendo el estereotipo @Controller de Spring,  y dentro de esta clase incluimos un método por funcionalidad. 

<pre class="lang:java decode:true " data-url="https://raw.githubusercontent.com/jdvr/Chapp/master/src/main/java/es/juandavidvega/action/ChatRoomController.java"></pre>
&nbsp;

A pesar de lo simple de esta clase, hay dos elementos que recalcar, uno es la anotación @MessageMapping, esto nos permite especificar que cuando se reciba un mensaje en la URL “/send/message”, el mensaje es gestionado por el método concreto de este controlador. Otra anotación importante y casi intuitiva es la de @SendTo que funciona justo al contrario de la anterior, es decir, cuando este método devuelve un mensaje, este mensaje debe ser publicado en la url “/chat/new/message”.

Nuestra aplicación funciona con un sistema de publicaciones/suscripciones, podríamos decir que el servidor está subscrito a las publicaciones del cliente en lo que llamamos url de entradas (@MessageMapping) y el cliente está subscrito a la url de salidas (@SendTo) que son en las que el servidor publica sus respuesta, algo a destacar es que vamos a tener un solo servidor atendiendo la entrada pero 1 o más clientes atendiendo a la salida.

###  4\. Configuración de Spring STOMP Messaging

Para que Spring se encargue de la gestión de publicaciones/suscripciones que estoy intentando conseguir es necesario añadir una pequeña configuración.
<pre class="lang:java decode:true " data-url="https://raw.githubusercontent.com/jdvr/Chapp/master/src/main/java/es/juandavidvega/config/WebSocketConfig.java"></pre>

  De nuevo voy a detenerme en explicar el porqué de cada elemento de esta clase. Comenzamos con la anotación @Configuration que es un estereotipo que le indica a Spring que debe interpretar esta clase como una configuración de nuestra aplicación. La segunda anotación es auto descriptiva, @EnableWebSocketMessageBroker nos permite indicarle a Spring que se active el “intercambiador de mensajes” en la capa de los WebSockets. Ahora hacemos extender a nuestra clase de la clase de configuración por defecto que nos ofrece Spring y hacemos override del método “configureMessageBroker”. Este método hace dos cosas, identifica el punto de entrada a la URL “/app” que será el prefijo del contenido de las anotaciones @MessageMapping. También declara un “enableSimpleMesageBroker” que nos permite crear un Message Broker sencillo basado en memoria que será el encargado de gestionar los mensajes que van desde el servidor de vuelta a nuestro cliente y que tienen como prefijo “/chat”. Para acabar con la configuración sobrescribimos el método, “registerStompEndpoints”, que nos permite crear un punto para que el cliente haga una petición y comience la comunicación de mensajes sobre WebSockets.     

### 5\. Crear el cliente

Nuestro cliente hará lo siguiente, primero creara una conexión sobre SocketJS con nuestro servidor, luego se suscribirá a las URL en las que sabe que el servidor publicará mensajes, las que están dentro de las anotaciones @SendTo, una vez se ha abierto la conexión y se han creado las suscripciones, nuestro cliente se queda a la espera de las acciones del usuario.  Nuestro usuario, una vez está conectado al servidor, puede realizar dos acciones, primero unirse a la sala, en ese momento nuestro código JS envía un mensaje STOMP sobre la conexión WebSocket abierta que Spring mapea hasta el método del controlador que mostramos más arriba. La otra acción de nuestro usuario es enviar un mensaje, en este caso y de la misma manera de la anterior se envía un mensaje sobre STOMP a la url de “envío de mensajes” que nuevamente Spring mapea nuestro método del controlador ChatRoomController.  Cuando cualquiera de las acciones son ejecutadas y el mensaje llega a nuestro controlador estamos viendo una comunicación uno a uno, el cliente envía un mensaje al servidor, ahora cuando el servidor gestiona el mensaje y publica la respuesta en la url a las que está suscrito el cliente la comunicación no es uno a uno, la respuesta genera una comunicación que es recibida y atendida por todos los cliente que estén conectados (subscritos) las URL que se encuentran en las anotaciones @SendTo. De este manera conseguimos distribuir el nuevo mensaje ente todos los clientes conectados. Código resultante de nuestro cliente:  Java Script 

<pre class="lang:js decode:true " data-url="https://raw.githubusercontent.com/jdvr/Chapp/master/src/main/resources/static/chat.js"></pre>
Index.html
<pre class="lang:default decode:true " data-url="https://raw.githubusercontent.com/jdvr/Chapp/master/src/main/resources/static/index.html"></pre>

Dependencias: Stomp.js  y SockJS (https://github.com/jdvr/Chapp/tree/master/src/main/resources/static)   

### 6\. Añadir punto de arranque, empaquetar, desplegar y deleitarse en el resultado

Por último, vamos a poner en producción nuestra magnifica aplicación. Vamos a usar la clase de arranque por defecto de Spring Boot, nuestro punto de entrada a la aplicación quedaría así: 

<pre class="lang:java decode:true " data-url="https://raw.githubusercontent.com/jdvr/Chapp/master/src/main/java/es/juandavidvega/ChApp.java"></pre>
&nbsp;

No me voy a extender en la explicación del funcionamiento de Spring Boot pero basta con decir que la anotación @SpringBootApplication permite que el resto de clase que hemos marcado, @Controller, @Configuration, etc sean cargadas he interpretadas en el arranque de nuestra aplicación.

Para empaquetar usaremos el plugin de maven para Spring Boot o nuestro propio IDE, si somos más de consola bastara con ejecutar:
<pre class="lang:sh decode:true" title="crear .jar">mvn clean package</pre>
y luego basta con ejecutar el jar resultante, bien desde nuestro IDE o desde consola:
<pre class="lang:default decode:true" title="Lanzar aplicación">java -jar target/nombre-del-proyecto.jar</pre>
Si ahora te conectas a [http://localhost:8080](http://localhost:8080) deberíamos tener una interfaz similar a esta:

[![head](/images/2015/12/head.jpg)](/images/2015/12/head.jpg)

Si pulsamos Connect

Veremos el siguiente log en la consola JS:

[![log](/images/2015/12/log.jpg)](/images/2015/12/log.jpg)

Y nuestra interfaz cambiará a la siguiente:

[![conected](/images/2015/12/conected.jpg)](/images/2015/12/conected.jpg)

Escribimos nuestro nombre de usuario y como resultado obtenemos:

[![joined](/images/2015/12/joined.jpg)](/images/2015/12/joined.jpg)

Si conectamos otro cliente y hacemos un pequeño ejemplo de conversación el resultado es:

[![conversation](/images/2015/12/conversation.jpg)](/images/2015/12/conversation.jpg)

### Conclusiones

Tras la realización de este ejemplo tenemos una aplicación extremadamente sencilla con una arquitectura sencilla pero con un gran potencia de comunicación cliente servidor y viceversa, como conté arriba esta aplicación irá evolucionando y siempre me centrare en la arquitectura y el protocolo de comunicación, desde luego esta aplicación no cumple muchos de los principios que no ayudan a construir un software de calidad, pero si tu objetivo es comenzar a construir aplicaciones web que introduzcan ese grado de dinamismo gracias a los WebSocket, este es el mejor punto de partida.