package com.example.game_service_api.services.impl;

import com.example.game_service_api.commons.entities.Game;
import com.example.game_service_api.commons.entities.GameParticipation;
import com.example.game_service_api.commons.entities.UserView;
import com.example.game_service_api.repositories.GameParticipationRepository;
import com.example.game_service_api.repositories.GameRepository;
import com.example.game_service_api.repositories.UserViewRepository;
import com.example.game_service_api.services.GameParticipationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GameParticipationServiceImpl implements GameParticipationService {

    @Autowired
    private GameParticipationRepository participationRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private UserViewRepository userViewRepository;

    @Override
    public GameParticipation joinGame(Long userId, Long gameId) {
        System.out.println("=== JOIN GAME START ===");
        System.out.println("Attempting to join game: userId=" + userId + ", gameId=" + gameId);
        
        // Verificar si ya existe una participación activa
        Optional<GameParticipation> existingParticipation = 
            participationRepository.findByUserIdAndGameIdAndIsActiveTrue(userId, gameId);
        
        if (existingParticipation.isPresent()) {
            System.out.println("User " + userId + " is already participating in game " + gameId);
            System.out.println("Existing participation details: " + existingParticipation.get());
            return existingParticipation.get(); // Ya está participando
        }
        
        // Crear nueva participación
        Game game = gameRepository.findById(gameId)
            .orElseThrow(() -> new RuntimeException("Juego no encontrado"));
            
        UserView user = userViewRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
        GameParticipation participation = new GameParticipation();
        participation.setUser(user);
        participation.setGame(game);
        participation.setJoinedAt(LocalDateTime.now());
        participation.setIsActive(true);
        participation.setTimePlayedMinutes(0);
        
        GameParticipation saved = participationRepository.save(participation);
        System.out.println("Created new participation: " + saved);
        System.out.println("Is Active: " + saved.getIsActive());
        System.out.println("=== JOIN GAME END ===");
        return saved;
    }

    @Override
    public GameParticipation leaveGame(Long userId, Long gameId) {
        GameParticipation participation = participationRepository
            .findByUserIdAndGameIdAndIsActiveTrue(userId, gameId)
            .orElseThrow(() -> new RuntimeException("No hay participación activa para este usuario y juego"));
            
        LocalDateTime leftAt = LocalDateTime.now();
        participation.setLeftAt(leftAt);
        participation.setIsActive(false);
        
        // Calcular tiempo jugado en minutos
        Duration duration = Duration.between(participation.getJoinedAt(), leftAt);
        int minutesPlayed = (int) duration.toMinutes();
        participation.setTimePlayedMinutes(minutesPlayed);
        
        return participationRepository.save(participation);
    }

    @Override
    public GameParticipation getParticipation(Long userId, Long gameId) {
        return participationRepository
            .findByUserIdAndGameIdAndIsActiveTrue(userId, gameId)
            .orElse(null);
    }

    @Override
    public List<GameParticipation> getGameParticipants(Long gameId) {
        return participationRepository.findByGameIdAndIsActiveTrue(gameId);
    }

    @Override
    public int getActiveParticipantsCount(Long gameId) {
        try {
            System.out.println("=== GET ACTIVE PARTICIPANTS START ===");
            System.out.println("Checking active participants for game: " + gameId);
            int count = participationRepository.countByGameIdAndIsActiveTrue(gameId);
            System.out.println("Found " + count + " active participants for game " + gameId);
            System.out.println("=== GET ACTIVE PARTICIPANTS END ===");
            return count;
        } catch (Exception e) {
            System.err.println("Error counting active participants for game " + gameId);
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public Double getAverageTimePlayedForGame(Long gameId) {
        try {
            Double avg = participationRepository.calculateAverageTimePlayedForGame(gameId);
            System.out.println("Calculating average time played for game " + gameId + ": " + avg);
            return avg != null ? avg : 0.0;
        } catch (Exception e) {
            System.err.println("Error calculating average time for game " + gameId + ": " + e.getMessage());
            return 0.0;
        }
    }
}