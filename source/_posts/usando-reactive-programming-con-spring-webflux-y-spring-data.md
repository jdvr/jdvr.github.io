---
title: Reactive Web Application con Spring WebFlux y Spring Data
date: 2017-03-05 11:28:42
cover: /images/2017/03/telde-por-la-ventana.jpg
cover_caption: East Gran Canaria coast, Telde, Gran Canaria
id: 207
categories:
  - Java
  - Spring WebFlux
  - Spring Data
  - Mongo
  - Reactive Programming
  - Spring Boot
  - tutorial
tags:
---

Hace una semana leí el [post](https://spring.io/blog/2017/02/23/spring-framework-5-0-m5-update) de la milestone 5 de Spring MVC 5.0 y viendo los avances que habían hecho desde [mi última prueba](https://github.com/jdvr/spring-5-m2-reactive-web-app) de las nuevas características reactivas, decidí aventurarme de nuevo a echar un ojo a ver que nos preparan para las siguientes versiones. Esta vez escogí Spring Boot 2.0 (SNAPSHOT) que será el encargado de incluir en el proyecto Spring Boot las características de **Spring WebFlux** que es como han llamado a esta nueva parte reactiva de Spring.

Sin complicarme demasiado y dejando a un lado la originalidad, mi objetivo era crear un _CRUD_ sobre tareas asignadas a un equipo. Con esto me ha bastado para explorar no solo la capa de routing (_@RestController, @GetMapping, etc.._) sino  también he indagado un poco como funcionará Spring en su capa de persistencia con Spring Data 2.0-Kay.

## Spring WebFlux

Mientras que a nivel de código (que explicaré más adelante) y por la abstracción que proporciona Spring (aka _Magia Negra_) apenas encontramos diferencias. La realidad es que tienen una orientación completamente distinta. Spring WebFlux está orientado al uso de contenedores de aplicaciones no bloqueantes (Netty en mi caso). Estos contenedores funcionan con un  loop de eventos sin bloquear nunca la entrada/salida y sirviendo de manera asíncrona.

Al declarar un controlador podremos seguir usando la anotación _"@RestController"_ que se comportará como siempre y por supuesto dentro de un controlador incluiremos las rutas como métodos usando la anotación de método _"@GetMapping"_ que a diferencia del mapeo clásico, por defecto     produce un _event-stream_ como respuesta del Content-type del http.

```java Controlador para cargar todas las tareas existentes

@RestController
public class SubscribeToAllTask {

    private final TaskRetriever taskRetriever;

    @Autowired
    public SubscribeToAllTask(TaskRetriever taskRetriever) {
        this.taskRetriever = taskRetriever;
    }

    @GetMapping(path = "all-task.flux", produces = "text/event-stream")
    public Flux<Task> all () {
        return taskRetriever.findAll();
    }

}

```

Lo destacable de este controlador es que devuelve un [Flux](https://github.com/reactor/reactor-core#flux). Al devolver un flux de _Task_ y con el Content-Type como _"text/event-stream"_ **lo que hacemos es enviar de manera asíncrona como datos en un stream las tareas que hay al navegador. Que las recibe como [Server-sent Events](https://en.wikipedia.org/wiki/Server-sent_events) y deja un canal abierto de una sola dirección entre servidor y cliente.**

Este Stream de datos abierto nos permite realizar operaciones de manera asíncrona e ir informando al cliente del estado. Por ejemplo, para la creación de una nueva tarea lo que hago es devolver un Flux de _OperationStatus_ un enumerado que incluye Start, Complete y Error, de esta manera cuando se recibe la petición se crea un flux en el que se publica un _OperationStatus_ que es _Start_ y de manera asíncrona se gestiona el resto de la lógica de creación.

```java Lógica para crear una tarea
public Flux<OperationStatus> create (NewTask newTask) {
    Mono<Team> teamMono = teamRetriever.findByName(newTask.getTeamName());
    LocalDateTime dueDate = LocalDate.parse(newTask.getDueDate(), DateTimeFormatter.ISO_LOCAL_DATE).atStartOfDay();
    // async block
    Consumer<? super FluxSink<OperationStatus>> statusEmitter = stream -> {
        stream.next(OperationStatus.START); 
        teamMono.subscribe(t -> {
            Mono<Task> saved = taskStorer.save(new Task("", t, dueDate, newTask.getTitle()));
            saved.subscribe(savedTask -> {
                stream.next(OperationStatus.SUCCESS); 
                stream.complete(); 
            }, error -> {
                stream.next(OperationStatus.ERROR);
                stream.error(error);
                stream.complete();
            });
        });
    };
    // async block
    return Flux.create(statusEmitter);
}

```

La búsqueda del equipo es también asíncrona ya que se usa un repositorio reactivo de mongodb, debemos declarar la  búsqueda y subscribirnos al [Mono](https://github.com/reactor/reactor-core#mono) que nos devuelve y esperar recibir el equipo. Cuando recibimos el equipo llamamos a un servicio para guardar la nueva tarea que es tambien asíncrono y debemos suscribirnos para gestionar que se guarde la tarea o que ocurra un error. Todo esto se incluye dentro de un _FluxSink_ que nos permite ir emitiendo estados _"en caliente"_ y mantener el contexto. El código es ampliamente mejorable para evitar indentaciones pero he querido dejarlo así para que se pueda leer junto.

Cuando una nueva tarea es creada, si alguien ha llamado al primer _endpoint_ que puse del controlador para subscribirse a todas las tareas, automáticamente la nueva tarea es publicada en el stream de datos entre el servidor y el cliente. Obtenemos un push de las nuevas entidades directamente al cliente.

[![Al enviar la petición desde el postman al servidor aparecen los datos en el navegador](/images/2017/03/1-1.gif)](/images/2017/03/1-1.gif)

_El postman envia una petición para crear la nueva tarea al servidor y este la procesa y la guarda. Una vez guardad la tarea entre el repositorio de MongoDB de Spring Data y Spring WebFlux hacen la magia por nosotros y después de mapear el objeto este se envia al navegador.

## Lecturas y escrituras reactivas (Spring Data)

[Spring nos da otra capa de abstracción sobre los datos para poder comunicarnos de manera asíncrona y reactiva](https://spring.io/blog/2016/11/28/going-reactive-with-spring-data) con la base de datos, en mi caso he elegido [Spring Data MongoDB](http://projects.spring.io/spring-data-mongodb/).

### Lecturas

Para leer un registro tenemos los típicos métodos de Spring Data, con una diferencia, **devuelven tipos reactivos que son _lazy_** y tienes que suscribirte para que la operación se ejecute. Para encontrar el equipo por nombre, lo que hago es un "findAll" y luego aplico un filtro para quedarme solo con los que son del mismo nombre y el Flux resultante lo convierto en un Mono al que desde fuera me suscribo para crear la tarea cuando reciba la respuesta.

```java Encontrar un equipo por nombre
public Mono<Team> finByName (String name) {
    Flux<Team> team = repository.findAll().filter(t -> t.getName().equals(name)).map(et -> new Team(et.getId(), et.getName()));
    return Mono.from(team);
}
```
<sup>Nota: Podría usar findOneByName(String name) que también devolvería un Mono pero quería hacer un ejemplo concatenando operaciones.</sup>

Para leer todas las tareas y mantener un stream continuo desde el servidor al cliente hay que hacer algo más, no mucho, esto es Spring hacer algo normalmente es añadir una anotación y por supuesto en este caso no decepciona. Para crear un método de lectura que con cada nueva escritura publique un nuevo dato en nuestro stream de datos de lectura abierto, tenemos que crear un método find que use un [tailable cursor](https://docs.mongodb.com/manual/core/tailable-cursors/) sobre una [capped collection](https://docs.mongodb.com/manual/core/capped-collections/), es decir, añadir la anotación _"@InfiniteStream"_ en un método en la interfaz.

```java Método de lectura que mantiene un cursor para publicar nuevos elementos
@InfiniteStream
public Flux<Task> findWithTailableCursorBy();

```

Esto nos permite que el servicio de lectura solo tenga que ejecutar la query y hacer un mapeo sobre el flux resultante:

```java Leer todo los elementos de una colección y mapear la entidad al objeto de modelo
public Flux<Task> findAll() {
    return taskRepository.findWithTailableCursorBy().map(this::map);
}

private Task map(es.juandavidvega.entity.Task entity) {
    Team team = new Team(entity.getTeam().getId(), entity.getTeam().getName());
    return new Task(entity.getId(), team, entity.getDueDate(), entity.getTitle());
}
```

### Escrituras

La escritura más compleja es crear una nueva tarea, como comenté antes tiene que ser una capped collection entonces al escribir una nueva tarea si la colección no existe tenemos que tener consideración de crearla con esas características.

```java Crear una tarea cuando no existe la colección
public Mono<Task> save(Task task) {
    es.juandavidvega.entity.Task entityTask = toEntity(task);
    operations.collectionExists(es.juandavidvega.entity.Task.class)
        .flatMap(exist -> exist ? Mono.just(true) : operations.createCollection(es.juandavidvega.entity.Task.class, new CollectionOptions(1024 * 1024, 1000, true)))
        .then()
        .block();
    return taskRepository.save(entityTask).map(this::toModel);
}
```

Al crear una nueva tarea si no existe la colección lo que hacemos es crearla de manera bloqueante y con las características que necesitamos para luego invocar  al save sobre la nueva tarea.

El resto de escrituras son más sencillas. Por ejemplo, para crear un equipo nos basta con llamar al método save del repositorio de Spring Data y subscribirnos al Mono que devuelve. **Aunque no vayamos a hacer nada con el resultado es obligatorio suscribirse para que se ejecute la operación.**


 ```java Escritura más sencilla
 repository.save(newTeam).subscribe();
 ```

## Conclusión

Mi impresión general ahora mismo es positiva, como siempre todo lo relacionado con los framework hay que conocerlo y usarlo con cautela para que no te atrape su magia negra. Lo que más me ha gustado ha sido el poder usar de forma tan cómoda los Server-sent Events y lo que eso implica con los tipos reactivos para poder tener un stream de datos desde el servidor al cliente.

Siendo Spring el framework web de java más usado, espero que podamos usar estas features para crear un impacto positivo importante en la experiencia de usuario de las aplicaciones sin apenas invertir en tecnología y desarrollo.


[Repositorio con la aplicación completa](https://github.com/jdvr/reactive-task-manager)

