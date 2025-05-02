package com.example.game_service_api.kafka;

import com.example.game_service_api.commons.entities.Game;
import com.example.game_service_api.commons.dto.GameDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class GameEventProducer {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public GameEventProducer(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void sendGameCreatedEvent(Game game) {
        try {
            GameDTO gameDTO = GameDTO.fromGame(game);
            String gameJson = objectMapper.writeValueAsString(gameDTO);
            kafkaTemplate.send("event.game-created", game.getId().toString(), gameJson);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al serializar el juego a JSON", e);
        }
    }

    public void sendGameStatusChangedEvent(Game game) {
        try {
            GameDTO gameDTO = GameDTO.fromGame(game);
            String gameJson = objectMapper.writeValueAsString(gameDTO);
            kafkaTemplate.send("event.game-status-changed", game.getId().toString(), gameJson);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al serializar el juego a JSON", e);
        }
    }
    
    public void sendGameErrorReportEvent(GameErrorEvent errorEvent) {
        try {
            String errorJson = objectMapper.writeValueAsString(errorEvent);
            kafkaTemplate.send("event.game-error-reported", errorEvent.getGameId().toString(), errorJson);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al serializar el evento de error a JSON", e);
        }
    }
}