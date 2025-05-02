package com.example.game_service_api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

/**
 * Clase de configuración de WebSocket que habilita STOMP para mensajería en tiempo real.
 * Configura un broker simple en "/topic" y un prefijo de ruta de aplicación en "/app".
 * Registra el endpoint "/ws" con soporte SockJS permitiendo todos las rutas para pruebas,
 * y establece límites de tamaño y tiempo para el envío de mensajes.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Permitir todas las rutas para pruebas
                .withSockJS();
    }
    
    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(128 * 1024)
                    .setSendBufferSizeLimit(512 * 1024)
                    .setSendTimeLimit(20000);
    }
} 