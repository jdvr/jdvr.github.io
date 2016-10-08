---
cover: /images/2016/10/generate-pdf-fromhtml-cover.JPG
cover_caption: Playa del Camello, Santander
id: 206
title: Generar un pdf a partir de contenido html en el navegador con javascript
date: 2016-10-08 18:55:40
categories:
  - projects
  - tutorials
  - javascript
  - web
tags:
---

Hace poco me ha surgido la necesidad de generar un pdf de una pequeña parte de la página, de algo así como el "carrito" de la aplicación. Tal como tenía hechas las plantillas, era bastante complicado generar un pdf solo de ese contenido, sin repetir alguna plantilla y a eso se le añadía el problema de mantener exactamente el mismo estilo.

Así que después de investigar un poco por allí y por aquí, vi que existía [jsPDF](https://github.com/MrRio/jsPDF/), una solución sencilla para generar pdf en el navegador. El único problema era que no interpreta el css del html, así que el pdf es bastante feo y no mantiene estilos y además no incluye las imágenes.

## ¿Y ahora que? sin estilos, sin imágenes, sin iconos...

A partir de aquí la idea que tuve fue sencilla, si podía sacar una _foto_ de como lo ve el usuario en el navegador, jsPDF me permite incluir como contenido imágenes. Así que investigando como hacer esto encontré [html2canvas](http://http://github.com/niklasvh/html2canvas), una solución con una API simple para convertir una parte del html *que se ve en la página* a una imagen, vamos un screenshot, le pasas un elemento del dom y te devuelve un canvas con el mismo contenido dibujado dentro.

```javascript Dibujas el contenido en un canvas
var contract = $(selectors.CONTRACT_PREVIEW);
var cache_width =  contract.width();
contract.width(imageWithOnPdfPage).css('max-width','none');
html2canvas(contract,{
	imageTimeout:2000,
	removeContainer:true
}).then(function (canvas) {
	var img = canvas.toDataURL("image/png");
});
```

## Generar un pdf con una imagen

Como se puede ver en el script de arriba, una vez obtengo el canvas lo que hago es extraerlo como una imagen. Luego para añadir la imagen es tan simple como:

```javascript Generar un pdf con una imagen
var pdf = new jsPDF({
  unit:'px',
  format:'a4'
});
pdf.addImage(img,'PNG', 0, 0);
pdf.save(contract.id + "_contract.pdf")
contract.width(cache_width);
```

Es decir cuando el cliente da a _exportar como pdf_ mi función completa queda de la siguiente manera:

```javascript Proceso completo html -> Canvas -> img -> pdf
var contractPreview = $(selectors.CONTRACT_PREVIEW);
var cache_width =  contractPreview.width();
contractPreview.width(imageWidthOnPdfPage).css('max-width','none');
html2canvas(contractPreview,{
	imageTimeout:2000,
	removeContainer:true
}).then(function (canvas) {
	var img = canvas.toDataURL("image/png");
	var pdf = new jsPDF({
	  unit:'px',
	  format:'a4'
	});
	pdf.addImage(img,'PNG', 0, 0);
	pdf.save(contract.id + "_contract.pdf")
	contractPreview.width(cache_width);
});
```

Hasta aquí todo bien, pero luego me he encontrado otro tipo de problemas: si la imagen ocupa más de una página la corta, la imagen no queda centrada y si el usuario ha hecho scroll se corta el contenido.

Para el problema de la imagen grande, lo tengo fácil porque en mi caso puedo separar los diferentes elementos del dom y no van a tener tanto contenido como para que pase eso. Hay una solución más compleja que consiste en añadir páginas y añadir la misma imagen aumentando el margen por el número de página, es decir, página 1 margen 0, página 2 margen del alto de la página 1, página 3 margen del alto de la pagina 1 más la 2, algo sucio pero que funciona.

El que la imagen no quede centrada lo arregle con la variable que se puede ver ahí _imageWidthOnPdfPage_ esto fue prueba y error, empece con el ancho de un A4 convertido a pixeles y fui restando hasta que quedo bien centrada. 

Por ultimo el tema del scroll, lo que he hecho ha sido añadir una función _scrollToTop_ y la llamo antes de generar el PDF.

Espero que a alguien le sean de utilidad estas notas y si alguno conoce una forma más cómoda o limpia que lo comente, cualquier feedback será bien recibido.
