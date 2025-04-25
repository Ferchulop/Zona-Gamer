package com.example.game_service_api.commons.dto;

import com.example.game_service_api.commons.entities.Game;
import com.example.game_service_api.commons.entities.GameStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GameDTO {
    private Long id;
    private String name;
    private GameStatus status;
    private Integer players;
    private Date createdAt;
    private Date lastUpdated;
    private Long timeElapsed;
    private Integer userId;  // Mantenemos el userId para compatibilidad con frontend
    private String gameType;
    private Boolean isPublic;
    private Boolean allowSpectators;
    private Boolean enableChat;
    private Boolean recordStats;
    private Integer activeParticipants; // Número real de participantes activos en el juego
    private Double averageTimePlayed; // Tiempo promedio de juego en minutos
    
    // Constructor para convertir de Game a GameDTO
    public static GameDTO fromGame(Game game) {
        if (game == null) return null;
        
        GameDTO dto = new GameDTO();
        dto.setId(game.getId());
        dto.setName(game.getName());
        dto.setStatus(game.getStatus());
        dto.setPlayers(game.getPlayers());
        dto.setCreatedAt(game.getCreatedAt());
        dto.setLastUpdated(game.getLastUpdated());
        dto.setTimeElapsed(game.getTimeElapsed());
        
        // Mantener compatibilidad con el frontend existente
        if (game.getCreator() != null) {
            dto.setUserId(game.getCreator().getId().intValue());
        } else {
            dto.setUserId(game.getUserId());
        }
        
        dto.setGameType(game.getGameType());
        dto.setIsPublic(game.getIsPublic());
        dto.setAllowSpectators(game.getAllowSpectators());
        dto.setEnableChat(game.getEnableChat());
        dto.setRecordStats(game.getRecordStats());
        
        // Usar los valores calculados del objeto Game
        dto.setActiveParticipants(game.getActiveParticipants());
        dto.setAverageTimePlayed(game.getAverageTimePlayed());
        
        return dto;
    }
    
    // Método para convertir una lista de Games a lista de GameDTOs
    public static List<GameDTO> fromGames(List<Game> games) {
        return games.stream()
            .map(GameDTO::fromGame)
            .collect(Collectors.toList());
    }
} 