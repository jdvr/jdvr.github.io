---
title: Desplegar en un hosting con ftp
cover: /images/2016/08/cover-ftp.jpg
cover_caption: Camino a La Pedriza, Madrid
date: 2016-08-19 17:28:19
id: 204
categories:
  - Programming
  - Tutorials
  - ftp
  - deploy
tags:
---
En los hosting compartidos normalmente no se puede acceder por SSH, ni se tiene posibilidad de ejecutar un script, ni descargar de un repositorio para luego ejecutar un comando de despliegue, es decir, en general esta bastante limitado.

El acceso que siempre suele estar habilitado es por FTP, así que voy a explicar un pequeño script que uso para desplegar el proyecto en el que trabajo ahora mismo.
<!-- more -->
## LFTP: FTP de manera cómoda 

Mi script de despliegue tiene tres partes: en la primera historifico la antigua carpeta "deploy/next" y luego copio los ficheros del próximo deploy a "deploy/next", la segunda es generar un release con git y por último la subida al FTP:

{% codeblock lang:sh Script de despliegue%}
#!/bin/bash
#back up and copy

...

#release

...

#upload to server
FTP_USER=$1;
FTP_PASSWORD=$2;
SITE="ftp.server.com;";
DISABLE_SSL="set ssl:verify-certificate no;";
SOURCEDIR="./next/";
TARGETDIR="/public_html/target";
lftp -c "open -u $FTP_USER,$FTP_PASSWORD $SITE $DISABLE_SSL  mirror -R $SOURCEDIR $TARGETDIR"
{% endcodeblock %}

[LFTP](https://lftp.yar.ru/) es un programa que facilita mucho el uso de ftp, la opción -c nos permite pasar una lista de comandos a ejecutar, los comandos son: 
"open" con la opción -u y el usuario y la contraseña, luego desactivo el ssl y por último el comando mirror con la opción -R que lo que hace es duplicar el contenido de un directorio local en uno remoto.

Para que duplique el contenido del directorio local en el remoto, hay que usar el directorio remoto sin "/" al final, si en mi script cambio el _TARGETDIR_ a "/public_html/target/" en el servidor se crearía una carpeta next con su contenido.

Si el _TARGETDIR_ es "/public_html/target/" y el contenido de la carpeta "./next/" fuera "example.file" el resultado sería:

{% codeblock lang:sh Resultado%}
/public_html/target/
  |_next
    |_example.file
{% endcodeblock %}

Por el contrario, si el _TARGETDIR_ es "/public_html/target" y el contenido de la carpeta "./next/" fuera "example.file" el resultado sería:

{% codeblock lang:sh Resultado%}
/public_html/target/  
  |_example.file
{% endcodeblock %}