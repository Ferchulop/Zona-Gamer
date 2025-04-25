package com.example.game_service_api.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserEvent {
    private String eventType; // "USER_CREATED", "USER_UPDATED", "USER_DELETED"
    private Long userId;
    private String email;
    private String name;
    private LocalDateTime timestamp;
} 