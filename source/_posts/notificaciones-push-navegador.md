---
title: Notificaciones Push en el navegador
tags:
  - api
  - connect2
  - java
  - spark
id: 92
categories:
  - Java
  - Pet
  - Server Side
date: 2015-07-05 08:50:30
---

Durante los últimos 4 meses he desarrollado mi trabajo de fin de grado, el cual me ha valido para por fin obtener mi título, pero más importante aún, he aprendido mucho sobre el uso de diferentes tecnologías en diferentes contextos. Hoy voy a escribir sobre el sistema que uso para enviar notificaciones push al navegador.

<!-- more -->

Lo que hago es dejar la conexión HTTP abierta con el cliente desde el servidor y voy enviando respuestas parciales hasta que al final envío una que significa final.

Bien es cierto que una buena alternativa sería el uso de sockets, pero también es verdad que me fue muy fácil comenzar a trabajar dejando la conexión HTTP viva y por eso elegí esta opción.

Cuando hablo de notificaciones Push lo hago en el contexto de un diagrama de flujo de este estilo:

[![Push en el navegador](/images/2015/07/Push-en-el-navegador-259x300.jpg)](/images/2015/07/Push-en-el-navegador.jpg)

El usuario en el navegador genera un evento que hace que desde ese momento el servidor necesite enviar mensajes al navegador usando Push y este se los muestre al usuario, es decir,  después del paso 1 y 2 se repetirían de manera sucesiva los pasos  3 y 4 en los que el servidor enviar cierta información al navegador y el JS del cliente sabe como tratarlo para enseñarlo al usuario.

Lo primero es comentar que la aplicación de servidor esta hecha usando [Spark](http://sparkjava.com), y que uso Tomcat 8 sobre la JVM 8 y usando Servlet 3 para poder trabajar con AsyncContext.

La primera petición que se genera desde el cliente al que luego vamos a enviar notificación push la gestiona este trozo de código:
<pre class="lang:java mark:7-10,12 decode:true " title="Crear un cliente">get("/api/auth/device/configuration/:phone", (request, response) -&gt; {
 User currentUser = deviceConfigurationService.findBy(request.session().attribute(CurrentUser));
 Device device = deviceCommunicationService.findBy(request.params("phone"), currentUser);
 if (device == null) {
   return ResponseManager.negativeServerResponse("Fail", "Device not found", 404);
 }
 request.raw().setAttribute("org.apache.catalina.ASYNC_SUPPORTED", true);
 System.out.println(request.raw().startAsync());
 request.raw().getAsyncContext().setTimeout(300000);
 Client client = new Client(request.raw().getAsyncContext());
 deviceCommunicationService.sendRequestToReadAppsTo(device, new DeviceResponseHandler(new Id(device.getNumber(),     currentUser.email()), client));
 client.push(new PartialResonse(50).toString());
 return null;
},
jsonEncoder);</pre>
Como bien comento arriba este pequeño trozo de código ha sido extraído de la API del proyecto Connect2, es por eso que vemos algo de lógica relacionado con comprobar que el Device este activo, las líneas marcadas (7-10, 12) son realmente los elementos importantes, lo primero es asegurar que el contexto asíncrono esta soportado por nuestro contenedor de aplicaciones (Tocamt8), luego aumento el tiempo de vida de la petición a 5 minutos en lugar de los 30 segundos por defecto y por último creo un cliente, el cliente representa al navegador y nosotros desde el código podemos "inyectarle" mensajes (línea 12). El Client sería así:
<pre class="lang:java decode:true mark:36-58" title="Client.java">public class Client {
    private AsyncContext context;
    private boolean isCompatibilityMode;
    private final static String StartMessageFlag = "#start#";
    private final static String FinishMessageFlag = "#finish#";

    public Client(AsyncContext context) {
        this.context = context;
    }

    public synchronized void refreshContext(AsyncContext context, boolean compatibilityMode) {
        if (this.context != null) {
            try {
                this.context.complete();
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
        this.context = context;
        this.isCompatibilityMode = compatibilityMode;
    }

    public synchronized void push(String message) {
        ServletResponse response = null;
        PrintWriter writer = null;

        try {
            if (this.context != null &amp;&amp;
                    (response = this.context.getResponse()) != null &amp;&amp;
                    (writer = response.getWriter()) != null) {
                    writer.println(StartMessageFlag);
                    writer.println(message);
                    writer.println(FinishMessageFlag);
          /* Avoid navigator buffer */
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                    writer.print("                    ");
                writer.flush();
                response.flushBuffer();
                return;
            }
        } catch (Exception e) {
            try {
                this.context.complete();
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
    }

    public void destroy() {
        if (this.context == null) {
            return;
        }

        try {
            this.context.complete();
        } catch (Exception ex) {
        }
    }

}</pre>
Quizás la parte mala de este método es lo sucio que nos ha quedado el push al tener que añadir gran cantidad de líneas en blanco para evitar la cache de respuesta del navegador.

Hasta ahora he enseñado como almaceno la petición en una instancia de Client con la que luego podemos comunicarnos con el navegador, lo siguiente es saber como se genera la primera petición desde el navegador y como se controlan las sucesivas respuestas.
<pre class="lang:js decode:true " title="Enviar la petición desde el navegador">var AjaxRequest = (function (url, data, callback) {
    return {
        ...
        pushClient: function () {
            var xhr = new XMLHttpRequest();
            var lastPos = 0;
            xhr.onreadystatechange = function () {
                if (xhr.status === 200) {
                    callback(xhr.responseText);
                }
            };
            xhr.open("GET", url, true);
            xhr.send();
        }
    }
});</pre>
Esto nos llamaría al primer método que presentamos, y como podemos ver, cuando llega una respuesta lo que hace es ejecutar su callback para que este haga lo que considere necesario, en nuestro caso, el callback aprovecha las marcas que pone el Client en cada respuesta para extraer los sucesivos mensajes y generar los elementos que verá el usuario.
<pre class="lang:js decode:true " title="Tratar el mensaje del Client.java">var ResponseParse = (function () {
    var StartMessageFlag = '#start#';
    var FinishMessageFlag = '#finish#';
    var start = -1;
    var finish = -1;
    var StatusPostion = 1;
    var MessagePosition = 3;
    function createJSONFrom(string){
        var data = string.split(";");
        var result =  {
            status: data[StatusPostion],
            message: data[MessagePosition]
        };
        return result
    }
    return {
        parse: function (rawResponse) {

            start = rawResponse.indexOf(StartMessageFlag, finish != -1 ? finish : 0);
            finish = rawResponse.indexOf(FinishMessageFlag, start);
            var messageStartIndex = start + StartMessageFlag.length;
            return createJSONFrom(rawResponse.substr(messageStartIndex, finish - messageStartIndex))
        },

        reset: function(){
            start = -1;
            finish = -1;
        }
    }

}());</pre>
Hasta aquí la explicación de mi implementación de notificaciones push en el navegador, como bien comento a lo largo de todo el post seguramente hay una forma más eficiente de realizar esta tarea, pero para tareas que no sean recurrentes y entornos donde la eficiencia no es un requisito, el tiempo de implementación que supone esta tecnología sin duda compensa cualquier aspecto malo. Desde mi punto de vista no se sacrifica nada de calidad pero si se gana tiempo para conseguir el mismo objetivo.