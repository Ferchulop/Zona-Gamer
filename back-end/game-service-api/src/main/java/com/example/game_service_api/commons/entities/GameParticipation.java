package com.example.game_service_api.commons.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Entity
@Table(name = "game_participations")
public class GameParticipation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserView user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id") 
    private Game game;
    
    @Column(name = "joined_at")
    private LocalDateTime joinedAt;
    
    @Column(name = "left_at")
    private LocalDateTime leftAt;
    
    @Column(name = "is_active")
    private Boolean isActive;
    
    @Column(name = "time_played_minutes")
    private Integer timePlayedMinutes;
}