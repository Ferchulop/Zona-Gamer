# Zona Gamer
El proyecto Zona Gamer es una aplicación web diseñada para permitir monitorear, lo que significa que  se puede ver cómo se comportan esos juegos en tiempo real, desde la página “Panel de Control”, analizar, desde la página “Estadísticas” y administrar desde la página “Lista de Juegos” múltiples videojuegos online simultáneamente. Los administradores pueden observar desde un panel de control detalles específicos por juego, mientras que estos reciben alertas sobre problemas técnicos que requieren atención inmediata. A la vez que podrán visualizar la evolución de cada uno de los géneros y tipos de juegos desde la página “Estadísticas”. Los jugadores podrán unirse, salir del juego, marcar como completado el juego y reportar un problema si lo hay, además de poder seguir su progreso con estadísticas.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

- **Frontend**: Aplicación React con TypeScript
- **Backend**: Microservicios en Java Spring Boot
  - `authservice`: Servicio de autenticación y gestión de usuarios
  - `game-service-api`: API para la gestión de juegos y sesiones
  - `apache-kafka`: Middleware de mensajería para la comunicación entre microservicios
 
    **Para una informacion más detallada puedes visualizar la memoria del proyecto**: https://github.com/Ferchulop/Zona-Gamer/blob/main/TFG%20ZONA%20GAMER.pdf

## Tecnologías

### Frontend
- **React 18**
- **TypeScript**
- **CSS** 

### Backend
- **Java 17**
- **PostgreSQL** 
- **Spring Boot** 
- **Kafka**


## Características

- Sistema de autenticación con roles (usuario/administrador)
- Creación y gestión de juegos
- Panel de estadísticas y visualizaciones
- Unirse/abandonar sesiones de juego
- Cambio de estados de juegos (activo, pausado, completado, cancelado)
- Interfaz responsiva y moderna

## Instalación y Ejecución

### Requisitos previos
- Node.js 16+ y npm o Bun
- Java 17+
- Maven

### Frontend
```bash
cd front-end
npm install
npm run dev
```

### Backend
```bash
cd back-end/authservice
./mvnw spring-boot:run

# En otra terminal
cd back-end/game-service-api
./mvnw spring-boot:run
```

## Credenciales de Prueba
- **Admin**: admin@example.com / password
- **Usuario**: user@example.com / password

## Desarrollo

Para contribuir al proyecto:

1. Clona el repositorio
2. Configura los entornos de desarrollo para frontend y backend
3. Trabaja en ramas separadas por características
4. Envía pull requests para su revisión 
