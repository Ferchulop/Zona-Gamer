package com.example.game_service_api.commons.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GameParticipationDTO {
    private Long id;
    private Long userId;
    private String userEmail;
    private Long gameId;
    private String gameName;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    private Boolean isActive;
    private Integer timePlayedMinutes;
}