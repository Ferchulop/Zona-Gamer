package com.example.game_service_api.controller;

import com.example.game_service_api.commons.dto.GameParticipationDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

public interface GameParticipationApi {
    @PostMapping("/join/{gameId}")
    ResponseEntity<GameParticipationDTO> joinGame(@PathVariable Long gameId, @RequestHeader("X-User-ID") Long userId);
    
    @PostMapping("/leave/{gameId}")
    ResponseEntity<GameParticipationDTO> leaveGame(@PathVariable Long gameId, @RequestHeader("X-User-ID") Long userId);
    
    @GetMapping("/game/{gameId}")
    ResponseEntity<List<GameParticipationDTO>> getGameParticipants(@PathVariable Long gameId);
    
    @GetMapping("/status/{gameId}/{userId}")
    ResponseEntity<Boolean> isUserParticipating(@PathVariable Long gameId, @PathVariable Long userId);
}