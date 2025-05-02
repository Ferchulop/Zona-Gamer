package com.example.game_service_api.kafka;

import com.example.game_service_api.commons.entities.Game;
import com.example.game_service_api.commons.entities.UserView;
import com.example.game_service_api.repositories.GameRepository;
import com.example.game_service_api.repositories.UserViewRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Este componente escucha eventos de error de juegos
 */
@Component
public class GameErrorListener {
    private static final Logger log = LoggerFactory.getLogger(GameErrorListener.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private final GameRepository gameRepository;
    private final UserViewRepository userViewRepository;
    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    public GameErrorListener(
            GameRepository gameRepository,
            UserViewRepository userViewRepository,
            ObjectMapper objectMapper,
            SimpMessagingTemplate messagingTemplate) {
        this.gameRepository = gameRepository;
        this.userViewRepository = userViewRepository;
        this.objectMapper = objectMapper;
        this.messagingTemplate = messagingTemplate;
    }
    
    @KafkaListener(topics = "event.game-error-reported", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeGameErrorEvent(String message) {
        try {
            GameErrorEvent event = objectMapper.readValue(message, GameErrorEvent.class);
            log.info("Recibido reporte de error de juego: Game ID={}, Reportado por={}", 
                    event.getGameId(), event.getReportedByUserName());
            
            processGameErrorEvent(event);
        } catch (Exception e) {
            log.error("Error al procesar evento de error de juego: {}", e.getMessage(), e);
        }
    }
    
    private void processGameErrorEvent(GameErrorEvent event) {
        log.info("Procesando reporte de error para juego ID={}: {}", 
                event.getGameId(), event.getErrorDescription());
        
        try {
            // Obtener información actualizada del juego
            Optional<Game> gameOpt = gameRepository.findById(event.getGameId());
            if (gameOpt.isEmpty()) {
                log.error("No se encontró el juego ID={} para el reporte de error", event.getGameId());
                return;
            }
            
            Game game = gameOpt.get();
            
            // 1. Crear notificación para administradores con instrucciones claras
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "GAME_ERROR");
            notification.put("gameId", event.getGameId());
            notification.put("gameName", event.getGameName());
            notification.put("gameStatus", game.getStatus().toString());
            notification.put("reporter", event.getReportedByUserName());
            notification.put("reporterId", event.getReportedByUserId());
            notification.put("description", event.getErrorDescription());
            notification.put("timestamp", event.getTimestamp().format(formatter));
            
            // Crear un mensaje claro con las acciones que debe tomar el administrador
            String actionMessage = String.format(
                    "¡ACCIÓN REQUERIDA! El usuario: %s ha reportado un problema con el juego: '%s'.\n" +
                    "Estado actual: %s\n" +
                    "Detalles: %s\n" +
                    "Por favor, cambie el estado del juego a PAUSADO y revise el problema.",
                    event.getReportedByUserName(),
                    event.getGameName(),
                    game.getStatus(),
                    event.getErrorDescription().isEmpty() ? "No se proporcionaron detalles" : event.getErrorDescription());
            
            notification.put("message", actionMessage);
            
            // Enviar notificación a través de WebSocket
            messagingTemplate.convertAndSend("/topic/admin/notifications", notification);
            
            // También enviar un mensaje a un tema específico para este juego
            messagingTemplate.convertAndSend("/topic/games/" + event.getGameId() + "/errors", notification);
            
            log.info("Notificación de error enviada a los administradores para el juego: {}", event.getGameName());
        } catch (Exception e) {
            log.error("Error al enviar notificación de error de juego: {}", e.getMessage(), e);
        }
    }
} 