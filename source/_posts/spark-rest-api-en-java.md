---
title: 'Spark, Rest API en Java.'
tags:
  - api
  - connect2
  - intellij
  - java
  - rest
  - spark
id: 19
categories:
  - Java
  - Server Side
date: 2015-02-14 11:30:03
---

[Spark](http://sparkjava.com/), es un Framework aunque se comporta más como una librería que esta inspirado en [Sinatra](http://www.sinatrarb.com/), que usando las nuevas funciones de Java 8, nos proporciona una interfaz muy simple y potente par a construir nuestra Rest API o web. Prefiero ejemplificar su gran simplicidad y potencia en un proyecto, así que vamos a ello.
<!-- more -->
El prototipo objetivo es una Rest API que nos permita registrar un ID de dispositivo. Es tan simple como un _"Hello World"_, pero da otra pespectiva.

Una vez la API reciba el ID de dispositivo lo almacenará en una base de datos, que para nuestro ejemplo será un fichero de texto corriente situado en algún directorio del equipo.

Primero creamos nuestro proyecto [Intellij](https://www.jetbrains.com/idea/). Es importante que el SDK y language level del proyecto sean el 8 (1.8).
[![paso1](/images/2015/02/paso1-300x287.png)](/images/2015/02/paso1.png)

Una vez creemos el proyecto tenemos que convertirlo en un proyecto Maven, para que nos sea más simple la tarea de añadir la dependencia con Spark. Intellij nos ofrece soporte para múltiples Frameworks y tecnologías entre ellos Maven, vamos a aprovecharlo.
[![paso2](/images/2015/02/paso2-199x300.png)](/images/2015/02/paso2.png)

Luego buscamos "Maven" y de damos a "Ok".

[![paso3](/images/2015/02/paso3-300x251.png)](/images/2015/02/paso3.png)

Ahora mismo se nos ha generado un árbol de directorios típico de un proyecto Maven y más importante un fichero **_"pom.xml"_**, es el que usa Maven para manejar entre otras cosas las dependencias del proyecto. Abrimos el fichero pom.xml y encima de la etiqueta
<pre class=""> &lt;/project&gt;</pre>
insertamos la etiqueta
<pre> &lt;dependencies&gt; &lt;/dependencies&gt;</pre>
Ahora y como nos dice en la web de Spark en el apartado de [instalación](http://sparkjava.com/documentation.html#getting-started) nos basta con añadir entre las etiquetas dependecies
<pre class=""> 
<dependency>
    <groupId&gt;com.sparkjava</groupId>
    <artifactId>spark-core</artifactId>
    <version>2.1</version>
</dependency>
</pre>
A nuestro fichero pom.xml para tener el Spark disponible en nuestro proyecto. Intellij nos preguntará que hacer con la dependencia que acabamos de añadir y debemos darle a "Enable auto-import".
[![paso4](/images/2015/02/paso4-300x164.png)](/images/2015/02/paso4.png)
[Así están nuestro ficheros hasta el momento.](https://github.com/jdvr/SparkConnect2API/tree/7bbe740b64346df91cf15bcf0aeb5ab383259bb3)

Bien, ya hemos hecho la más complejo, ahora nos basta con añadir una clase que contenga un método Main y ya estará nuestro servidor listo.

[![paso5](/images/2015/02/paso5-300x169.png)](/images/2015/02/paso5.png)

Yo he llamado "Application" a mi clase y he añadido <span style="color: #999999;">_import static spark.Spark.*; _</span> que nos importa los métodos para registrar URL que proporciona Spark.

Ahora, añadimos el registro de nuestro recurso:

*   Method: POST
*   URL: "/register"
*   Params: devid: String
Para registrar una URL de las características anteriores nos bastará con **insertar el siguiente código en nuestro método main**:
<pre class="lang:java decode:true ">post("/register", (req, res) -&gt; {
new IdStorer(DataPath).store(req.queryParams("devid"));
res.type("application/json");
res.body("{\"devid\" : \""+ req.queryParams("devid") + "\"}");
return res.body();
});</pre>
El DataPath en mi caso apunta a fichero del escritorio pero puede ser la ruta de cualquier fichero, eso nos valdrá para el ejemplo.
La clase IdStorer la he colocado en el fichero IdStorer.java:
<pre class="lang:java decode:true ">package es.juandavidvega.connect2.persistance;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;

public class IdStorer {
private final String dataPath;

public IdStorer(String dataPath) {
this.dataPath = dataPath;
}

public void store(String devid) {
PrintWriter writer = null;

try {
writer = new PrintWriter(new File(dataPath));

} catch (FileNotFoundException e) {
e.printStackTrace();
}

if (writer == null) return;
writer.println(devid);

writer.flush();
writer.close();
}
}</pre>
&nbsp;

&nbsp;

Una vez hecho lo anterior nos basta con darle al Play y Spark se encarga de encender un servidor de aplicaciones Jetty y ponerlo a escuchar en el puerto 4567 de nuestro localhost.
[![paso6](/images/2015/02/paso6-300x164.png)](/images/2015/02/paso6.png)

Luego nos basta con realizar una petición HTTP POST a la URL localhost:4567/register con un devid. y luego comprar que se nos ha almacenado en el fichero.

Yo uso DHC (extensión/app de Chrome), hago la petición y realmente funciona.

[![paso7](/images/2015/02/paso7-300x169.png)](/images/2015/02/paso7.png)

Creo que ha quedado bastante claro la simplicidad y potencia de Spark, y habría que añadir que tiene más funcionalidades que no se ven en este pequeño tutorial, pero sin duda promete bastante. Espero que les guste Spark y les ayude en el desarrollo de sus próximos proyectos.

Puedes ver el estado del proyecto al final del tutorial en mi [GitHub](https://github.com/jdvr/SparkConnect2API/tree/c15f62544d706367bd2867a0794782c8357aeea3).