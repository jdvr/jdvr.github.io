---
title: 'Pair programming: Mi guía práctica'
id: 194
categories:
  - Programming
  - Team
date: 2015-11-08 10:13:48
tags:
---

En estos momentos tengo la oportunidad de trabajar en una empresa donde los desarrolladores tenemos libertad para hacer pairing, si bien es cierto que a primera vista esta técnica pueda parecer simple, _“dos personas sentadas juntas programando en el mismo ordenador”_, la realidad es que en mi día a día siento que no aprovecho al 100% lo que el pair programming nos podría aportar y por mi parte probablemente se deba a la falta de conocimiento de como aprovechar mejor las sesiones, por esto mismo he decidido desempolvar todas las referencias que tengo sobre Pair Programming y hacer un pequeño resumen cómodo de consultar.

<!-- more -->

### Descripción

El **Pair programming** es una conversación entre dos desarrolladores que se sientan juntos para desarrollar, analizar y testear de la mejor manera posible una pieza de código. A cambio de sentarse junto los desarrolladores deben:

*   Ayudarse a mantener la concentración mutuamente
*   Añadir ideas mejor refinadas para la implementación del sistema
*   Tomar la iniciativa cuándo su compañero se queda bloqueado
*   Adoptar cada uno de sus roles
&nbsp;

[![driver-navigator](/images/2015/11/driver-navigator.png)](/images/2015/11/driver-navigator.png)

### Roles: Navigator

Es el encargado de:

*   Asegurarse de estar en el entorno de desarrollo correcto: tamaño de letra, IDE, colores, ficheros abiertos, etc..
*   Mantener la mente fija en la meta sin distraer al Driver del “step” que se está dando en ese momento (pensamiento a largo plazo), puede apoyarse en una TODO LIST o un “goal stack”
*   Mantener el rumbo cuando la sesión se desvía, recordar: Baby Steps, [YAGNI ](https://en.wikipedia.org/wiki/You_aren)y [KISS](https://en.wikipedia.org/wiki/KISS_principle).
*   Usar su conocimiento a largo plazo y que esta liberado del “step” para hacer fluir mejor los ciclos de TDD, ej: “Empecemos un test para esto”, “Es momento de refactorizar tal pieza de código”
*   Es importarte reconocer cuando el Driver está concentrado y no interrumpir el flujo.
*   Identificar si se deben intercambiar los roles cuando ve que el Driver esta cansado, o no están siendo capaz de mantener el flujo debido a problemas con algún conocimiento técnico o de negocio.
El Navigator no es un IDE, ni un faraón con escribano, no debe dictar código como si el Driver fuera su herramienta de escritura. Otro error muy común es corregir errores del estilo “falta un punto y coma”, “ojito con el paréntesis”, etc. Por suerte hoy en día contamos con herramientas para programar que son capaces de notar estos errores al instante que se comente y subrayarlo.

### Roles: Driver

Es el que lleva la máquina, es el que suele estar escribiendo la mayor parte del tiempo, su responsabilidad es:

*   Mantener el foco en el “step”, centrase en resolver la pieza de código concreta en la que está trabajando en ese momento
*   Intentar no interrumpir la conversación monopolizando el teclado (este punto es responsabilidad de ambos).
*   Es responsable también de comentar con su compañero el punto de vista que va a tomar para resolver ese problema concreto (no es cuestión de escribir sin comunicar nada y dar por supuesto que el otro nos sigue).

### Aspectos positivos para el equipo

A nivel técnico el Pair Programming contribuye a:

*   Transferencia de conocimiento entre miembros del equipo de manera natural y continua
*   Más fácil adaptación de nuevos desarrolladores, ya que baja la dificultad para empezar a desarrollar en un entorno desconocido
*   “Mejor Naming”: El código será más legible, digamos que ha pasado el “filtro” de dos personas
*   En proyectos grandes donde no se suele conocer en detalle todas las partes de código, ayuda a que al menos sean dos personas las que saben por donde se puede orientar esa parte de la aplicación cuando en 1 semana o un mes haya que hacer cambios.

A nivel personal el Pair Programming contribuye a:

*   Fortalecer la relaciones dentro del equipo
*   Mejorar la confianza en el trabajo de los compañeros y el nuestro propio
*   Dinamizar la jornada de trabajo que puede llegar a ser rutinaria.

### Errores comunes

*   Monopolizar el teclado, aunque el otro lo pida.
*   No pedir el teclado cuando se siente que es necesario. (casi peor que monopolizarlo)
*   No dejar opinar al compañero
*   Posiciones: Los dos tienen que estar igual de cómodos tanto leyendo como escribiendo.
*   Entorno de trabajo no preparado para los dos
*   No descansar (o alternar) de manera eficiente

### Referencias

* [Effective Navigation in Pair Programming](https://www.thoughtworks.com/insights/blog/effective-navigation-in-pair-programming)
* [PairProgrammingMisconceptions](http://martinfowler.com/bliki/PairProgrammingMisconceptions.html)
* [Productive Pair Programming](http://www.carlosble.com/2015/07/productive-pair-programming/)
* [21 ways to hate pair programming](http://agilefocus.com/2009/01/06/21-ways-to-hate-pair-programming/)
* Extreme Programming Explained: Embrace Change (Pág. 56 – 57)

Nota: Como menciono al inicio, es un resumen personal que me sea cómodo de consultar, es probable que algunos elementos les falte contexto y se malinterpreten
