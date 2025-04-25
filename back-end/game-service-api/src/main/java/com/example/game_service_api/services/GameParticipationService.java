package com.example.game_service_api.services;

import com.example.game_service_api.commons.entities.GameParticipation;
import java.util.List;

public interface GameParticipationService {
    GameParticipation joinGame(Long userId, Long gameId);
    GameParticipation leaveGame(Long userId, Long gameId);
    GameParticipation getParticipation(Long userId, Long gameId);
    List<GameParticipation> getGameParticipants(Long gameId);
    int getActiveParticipantsCount(Long gameId);
    Double getAverageTimePlayedForGame(Long gameId);
}
