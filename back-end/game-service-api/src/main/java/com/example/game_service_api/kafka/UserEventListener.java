package com.example.game_service_api.kafka;

import com.example.game_service_api.commons.entities.UserView;
import com.example.game_service_api.repositories.RoleViewRepository;
import com.example.game_service_api.repositories.UserViewRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Este componente se encargará de escuchar los eventos Kafka de usuarios.
 * SOLO CONSUME - no produce eventos de usuario
 */
@Component
public class UserEventListener {
    private static final Logger log = LoggerFactory.getLogger(UserEventListener.class);

    private final UserViewRepository userViewRepository;
    private final RoleViewRepository roleViewRepository;
    private final ObjectMapper objectMapper;
    
    @Autowired
    public UserEventListener(
            UserViewRepository userViewRepository,
            RoleViewRepository roleViewRepository,
            ObjectMapper objectMapper) {
        this.userViewRepository = userViewRepository;
        this.roleViewRepository = roleViewRepository;
        this.objectMapper = objectMapper;
    }
    
    @KafkaListener(topics = "${spring.kafka.topics.user-events}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeUserEvent(String message) {
        try {
            UserEvent event = objectMapper.readValue(message, UserEvent.class);
            log.info("Recibido evento de usuario: {}", event.getEventType());
            processUserEvent(event);
        } catch (Exception e) {
            log.error("Error al procesar evento de usuario: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Este método será anotado con @KafkaListener cuando se implemente Kafka
     */
    public void processUserEvent(UserEvent event) {
        switch (event.getEventType()) {
            case "USER_CREATED":
            case "USER_UPDATED":
                updateUserView(event);
                break;
            case "USER_DELETED":
                userViewRepository.findById(event.getUserId())
                    .ifPresent(userViewRepository::delete);
                break;
        }
    }
    
    private void updateUserView(UserEvent event) {
        UserView userView = userViewRepository.findById(event.getUserId())
            .orElse(new UserView());
        
        userView.setId(event.getUserId());
        userView.setEmail(event.getEmail());
        userView.setName(event.getName());
        
        userViewRepository.save(userView);
    }
} 