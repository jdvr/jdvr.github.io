---
title: 'Adiós wordpress, hola hexo :)'
id: 200
categories:
  - Personal
date: 2016-06-05 10:00:00
tags:
---


Desde que empecé el blog he estado usando wordpress en un droplet de digital ocean, y siempre por una cosa u otra he tenido algún tipo de problema. Normalmente era la lentitud y a esto se le sumaba que, sin motivo aparente, alguna vez se quedaba pillado el mysql y comenzaba a dar errores 500. Por último, hace algunos post que empecé a escribir en el portátil de camino al trabajo, en el tren y sin internet, lo que hacía muy tediosa la tarea de  estar copiando posteriormente en el editor de wordpress. Así que empecé a buscar y encontré [Hexo](http://hexo.io).

<!-- more -->	


## Instalación

Si empezamos a leer el [tutorial de instalción](https://hexo.io/docs/setup.html), ya notamos que todo está hecho de forma muy sencilla. Si sigues los pasos que te comenta la guía podrás tener rápido y fácilmente tu blog con Hexo. Lo siguiente que me planteo es cómo puedo migrar mi blog actual a Hexo sin pasar por el rudimentario copia/pega. En el apartado de [migración](https://hexo.io/docs/migration.html), cubre de manera muy cómoda muchas opciones con un simple comando, una maravilla.

## Migración de imagenes

Después de instalar el blog y migrar mi antiguo contenido desde wordpress, comienzo a darme cuenta de algunos problemas como el contenido de algunos bloques de código que estaban hechos con un plugin y no se han migrado bien, pues incluso algunos han desaparecido, mientras que otros han perdido el estilo o han quedado como si nada, problema que aún no he arreglado :(.
El siguiente problema que encontré fue las imágenes. El fichero de exportación de wordpress extrae las imágenes con url absolutas, y mi objetivo era apagar el antiguo servidor, entonces lo que hice fue usar grep para extraer de los ficheros debajo de /source/_post las urls de las imágenes.

{% codeblock lang:sh Extraer las urls de todas las imagenes%}
	grep -i "http://juandavidvega.es/blog/wp-content/uploads"  source/_posts/* > .old-blog/images/urls
{% endcodeblock %}

Lo siguiente fue usar Sublime Text (Find/Replace) y las expresiones regulares para generar un fichero que fuera así:



Directorio 	Imagen
2015/04/ 	1-1.png 
2015/04/ 	1-2.png
2015/04/ 	2-1.png
...

Teniendo esto, lo que hice fue un script que por cada línea que creará el árbol de directorio y descargará la imagen. Para la entrada _2015/04/_ _1-1.png_ crearía un directorio 2015 con el subdirectorio 04 y guardará ahí la imagen 1-1.png

{% codeblock lang:sh Descargar las images%}
#!/bin/bash
while IFS='' read -r line || [[ -n "$line" ]]; do
   spliline=($line)
   if [ -d ${spliline[0]} ]; then 
      cd ${spliline[0]}
   else
      mkdir -p ${spliline[0]}
      cd ${spliline[0]}
   fi
   wget "http://juandavidvega.es/blog/wp-content/uploads/"${spliline[0]}${spliline[1]}
   cd /home/jdvr/projects/juandavidvegaesblog/.old-blog/images
done < urls #fichero de urls
{% endcodeblock %}

Con esto tenía las imágenes, pero los post seguían referenciando a las antiguas pues volvía a usar Find/Replace con Regex. La opción de usar un comando como sed, combinado con grep o alguna otra automatización me echaba para atrás por el tema de que se podía “liar” una buena.

Después de cambiar todas las urls absolutas que apuntaban al antiguo wordpres por “/images/“, lo siguiente fue copiar lo descargado a la carpeta source/images.

## Despliege

Tras esto, tenía que desplegar y de nuevo fui a la web de Hexo que tiene una [documentación](https://hexo.io/docs/deployment.html) para despliege, como con todo, muy masticado y cómodo. En mi caso elegí GitHub Pages.

Algo que no me gustaba es que los despliegues son de estáticos ya generados, que es el contenido de la web final. En internet hay quien sugiere usar un repo separado para los sources, pero mi opción ha sido pushear los sources a una rama de timestamp en cada despliegue.

{% codeblock lang:sh Script de deploy %}
message="deployed at "$(date +%F) 
branch=$(date +%s) 
git add .
git commit -m "$message"
git checkout -b $branch
git push -u origin $branch
git checkout master
sudo hexo generate -d
{% endcodeblock %}

El comando **hexo generate -d** es lo único necesario para generar y desplegar, el resto de elementos es para copiar los sources. En menos de 1 segundo ya esta desplegado :)

## El dominio, Analitycs y Disqus

La configuración es muy sencilla, como explica la [docu de Github Pages](https://help.github.com/articles/using-a-custom-domain-with-github-pages/), lo primero es crear un fichero [CNAME](https://github.com/jdvr/jdvr.github.io/blob/1465453233/source/CNAME) en el directorio source. Luego vas a gestión avanzada de tu zona DSN y añades tres registros: dos registros A (192.30.252.153, 192.30.252.154) y uno CNAME con www. No te olvides de borrar los antiguos registros A que sean tudominio.com. (o @ que significa lo mismo). Un ejemplo del fichero de zona en Hosteurope sería así:

[![Ejemplo de fichero de zona](/images/2016/06/zone-file.png)](/images/2016/06/zone-file.png)

Para añadir analitics es muy sencillo puesto que una vez tengas el identificador de analitycs estilo *UA-XXXXX*, tienes que verificar si tu tema soporta analitycs (busca en la carpeta de layout algun referencia a analitycs). Si es así, sólo ve al fichero de configuración y añade el parámetro google-analitycs (o como sea que tu tema lo tenga definido). En mi caso, el tema no lo soportaba, así que he hecho un fork y lo he añadido yo mismo, [es muy sencillo de hacer](https://github.com/jdvr/hexo-theme-again/commit/1eb28a7ae30cc1b4d0c233537b96d9ec07734fea), apenas son 5 minutos.

Con Disqus pasa lo mismo que con analitycs. Normalmente todo los temas lo soportan,  como fue mi caso en el que lo soportaba, y fue tan fácil como añadir en el config el parámetro *disqus_shortname*.

En resumen, si tienes un pequeño blog (como el mío), en el que escribes por hobby, se gana mucho tiempo y comodidad. Además, no creo que crecer demasiado sea un problema. En producción solo hay estáticos y en generar miles de ficheros, Hexo asegura que tardar unos pocos segundos.


