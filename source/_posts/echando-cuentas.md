---
title: Echando cuentas
id: 144
categories:
  - Programming
date: 2015-08-16 09:00:19
tags:
---

Es bastante común que las personas tratemos de llevar nuestras finanzas personales usando una hoja de calculo, Fitonic, alguna aplicación de gastos, etc. Yo personalmente uso una hoja de calculo y muchas veces papel y lápiz, si en casa de herrero, cuchillo de palo.

Semana a semana apunto lo que he gastado y luego hago un recuento del mes, me iba de maravilla pero solo echaba de menos una cosa, que a veces si quería echar un vistazo rápido o enseñarle algo a mi pareja tenía que abrir la hoja de calculo y aplicar un filtro, con lo que ello implica, en el móvil es incomodo y en el ordenador, a veces no se tiene a mano y muchas veces da pereza.

Mi solución ha sido combinar la hoja de calculo (Google Sheet) con [Google Script](https://developers.google.com/apps-script/?hl=en), Básicamente ahora mismo he escrito una función que hace un calculo de gastos por concepto y además calcula el total de la hoja.

Normalmente para mi una hoja representa una semana y un libro un mes, el procedimiento es el siguiente, los domingos introduzco los gastos (como siempre he hecho) y desde hace unas semanas, luego abro mi [proyecto](https://script.google.com) de Google Script y ejecuto una pequeña función que hace el calculo mencionado anteriormente y me envía los resultados a mi email.

Ejemplo de Hoja:

[![sheetexample](/images/2015/08/sheetexample.jpg)](/images/2015/08/sheetexample.jpg)

Y este sería un ejemplo del correo resultante:
> Comcepto 1: 219.51 EURO
> 
> Concepto 4: 139.91 EURO
> 
> Concepto 34: 40 EURO
> 
> Concepto 42: 49 EURO
> 
> 
> Total de gastos: 530.27 EURO
Hasta ahora me esta siendo bastante útil, y además es bastante simple:
<pre class="lang:js decode:true">/**
 * Return the total of concept in a sheet.
 *
 * @param {concept} input The concept to be found and acumulate the total.
 * @return Returns the total of concept in this sheet.
 * @customfunction
 */

function calculateTotalOfConcept(concept, range) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var conceptRange =  sheet.getRange(range);
  var conceptRangeValues =  sheet.getRange(range).getValues();
  var valuesRange =  sheet.getRange(conceptRange.getRow(), conceptRange.getColumn() + 1, conceptRange.getNumRows()).getValues();
  var result = 0;
  for (var i = 0; i &lt; conceptRangeValues.length; i++) {
     if (conceptRangeValues[i][0] == concept){
       result += valuesRange[i][0];
    }
  }
  return "Gastos en " + concept + ": " + result + "€";

}

/**
 * Return the total of a range in a sheet.
 *
 * @param {range} 
 * @return Returns the total of range in this sheet.
 * @customfunction
 */

function total(range) {
  var sheet = SpreadsheetApp.getActiveSheet();  
  var valuesRange =  sheet.getRange(range).getValues();
  var result = 0;
  for (var i = 0; i &lt; valuesRange.length; i++) {
       result += valuesRange[i][0];
  }
  return "Total de gastos: " + result + "€";

}

var emails = [];
var concepts = []

function sendReportByEmail(){
  var message = "";
  for(var i = 0; i &lt; concepts.length; i++)
    message += calculateTotalOfConcept(concepts[i], "B2:B23") + "\n";

  message += total("C2:C22");

  for(var i = 0; i &lt; emails.length; i++)
    MailApp.sendEmail(emails[i], "Informe de gastos", message);

}</pre>
La utilización de la API de Google Sheet, esta relativamente bien documentada  y existen varios ejemplos.

&nbsp;

Me gustaría destacar que en este caso el Script lo ejecuto a mano, pero durante unos días lo tuve con un evento, cada vez que se introducía un cambio se ejecutaba y además los comentarios de las funciones son porque si quisiera usarlas en la hoja de calculo como otra función más Google  Sheet usa esos comentarios para ofrecerme autocompletado.

Recursos:

*   [https://developers.google.com/apps-script/reference/spreadsheet/](https://developers.google.com/apps-script/reference/spreadsheet/)
*   [https://developers.google.com/apps-script/articles/sending_emails?hl=en](https://developers.google.com/apps-script/articles/sending_emails?hl=en)
&nbsp;