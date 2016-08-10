title: Experimentando con programación reactiva
id: 202
categories:
  - Programming
  - Tutorials
  - Kata
date: 2016-05-11 09:00:00
tags:
---
Animado por el último post de mi amigo [Ronny](http://ronnyancorini.es/blog/index.php/2016/05/14/learning-reactive-programming/), he decidido poner en práctica en una kata y con más tranquilidad la programación reactiva.<!-- more --> Mi primera toma de contacto con programación reactiva fue hace algún tiempo cuando [empecé a usar el framework Meteor.js](https://github.com/jdvr/DataBaseSchemaDesigner). Esta vez he hecho una kata y he moldeado yo mismo el sistema, no he seguido un tutorial paso a paso, de esta manera siempre se asumen mejor los conceptos.

## ¿Qué es la programación reactiva? 

Es la programación orientada a streams de datos sobre los que se pueden aplicar innumerables funciones de filtrado, mapeo, combinación,  y por último subscribirse. Todos los streams son observables (patrón observer),  el concepto se explica de maravilla [aquí](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754). 

Para trabajar con streams de datos y todo un set de funciones, tenemos las [Reactive Extensions](https://github.com/ReactiveX), la versión de [Java](https://github.com/ReactiveX/RxJava) es un port hecho por Netflix a partir de la versión de Microsoft para .NET. 



## El ejemplo

Al contrario que en otros de mis post en este no voy a explicar cada una de las clases, me voy a quedar más en la idea. Dentro de la kata, principalmente vamos a encontrar dos tipos de clases, los eventos y los objetos que se suscriben.

La kata elegida es [RPGCombatKata](http://www.slideshare.net/DanielOjedaLoisel/rpg-combat-kata), es una kata iterativa  e incremental basada en un juego RPG. Hacer Katas de juegos es una forma interesante de practicar la capacidad de nuestro código para absorber nuevas funcionalidades. Las reglas y los elementos de un juego suelen estar tan acoplados que el efecto de onda que se produce con cada cambio es muy alto.

Para comunicar los dos tipos de clases que tenemos, está el [bus](https://github.com/jdvr/RxJava-RPGCombatKata/blob/master/src/main/java/es/juandavidvega/rpgcombat/engine/events/EventBus.java). Es el punto común de ambos objetos, así si un objeto quiere recibir eventos de ataque, se suscribe al bus.

En el caso de los eventos que se publican en el bus, y que son recibidos por todos los suscriptores es donde entra en juego todo el set de funciones que nos ofrece RxJava. 

Uno de los elementos de juego es que un personaje, puede lazar un ataque sobre otro.  Cuando se crea un personaje, este suscribe a los eventos de ataque que se publiquen en el bus, y para eso aplica funciones de mapeo y filtrado sobre el stream que nos ofrece el bus.

 En la clase del personaje se hace esto:

{% codeblock lang:java suscripción a los ataques%}
class Character {

 ...
private void damageEvent() {
    subscriptions.add(Damage,
    	this.<DamageEvent>getObservable(Damage)
        	.subscribe(this::manageDamage));
}

 ...

private <T extends Event> Observable<T> getObservable(EventType type) {
	return getEventBus().<T>streamOf(type).filter(this::isMe);
}

 ...

}

{% endcodeblock %}

{% codeblock lang:java En el bus%}


public <T> Observable<T>  streamOf(EventType type) {
    return toObservable()
           .filter(event -> event.is(type))
           .map(filteredEvent -> (T) filteredEvent);
}


{% endcodeblock %}

Cuando se hace una llamada al bus, se indica el tipo de evento sobre el que se quiere el stream, en esa primera llamada se filtran todos los eventos genéricos a los que sean del tipo que se solicita en *streamOf*  y se mapea el stream para que sea un stream del tipo de evento solicitado. Teniendo un stream del tipo *Damage* se aplica un filtro para eliminar todos aquellos que no sean dirigidos a ese personaje, y por ultimo se aplica la suscripción. 

En el objeto _subscriptions_ tenemos todas las suscripciones de un personaje, y cuando este muere, se eliminan todas y así se elimina la posibilidad de recibir, ataques, curas, unión a facciones, etc.


## Conclusión

El primer punto importante es lo complicado que resulta cambiar la mente para pensar en todo como un stream al que se puede suscribir una clase, a pesar de eso me ha encantado este experimento sería un placer intentar realizar algún proyecto con esta tecnología.

El único problema que he tenido es durante el desarrollo de los test, primero empecé usando un bus asíncrono.  Esto me resultaba imposible, había algún test que pasaba a veces si y a veces no, un sin sentido. Luego decidí por cambiar a un bus síncrono y un singleton. El problema de eso fue que se me mezclaban los eventos de diferentes test y según el orden algunos test fallaban. Por suerte, esto último fue sencillo de solucionar, creaba un instancia en el before que luego destruía en el after.

## Links

- [Código completo](https://github.com/jdvr/RxJava-RPGCombatKata)
- [The introduction to Reactive Programming you have been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)
- [RxJava -- Additional Reading](https://github.com/ReactiveX/RxJava/wiki/Additional-Reading)