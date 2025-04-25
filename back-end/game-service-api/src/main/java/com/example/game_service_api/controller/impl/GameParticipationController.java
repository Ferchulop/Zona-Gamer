package com.example.game_service_api.controller.impl;

import com.example.game_service_api.commons.dto.GameParticipationDTO;
import com.example.game_service_api.commons.entities.GameParticipation;
import com.example.game_service_api.controller.GameParticipationApi;
import com.example.game_service_api.services.GameParticipationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/game-participations")
public class GameParticipationController implements GameParticipationApi {

    @Autowired
    private GameParticipationService participationService;

    @Override
    public ResponseEntity<GameParticipationDTO> joinGame(Long gameId, Long userId) {
        GameParticipation participation = participationService.joinGame(userId, gameId);
        return ResponseEntity.ok(mapToDTO(participation));
    }

    @Override
    public ResponseEntity<GameParticipationDTO> leaveGame(Long gameId, Long userId) {
        GameParticipation participation = participationService.leaveGame(userId, gameId);
        return ResponseEntity.ok(mapToDTO(participation));
    }

    @Override
    public ResponseEntity<List<GameParticipationDTO>> getGameParticipants(Long gameId) {
        List<GameParticipation> participants = participationService.getGameParticipants(gameId);
        List<GameParticipationDTO> dtos = participants.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @Override
    public ResponseEntity<Boolean> isUserParticipating(Long gameId, Long userId) {
        GameParticipation participation = participationService.getParticipation(userId, gameId);
        return ResponseEntity.ok(participation != null);
    }

    private GameParticipationDTO mapToDTO(GameParticipation participation) {
        GameParticipationDTO dto = new GameParticipationDTO();
        dto.setId(participation.getId());
        dto.setUserId(participation.getUser().getId());
        dto.setUserEmail(participation.getUser().getEmail());
        dto.setGameId(participation.getGame().getId());
        dto.setGameName(participation.getGame().getName());
        dto.setJoinedAt(participation.getJoinedAt());
        dto.setLeftAt(participation.getLeftAt());
        dto.setIsActive(participation.getIsActive());
        dto.setTimePlayedMinutes(participation.getTimePlayedMinutes());
        return dto;
    }
}