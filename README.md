# Zona Gamer

El proyecto Zona Gamer es una aplicación web diseñada para la gestión eficiente de juegos, dirigida
tanto a administradores como a usuarios. La aplicación ofrece monitoreo en tiempo real, permitiendo
a los administradores observar la evolución de los juegos y la actividad de los usuarios de manera
dinámica. Con una organización centralizada, la interfaz utiliza tarjetas intuitivas que facilitan el
seguimiento de información más importante. Además, proporciona análisis de datos detallados,
ayudando a mejorar el desarrollo futuro de cada juego mediante tendencias y patrones de uso. La
plataforma también permite la gestión de juegos en línea, asegurando que la experiencia sea de lo
más reconfortante y optimizada para todos los participantes.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

- **Frontend**: Aplicación React con TypeScript
- **Backend**: Microservicios en Java Spring Boot
  - `authservice`: Servicio de autenticación y gestión de usuarios
  - `game-service-api`: API para la gestión de juegos y sesiones

## Tecnologías

### Frontend
- **React 18** con TypeScript
- **Vite** como bundler y servidor de desarrollo
- **TailwindCSS** para estilos
- **React Router** para navegación
- **React Hook Form** para gestión de formularios
- **Axios** para peticiones HTTP
- **Recharts** para visualizaciones y estadísticas
- **JWT** para autenticación

### Backend
- **Java 17**
- **Spring Boot** para el desarrollo de APIs
- **Spring Security** con JWT para autenticación
- **JPA/Hibernate** para persistencia de datos
- **Arquitectura de Microservicios**

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