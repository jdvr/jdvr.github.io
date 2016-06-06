---
title: 'Adiós wordpress, hola hexo :)'
id: 200
categories:
  - Personal
date: 2016-06-05 10:00:00
tags:
---

Desde que empece el blog, he estado usando wordpress en un droplet de digital ocean, y siempre por una cosa u otra he tenido algun tipo de problema, normalmente era lento, a esto se le sumaba que sin motivo aparente alguna vez se quedaba pillado el mysql y comenzaba a dar errores 500 y por ultimo, hace algunos post que empecé a escribir en el portátil de camino al trabajo, en el tren, sin internet, estar copiando luego en el editor de wordpress me resultaba muy tedioso. Así que empecé a buscar y encontré [Hexo](http://hexo.io).


<!-- more -->	

## Instalación

Si se empieza a leer el [tutotial de instalción](https://hexo.io/docs/setup.html), ya se nota que esta todo hecho de forma muy sencilla, así que sigues los pasos y ya tienes tu blog con Hexo. Lo siguiente que me planteo es, como puedo migrar mi blog actual a Hexo sin pasar por el rudimentario copia/pega. Y siguen las buenas noticias, en el apartado de [migración](https://hexo.io/docs/migration.html), cubre de manera muy cómoda muchas opciones con un simple comando, una maravilla.

## Migración de imagenes

Después de instalar el blog y migrar mi antiguo contenido desde wordpress, comienzo a darme cuenta de algunos problemas, el contenido de algunos bloques de código que estaban hechos con un plugin no se han migrado bien, algunos ha desaparecido, algunos han perdido el estilo y otros han quedado como si nada, problema que aún no he arreglado :(.

El siguiente problema fue la imagenes, el fichero de exporatción de wordpress extrae las imagenes con url absolutas, y mi objetivo era apagar el antiguo servidor, entonces lo que hice fue usar grep para extraer de los ficheros debajo de /source/_post las urls de las imagenes.

{% codeblock lang:sh Extraer las urls de todas las imagenes%}
	grep -i "http://juandavidvega.es/blog/wp-content/uploads"  source/_posts/* > .old-blog/images/urls
{% endcodeblock %}

Lo siguiente fue usar Sublime Text (Find/Replace) y las expresiones regulares para generar un fichero que fuera así:



Directorio 	Imagen
2015/04/ 	1-1.png 
2015/04/ 	1-2.png
2015/04/ 	2-1.png
...

Teniendo esto lo que hice fue un script que por cada linea, creará el árbol de directorio, y descargará la imagen. Para la entrada _2015/04/_ 	_1-1.png_ crearía un directorio 2015 con el subdirectorio 04 y guardará ahí la imagen 1-1.png

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

Con esto tenía las imagenes pero los post seguian referenciando a las antiguas, pues volvía a usar Find/Replace con Regex, la opción de usar un comando como sed, combinado con grep o alguna otra automatización me echaba para atras por el tema de que se podía liar una buena. 

Despúes de cambiar todas las urls absolutas que apuntaban al antiguo wordpres por "/images/" lo siguiente fue copiar lo descargado a la carpeta source/images.

## Despliege

Después de todo esto, tenía que desplegar y de nuevo fuia la web de Hexo que tiene una [docu](https://hexo.io/docs/deployment.html) para despliege, como con todo muy masticado y cómodo. En mi caso elegí GitHub Pages. 

Algo que no me gusta es que los desplieges son de estaticos ya generados, que es el contenido de la web final. En internet hay quien suguiere usar un repo separado para los sources, pero mi opción ha sido pusear los sources a una rama de timestamp en cada despliegue.

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

El comando *hexo generate -d* es lo único necesario para generar y desplegar, el resto de elementos es para copiar los sources. En menos de 1 segunda ya esta desplegado :)

## Conclusión

