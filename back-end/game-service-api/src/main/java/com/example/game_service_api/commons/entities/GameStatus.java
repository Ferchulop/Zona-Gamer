package com.example.game_service_api.commons.entities;

public enum GameStatus {
    ACTIVO("activo"),
    COMPLETADO("completado"),
    CANCELADO("cancelado"),
    PAUSADO("pausado");

private final String status; 

GameStatus(String status) {
    this.status = status;
}

public String getStatus() {
    return status;
}

public static GameStatus fromString(String text) {
    for (GameStatus g: GameStatus.values()) {
        if (g.status.equalsIgnoreCase(text)) {
            return g;
        }
    }
    throw new IllegalArgumentException("No se encontró el estado del juego: " + text);
}
}
