---
title: Incluyendo base de datos embebida
id: 244
categories:
  - Java
  - Server Side
  - spring
  - Tutorials
date: 2016-04-10 12:00:13
tags:
---

En lo que podemos considerar la segunda parte o la segunda iteración sobre [Chapp](/2015/12/06/springboot-y-stomp-aplicaciones-web-interactivas-con-websocket/ "Aplicaciones web interactivas usando WebSocket"), vamos a hablar de como incluir una base de datos embebida en memoria para nuestra aplicación.
<!-- more -->
En mi caso he elegido este sistema para esta aplicación por que hacia tiempo que tenia ganas de probarlo y como comenté en el anterior post la idea de esta app es ir construyendo un proyecto real con diferentes tecnologías, así que no había mejor escenario y oportunidad que esta para probar la base de datos embebida.

Aunque existen diferentes configuraciones que la base de datos sea embebida y en memoria significa que la base de datos arranca junto con su contenedor (la aplicación) y desaparece cuando este lo hace.

### Soporte de Spring Boot para base de datos embebidas.

Ahora mismo Spring Boot puede “autoconfigurar” tres tipos de bases de datos embebidas [H2](http://www.h2database.com/html/main.html), [HSQL](http://hsqldb.org/) y [Derby](http://db.apache.org/derby/). En mi caso he elegido HSQL por que fue donde encontré la documentación más cómoda y por que estoy acostumbrado a Hibernate (argumento de peso :-P).

### Configuración del proyecto

Teniendo ya un proyecto Spring boot como era nuestro caso, nuestro pom se veía de la siguiente manera:

<pre class="lang:xhtml decode:true " title="pom antes de la bbdd">....
    &lt;dependencies&gt;
        &lt;dependency&gt;
            &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
            &lt;artifactId&gt;spring-boot-starter-websocket&lt;/artifactId&gt;
        &lt;/dependency&gt;

        &lt;dependency&gt;
            &lt;groupId&gt;org.springframework&lt;/groupId&gt;
            &lt;artifactId&gt;spring-messaging&lt;/artifactId&gt;
        &lt;/dependency&gt;
    &lt;/dependencies&gt;

....</pre>
&nbsp;

Lo único que tenemos que hacer es añadir dos dependencias, primero Spring Boot Data, que nos añade de manera transitiva Spring JDBC. Y luego HSQLDB que es la dependencia para el motor de base de datos que hemos elegido.

<pre class="lang:xhtml decode:true " title="pom con las nuevas dependencias">....
    &lt;dependencies&gt;
        &lt;dependency&gt;
            &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
            &lt;artifactId&gt;spring-boot-starter-websocket&lt;/artifactId&gt;
        &lt;/dependency&gt;

        &lt;dependency&gt;
            &lt;groupId&gt;org.springframework&lt;/groupId&gt;
            &lt;artifactId&gt;spring-messaging&lt;/artifactId&gt;
        &lt;/dependency&gt;

        &lt;dependency&gt;
            &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
            &lt;artifactId&gt;spring-boot-starter-data-jpa&lt;/artifactId&gt;
        &lt;/dependency&gt;

        &lt;dependency&gt;
            &lt;groupId&gt;org.hsqldb&lt;/groupId&gt;
            &lt;artifactId&gt;hsqldb&lt;/artifactId&gt;
            &lt;scope&gt;runtime&lt;/scope&gt;
        &lt;/dependency&gt;
    &lt;/dependencies&gt;
...</pre>
&nbsp;

### Esquema y Datos

Antes de empezar el desarrollo en java para utilizar nuestra base de datos, vamos a crear un fichero llamado schema.sql que incluirá la creación de tablas y lo necesario para conformar nuestro esquema.

Por defecto Spring va a buscar ese fichero en la raíz de classpath por Internet hay varios ejemplos de como cambiar esa ruta por defecto y también las posibles rutas, yo me he quedado con la opción de crearlo en “/resources/schema.sql”

<pre class="lang:mysql decode:true" title="/resources/schema.sql">create table message (
  id identity,
  content varchar (50) not null,
  sender varchar (50) not null,
  sendDate date not null
);</pre>

 El fichero no tiene complejidad ninguna, simplemente creamos una tabla llamada “message” que va a almacenar los mensajes que los usuario envíen, bastante simple pero por ahora tampoco necesitamos más.

Tenemos la opción de junto al fichero schema.sql, crear un fichero data.sql en el que incluir los datos que deben cargarse al arrancar la BBDD. Yo no he hecho uso de él.

### Acceso desde el código

El acceso a la base de datos es como el uso de cualquier otra base de datos con un ORM, primero vamos a definir la interfaz de nuestro repositorio

<pre class="lang:java decode:true " title="ChatMessageRepository.java">package es.juandavidvega.repository;

import es.juandavidvega.output.ChatMessage;
import es.juandavidvega.output.ChatMessages;

public interface ChatMessageRepository {
    void save(ChatMessage message);
    ChatMessages loadChannelMessages();

}
</pre>

Lo siguiente es crear la implementación concreta para el jdbc template de spring jpa, seguramente nos podríamos ahorrar la interfaz, pero yo en estos casos siempre suelo hacerlo así por que la implementación concreta puede cambiar bastante sobre todo mientras estoy probando opciones, conectores, ejemplos, etc.

<pre class="lang:java decode:true" title="JDBCChatMessageRepository.java">@Repository("chatMessageRepository")
public class JDBCChatMessageRepository implements ChatMessageRepository {

    static final String CreateQuery = "insert into message (content, sender, sendDate) values (?, ?, ?)";
    static final String FindAllQuery = "select content, sender, sendDate from message";
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public JDBCChatMessageRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void save(ChatMessage message) {
        try{
         jdbcTemplate.update(
            CreateQuery,
            message.getContent(),
            message.getSender(),
            message.getSendDate());
        }catch (Exception e){
            e.printStackTrace();
        }

    }

    @Override
    public ChatMessages loadChannelMessages() {
        try{
            return jdbcTemplate.queryForObject(
                    FindAllQuery,
                    this::createMessagesFromResult
            );
        }catch (EmptyResultDataAccessException emptyData){
            return new ChatMessages();
        }
    }

    private ChatMessages createMessagesFromResult(ResultSet resultSet, int rowNumber) {
        ChatMessages messages = new ChatMessages();
        try {
            while (resultSet.next()){
                messages.add(new ChatMessage(
                        resultSet.getString("content"),
                        resultSet.getString("sender"),
                        resultSet.getDate("sendDate")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return  messages;
    }
}
</pre>
&nbsp;

Lo marcamos como “@Repository” y usamos “@Autowired” para incluir el jddcTemplate de spring. Implementamos los dos métodos de la interfaz de la formas más simple posible y ya tenemos nuestro acceso a base de datos completo.

Para usarlo, sólo es necesario inyectarlo y llamar a los método que queramos, por ejemplo:

<pre class="lang:java decode:true" title="ChatMessageProcessor">@Service
public class ChatMessageProcessor {

    private final ChatMessageRepository chatMessageRepository;

    @Autowired
    public ChatMessageProcessor(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    public ChatMessage process(UserMessage rawMessage){
        ChatMessage message = new ChatMessage(rawMessage.getContent(), rawMessage.getSender(), rawMessage.getSendDate());
        chatMessageRepository.save(message);
        return message;
    }
}</pre>

### Conclusión

Sabiendo lo que se hace y el objetivo, crear una base de datos de este tipo lleva entre 5 – 10 minutos, es un tiempo ínfimo comparado con la versatilidad que puede aportar a nuestro tutoriales, ejemplos o _spike. _En esta aplicación concreta el almacenamiento de mensajes se va a usar para introducir la nueva funcionalidad de canales que veremos en la siguiente parte.

### Más información

*   [Documentación oficial S](http://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-sql.html)[pring](http://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-sql.html)
*   [Código completo (repositorio que se actualiza, puede no coincidir 100%)](https://github.com/jdvr/chapp)

**NOTA:** Recuerdo que el objetivo de esta segunda parte es exclusivamente el añadir la bbdd embebida, en la siguiente parte daremos uso y sentido a esta de forma útil para el usuario.