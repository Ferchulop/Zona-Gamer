package com.example.game_service_api.commons.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
// DTO para recibir los datos de la petición de creación de un juego
public class GameCreateRequest {
    private String name;
    private Integer players;
    private String gameType;
    private Boolean isPublic;
    private Boolean allowSpectators;
    private Boolean enableChat;
    private Boolean recordStats;

}