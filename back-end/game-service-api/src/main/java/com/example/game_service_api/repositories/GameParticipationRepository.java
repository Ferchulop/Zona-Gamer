package com.example.game_service_api.repositories;

import com.example.game_service_api.commons.entities.GameParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameParticipationRepository extends JpaRepository<GameParticipation, Long> {
    
    List<GameParticipation> findByGameIdAndIsActiveTrue(Long gameId);
    
    Optional<GameParticipation> findByUserIdAndGameIdAndIsActiveTrue(
            @Param("userId") Long userId, 
            @Param("gameId") Long gameId);
    
    @Query("SELECT COUNT(gp) FROM GameParticipation gp WHERE gp.game.id = :gameId AND gp.isActive = true")
    int countByGameIdAndIsActiveTrue(@Param("gameId") Long gameId);
    
    @Query("SELECT AVG(gp.timePlayedMinutes) FROM GameParticipation gp WHERE gp.game.id = :gameId")
    Double calculateAverageTimePlayedForGame(@Param("gameId") Long gameId);
}