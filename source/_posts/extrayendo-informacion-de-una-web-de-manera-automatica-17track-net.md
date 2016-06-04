---
title: Extrayendo información de una web de manera automática. 17Track.net
tags:
  - api
  - java
  - mail
id: 155
categories:
  - Java
  - Pet
  - Programming
  - Server Side
date: 2015-09-06 08:17:01
---

Hace algunos días compre un producto por internet. Por costumbre tengo hacer el tracking de los paquetes usando [17track](http://17track.net/) esta web china tiene un sistema de seguimiento muy bueno, siendo capaz de aportar información de casi cualquier origen a cualquier destino, sin importar cual sea la compañía que lo envía, y esto es gracias a sus numerosos acuerdos con compañías de transporte, misma razón por la cual no tiene una API pública.
<!-- more -->
Durante la espera para que llegue mi paquete suelo comprobar una vez al día el estado del tracking, una tarea bastante aburrida y que preferiría que fuera automática.

### Hazlo tú, que a mi me da pereza

Como no podía ser de otra manera me puse a buscar la forma de automatizar esta tarea y bien, aquí surgen las dudas más importantes:

1\. ¿Como lanzo una búsqueda? (¿Cuál es la URL de la "API"?)

2\. ¿Como simulo la búsqueda para obtener la información de mi paquete? (Hago la llamada a la "API")

3.  Una vez se realiza la búsqueda, ¿Cómo extraigo solo los datos que me interesan? (Como parseo la respuesta)

La primero cuestión fue simple pues solo hay que fijarse un poco para notar que cuando le damos a "buscar" **con un solo número** de paquete la web nos lleva a una URL de este estilo

<span style="color: #666699;">**_http://www.17track.net/en/result/post-details.shtml?nums=US123456RL_**</span>

Donde lo que se encuentra después del igual es nuestro número de paquete (<span style="color: #666699;">**_US123456RL_**</span>), antes de lo esperado ya tenía la "URL de la API", así que a resolver el resto de cuestiones.

Inicié una pequeña investigación por google para resolver mi primera cuestión, y en poco tiempo encontré dos opciones:

1\. http://jsoup.org/ --&gt; Un parser HTML que puede descargar el documento desde una URL, una librería con una interfaz de uso estupenda, que recomiendo.

Pero en mi caso no es valida por que la única forma que tengo de obtener los datos es que la web pueda ejecutar el JS una vez se ha hecho la carga del documento, así que pase a la siguiente opción:

2\. http://sourceforge.net/projects/htmlunit/ --&gt; Un navegador en java que no tiene interfaz, en mi contexto, una maravilla que cumple justo lo que necesito, además una vez realiza la petición y simulada la carga de documento y la ejecución de JS. Nos ofrece una interfaz que permite acceder a la estructura del html generado.

A estas alturas ya se a que URL tengo que realizar la petición, se como procesarla para obtener la información y con la misma librería puedo realizar el filtrado para quedarme solo con el texto que me interesa. Mis tres cuestiones están resueltas.

El trozo de código necesario para realizar esto sería:
<pre class="lang:java decode:true" title="Descargar y filtrar información de una web.">public static final String BASE_URL = "http://www.17track.net/en/result/post-details.shtml?nums=";

public String track(String trackNumber) throws IOException {
   final WebClient webClient = new WebClient(BrowserVersion.FIREFOX_38);
   final HtmlPage page = webClient.getPage(BASE_URL + trackNumber);
   final HtmlSection section = page.getHtmlElementById("events");
   return section.asText();
}</pre>
Nota: el _Magic String_ "events" es debido a que la sección de la web que tiene el texto que me interesa tiene como id "events".

Como ven la librería ofrece una interfaz intuitiva, podríamos eliminar variables y escribir en un sola linea o extraer algún método que nos de los web client, o nos construya la URL, pero refactor a parte, escrito de esta manera se demuestra la simplicidad y potencia que quiero recalcar.

Volvamos a la resolución de mi problema, ahora poseo la información que necesito y tengo un ".jar" en mi servidor que se ejecuta diariamente y extrae dicha información, hasta aquí genial pero si luego tengo que conectarme por ssh a la máquina para ver los resultados, es aún peor que consultar la web.

### Enviame un mail

Así que, decidí que la información obtenida por el método anterior se envíe por correo, tarea también sencilla si nos proveemos de la librería adecuada, en mi caso no indague demasiado y me quede con la primera opción que encontré:

[http://mvnrepository.com/artifact/javax.mail](http://mvnrepository.com/artifact/javax.mail)

De igual manera que la librería anterior considero que aporta una interfaz muy sencilla, que realiza de manera efectiva su función.
<pre class="lang:java decode:true" title="Enviar un mail">public class MailSender {

    private final String to;
    private final String messageBody;

    public MailSender(String to, String messageBody){
        this.to = to;
        this.messageBody = messageBody;
    }

    public void send(){

        Session session = Session.getDefaultInstance(getMailProperties());
        try{
            MimeMessage message = new MimeMessage(session);
            message.setFrom(new InternetAddress(From.value()));
            message.addRecipient(Message.RecipientType.TO,
                                 new InternetAddress(to));
            message.setSubject(Subject.value());
            message.setText(messageBody);
            Transport.send(message);
        }catch (MessagingException mex) {
            mex.printStackTrace();
        }

    }

    private Properties getMailProperties() {
        Properties properties = System.getProperties();
        properties.setProperty("mail.smtp.host", Host.value());
        return properties;
    }

}
</pre>
&nbsp;

De nuevo, tenemos una clase, que refactor a parte, se entiende muy bien y en menos de 5 min te permite pasar de estar buscando una solución en google a haber enviado un email.

Esto es un ejemplo del contenido del email resultante:
> Destination Country
> 
> 
> 2015-08-26 00:00
> 
> Delivered
> 
> 2015-08-26 00:00
> 
> In the delivery process
> 
> 2015-08-20 00:00
> 
> Dispatch from the point of origin international office
> 
> Origin Country - Cache Time:2015-09-06 03:35 - Go to official website2015-08-26 14:19
> 
> The item has been delivered successfully
> 
> 2015-08-21 08:54
> 
> The item has arrived in the country of destination
> 
> 2015-08-20 09:30
> 
> The item is on transport to the country of destination
> 
> 2015-08-20 08:59
> 
> The item is at the PostNL sorting center
> 
> 2015-08-19 12:14
> 
> The item is at the handover point from freight carrier to PostNL
> 
> 2015-08-18 08:03
> 
> The item has arrived in the transit airport
> 
> 2015-08-18 06:35
> 
> The item has left the originating country
> 
> 2015-08-17 13:37
> 
> The item is received by the shipper in the originating country
> 
> 2015-08-17 11:51
> 
> The item is ready for shipment
> 
> 2015-08-17 06:00
> 
> The item is pre-advised
> 
> 2015-08-17 04:48 _&lt;-- Fecha del evento_
> 
> The Item is at the shippers warehouse  _&lt;-- Evento_

### Pan para hoy, hambre para mañana

Una vez había construido una pequeña aplicación que hacia el tracking del paquete que estaba esperando y me enviaba a mi un email, pensé: _"Cuando quiera hacer tracking de otro paquete, quiera dejar de hacer tracking de este o quiera que un paquete concreto se envié a otro email, voy a tener que modificar, recompilar y subir el ."jar""_, es decir, tenía ahora un trabajo más tedioso que el que pretendía solucionar.

Así que añadí el concepto de "NotifyTask", un objeto que contiene el número de seguimiento y el email al que enviar la información, y construí una clase que dado un "NotifyTaskSet" me devolviera el "PackagesInfo" con cada uno de los paquetes a los que se realizó seguimiento, para luego yo, enviar esa información por email.
Lo siguiente fue añadir un loader, que extrajera los "NotifyTask" de un fichero json y en este momento me encuentro desarrollando una API que me permita añadir y quitar "NotifyTask" de manera cómodo para mi y para la gente que va a usar esta app.
Repositorio: [17TrackMailer](https://github.com/jdvr/17TrackMailer)