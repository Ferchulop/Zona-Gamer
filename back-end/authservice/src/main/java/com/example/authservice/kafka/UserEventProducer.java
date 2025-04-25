package com.example.authservice.kafka;

import com.example.authservice.commons.entities.UserModel;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserEventProducer {
    private static final Logger log = LoggerFactory.getLogger(UserEventProducer.class);
    
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    
    @Autowired
    public UserEventProducer(
            KafkaTemplate<String, String> kafkaTemplate,
            ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }
    
    public void sendUserCreatedEvent(UserModel user) {
        sendUserEvent(user, "USER_CREATED");
    }
    
    public void sendUserUpdatedEvent(UserModel user) {
        sendUserEvent(user, "USER_UPDATED");
    }
    
    public void sendUserDeletedEvent(UserModel user) {
        sendUserEvent(user, "USER_DELETED");
    }
    
    private void sendUserEvent(UserModel user, String eventType) {
        try {
            // Crear objeto de evento (debe ser compatible con UserEvent en game-service-api)
            UserEvent event = new UserEvent();
            event.setEventType(eventType);
            event.setUserId(user.getId());
            event.setEmail(user.getEmail());
            event.setName(user.getUsername());
            event.setTimestamp(LocalDateTime.now());
            
            String eventJson = objectMapper.writeValueAsString(event);
            kafkaTemplate.send("user-events", user.getId().toString(), eventJson);
            
            log.info("Evento {} enviado para usuario ID: {}", eventType, user.getId());
        } catch (JsonProcessingException e) {
            log.error("Error al serializar evento de usuario: {}", e.getMessage(), e);
            throw new RuntimeException("Error al enviar evento de usuario", e);
        }
    }
    
    // Clase interna para manejar el evento - debe tener la misma estructura que en game-service-api
    private static class UserEvent {
        private String eventType;
        private Long userId;
        private String email;
        private String name;
        private LocalDateTime timestamp;
        
        // Getters y setters
        public String getEventType() { return eventType; }
        public void setEventType(String eventType) { this.eventType = eventType; }
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }
} 