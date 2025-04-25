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
@Table(name = "games")
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String name;

// Añado nuevos campos para la visualización de los datos al crear un juego
@Enumerated(EnumType.STRING)
private GameStatus status;
private Integer players;
private String gameType;
private Boolean isPublic;
private Boolean allowSpectators;
private Boolean enableChat;
private Boolean recordStats;

@Temporal(TemporalType.TIMESTAMP)
private java.util.Date createdAt;

@Temporal(TemporalType.TIMESTAMP)
private java.util.Date lastUpdated;

private Long timeElapsed;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id")
private UserView creator;

@Transient // Este campo no se persiste en la base de datos
private Integer activeParticipants;

@Transient // Este campo no se persiste en la base de datos
private Double averageTimePlayed;

public Integer getUserId() {
    return creator != null ? creator.getId().intValue() : null;
}

public void setUserId(Integer userId) {
    // Si creator es null, lo inicializamos
    if (userId != null) {
        if (this.creator == null) {
            UserView user = new UserView();
            user.setId(userId.longValue());
            this.creator = user;
        } else {
            this.creator.setId(userId.longValue());
        }
    } else {
        this.creator = null;
    }
}

public UserView getCreator() {
    return creator;
}

public void setCreator(UserView creator) {
    this.creator = creator;
}
}

