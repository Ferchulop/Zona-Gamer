package com.example.game_service_api.controllers;

import com.example.game_service_api.commons.entities.Game;
import com.example.game_service_api.commons.entities.UserView;
import com.example.game_service_api.kafka.GameErrorEvent;
import com.example.game_service_api.kafka.GameEventProducer;
import com.example.game_service_api.repositories.GameRepository;
import com.example.game_service_api.repositories.UserViewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/games")
/**
 * Controlador para reportar errores en los juegos.
 * Permite a los usuarios reportar errores en los juegos y enviarlos a Kafka.
 */
public class GameErrorController {

    private final GameRepository gameRepository;
    private final UserViewRepository userViewRepository;
    private final GameEventProducer gameEventProducer;

    @Autowired
    public GameErrorController(
            GameRepository gameRepository,
            UserViewRepository userViewRepository,
            GameEventProducer gameEventProducer) {
        this.gameRepository = gameRepository;
        this.userViewRepository = userViewRepository;
        this.gameEventProducer = gameEventProducer;
    }

    @PostMapping("/{gameId}/report-error")
    public ResponseEntity<?> reportGameError(
            @PathVariable Long gameId,
            @RequestBody Map<String, String> errorDetails,
            @RequestHeader("X-User-ID") Long userId) {

        // Buscar el juego
        Optional<Game> gameOpt = gameRepository.findById(gameId);
        if (gameOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Game game = gameOpt.get();
        
        // Obtener el usuario que reporta
        Optional<UserView> userOpt = userViewRepository.findById(userId);
        
        // Extraer información del usuario
        Long reporterUserId = userId;
        String reporterUserName = errorDetails.getOrDefault("userName", "Usuario desconocido");
        
        // Si el usuario existe en la base de datos, usar ese nombre en lugar del enviado
        if (userOpt.isPresent()) {
            UserView user = userOpt.get();
            reporterUserId = user.getId();
            // Solo usar el nombre de la base de datos si el nombre del usuario no está en el request
            if (!errorDetails.containsKey("userName") || errorDetails.get("userName").trim().isEmpty()) {
                reporterUserName = user.getName();
            }
        }
        
        // Crear evento de error
        GameErrorEvent errorEvent = new GameErrorEvent(
                game.getId(),
                game.getName(),
                reporterUserId,
                reporterUserName,
                errorDetails.getOrDefault("description", "Sin descripción"),
                LocalDateTime.now()
        );
        
        // Enviar evento a Kafka
        gameEventProducer.sendGameErrorReportEvent(errorEvent);
        
        return ResponseEntity.ok().body(Map.of(
                "message", "Error reportado correctamente",
                "gameId", game.getId(),
                "timestamp", errorEvent.getTimestamp()
        ));
    }
} 