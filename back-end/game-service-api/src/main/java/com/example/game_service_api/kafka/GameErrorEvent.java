package com.example.game_service_api.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameErrorEvent {
    private Long gameId;
    private String gameName;
    private Long reportedByUserId;
    private String reportedByUserName;
    private String errorDescription;
    private LocalDateTime timestamp;
} 