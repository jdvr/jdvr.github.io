---
title: Calistenia de objetos (Object Calisthenics)
tags:
  - educación
  - ejercicio
  - programación
id: 53
categories:
  - Programming
date: 2015-04-14 10:00:19
---

Desde hace aproximadamente 2 años los compañeros de la comunidad y yo, estamos predicando y divulgando la importancia de un código limpio, fácil de leer, fácil de mantener, con test y el gran reto: que sea comprensible para cualquier programador que tenga la fortuna/desgracia de recibir como legado nuestro trabajo.
<!-- more -->
Pero fue hace tan solo 2 semanas o algo así que nos topamos con la Calistenia de Objetos, aunque suene casi a chino, la realidad es que todas y cada unas de sus partes son puro sentido común, empecemos:

> Calistenia:
> 
> 1\. f. Conjunto de ejercicios que conducen al desarrollo de la agilidad y fuerza física.

La Calistenia de objetos son ejercicios para el programador que se formalizan en nueve reglas, las cuales tienen como objetivo que se escriba un código **Sostenible, legible, testeable y comprensible**. Las reglas fueron acuñadas por Jeff Bay en el libro [The ThoughWorks Anthology](https://pragprog.com/book/twa/thoughtworks-anthology).

Antes de definir cada regla es importante entender que ante todo debemos ser pragmáticos y saber adoptar las reglas en su justa medida y en su justo momento, no son un dogma ni una solución Salomónica.

Sin más vamos a por la definición de la reglas:

* * *

**Definiciones:**

<span id="1">
**1\. Un solo nivel de indentación por método:**
Tener más  de un nivel de indentación generalmente hace que un código sea más complicado de leer y mantener, en la mayor parte de los casos no entiendes el método hasta que lo "compilas" y haces una pequeña traza en tu cabeza, trabajo innecesario y fácil de solucionar si creamos un método que sustituya este segundo o tercer nivel de indentación.
[![1-1](/images/2015/04/1-1.png)](/images/2015/04/1-1.png)
Como comente anteriormente la forma de sustituir los niveles de indentación del ejemplo de arriba es usar el patrón de Extración de Métodos presentado por Martin Fowler en su libro Refactoring.
[![1-2](/images/2015/04/1-2.png)](/images/2015/04/1-2.png)
Seguramente no reduciras el número de lineas, incluso aumenta una o dos depende del lenguaje/contexto, pero lo que si es seguro que has mejorado la legibilidad y reducido ese periodo de tiempo que lleva al siguiente programador que ve tu código entender lo que esta pasando.
</span>

<span id="2">
**2\. No ELSE:**
Si, se refiere al else de if/else, ¿A cual si no?. Esta estructura se encuentra en todos los lenguajes de programación comunes y populares (por no decir todos), Sin embargo, ¿Recuerdas la ultima vez que leíste un if/else anidado? ¿Recuerdas el esfuerzo que supone y la cantidad de ruido (lineas que no aportan nada) que añade al código? Dudo que fuera fácil y menos aún divertido, y justo por eso, es recomendable evitar su uso. La forma más fácil de abarcar ese problema en un caso como este:
[![2-1](/images/2015/04/2-1.png)](/images/2015/04/2-1.png)
Sería añadir un return de control de flujo para salir en ese caso:
[![2-2](/images/2015/04/2-2.png)](/images/2015/04/2-2.png)
El caso de arriba es algo optimista y es cuando por ejemplo tienes if para el control de errores y el resto del método continua con el escenario por defecto que se espera de él.

La realidad es que muchos de los casos en los que se necesita un if/else o un swich se pueden resolver aplicando el polimorfismo (Patrón Strategy) o usando estructuras de datos como un mapa o un array clave-valor.
</span>

<span id="3">
**3\. Envuelve, agrupa los tipos primitivos y las string:**
Esta es quizás, la regla más simple de seguir,  simplemente tienes que encapsular o sustituir todos los tipos primitivos por objetos, con el objetivo de evitar el antipatrón [Obsesión Primitiva](http://c2.com/cgi/wiki?PrimitiveObsession).

Si tu variable primitiva tiene algún tipo de comportamiento entonces es obvio que debe ser encapsulada, por ejemplo, el dinero o el tiempo (horas, dia, etc)
</span>

<span id="4">
**4\. Usa clases para encapsular las colecciones:**
**Cualquier clase que contenga una colección (Set, Map, List), no debería contener ningún otro campo o atributo.** Cualquier conjunto de elementos que aparezca en tu código y quieras manipular debe tener una clase especifica para ello.

Ahora, de esta manera, cada colección y su comportamiento quedan encapsulados en su propia clase.

</span>

<span id="5">
**5\. Solo un punto por linea:**
Este punto no requiere de definición pero si me gustaría aclarar que es importante entender que en el caso de las Fluent Interface es absurdo intentar restringirlas, es otro contexto.

Sin embargo, el hecho de poner más de un punto (flecha) por linea en muchas ocasiones es indicativo del antipatrón [Message Chain](https://sourcemaking.com/refactoring/message-chains).

</span>

<span id="6">
**6\.  No abrevies:**
Si un método tienen un nombre demasiado largo, o demasiado repetitivo seguramente no esta cumpliendo el principio de responsabilidad única (SRP). A parte de este hecho y volviendo a la labor de intentar reducir el tiempo que pasa desde que un programador entra en contacto con código hasta que logra comprender las abreviaciones de palabras no son nada buenas y generalmente obligan al celebro a pensar y tienden a olvidar con lo cual hay que volver a consultar constantemente a que se refería esa abreviatura.

</span>

<span id="7">
**7\.  Entidades/Clases pequeñas:**
A lo que esta idea se refiere es simplemente que entre mayor es un fichero o incluso un paquete más difícil es de leer, entender y mantener.
Yo principalmente y siempre depende del proyecto intento no tener más de 150-200 lineas y más de 10 archivos.
</span>

<span id="8">
**8\. No clases con más de dos variables (campos, atributos):**
Seguramente esta sea una de las más complicadas y de hecho es una de las que yo personalmente menos aplico a primera vista, suelo hacer un refactor, por otro lado es una de las reglas que más cohesión y encapsulamiento van a aportar a nuestro código

Un ejemplo con una imagen que además tiene en cuenta la regla 3:

[![8-1](/images/2015/04/8-1.png)](/images/2015/04/8-1.png)

Yo aún no he conseguido averiguar por que el motivo de limitarlo a dos, lo que si estoy seguro es que cuando te propones hacer el refactor de un código para aplicar esta linea lo que optienes son clases mucho más claras, faciles de manejar y que normalmente también cumplen la regla 3\. Dos pájaros de un tiro.

</span>

<span id="9">
**9\. No getter/setter/propiedades **
_**Pide, no preguntes.**_

> Procedural code gets information then makes decisions. Object-oriented code tells objects to do things.
> 
> — Alec Sharp

Cuando un accesor se limita a contar el estado de un objeto, entonces es correcto por que ese es su propósito. Sin embargo y en muchas ocasiones lo que vemos es que se usa el accesor para consultar el estado y en función de eso tomar una decisión.

Por ejemplo:

[![9-1](/images/2015/04/9-1.png)](/images/2015/04/9-1.png)

No tiene sentido utilizar los accesores de esa forma si podemos hacer lo siguiente:

[![9-2](/images/2015/04/9-2.png)](/images/2015/04/9-2.png)

</span>

Desde mi punto de vista todas y cada una de las reglas son útiles y además aplicables en un entorno real desde el momento que se conocen, si bien es posible que la aplicación conjunta de todas las reglas pueda ser muy complicado, conviene recordar que el objetivo no es aplicarlas todas a la vez ni aplicarlas como si fueran un dogma o un mandamiento obligatorio. Es importante recordar que uno de los factores más importantes del desarrollo software es el contexto y la realidad es que el único que puede manejar el contexto y como lo mejoran estas reglas es el desarrollador que se encuentra sentado con el teclado tratando de crear buen código.

También añadir que desde mi experiencia personal todas y cada una de las reglas han mejorado mi habilidad como programador y han ayudado a que me comunique mejor con otros colegas de profesión.

Fuente: http://williamdurand.fr/2013/06/03/object-calisthenics/