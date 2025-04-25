package com.example.game_service_api.controller.impl;

import com.example.game_service_api.commons.dto.GameDTO;
import com.example.game_service_api.commons.entities.Game;
import com.example.game_service_api.controller.GameApi;
import com.example.game_service_api.services.GameService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.game_service_api.commons.dto.GameCreateRequest;

import java.util.List;

@RestController
// Servicio para gestionar la lógica de negocio de los juegos, clase REST.
public class GameController implements GameApi {
    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }
    
    @Override
    public ResponseEntity<List<GameDTO>> getAllGames() {
        try {
            System.out.println("Fetching all games with metrics...");
            List<Game> games = gameService.getAllGames();
            List<GameDTO> gameDTOs = GameDTO.fromGames(games);
            System.out.println("Successfully fetched " + games.size() + " games with metrics");
            return ResponseEntity.ok(gameDTOs);
        } catch (Exception e) {
            System.err.println("Error fetching games: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Override
    public ResponseEntity<GameDTO> createGame(@RequestBody GameCreateRequest request, 
                                          @RequestHeader("userIdRequest") Integer userId) {
        try {
            Game createdGame = this.gameService.createGameFromRequest(request, userId);
            return ResponseEntity.ok(GameDTO.fromGame(createdGame));
        } catch (Exception e) {
            System.err.println("Error creating game: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoint para guardar un nuevo juego
    @Override
    public ResponseEntity<GameDTO> saveGame(@RequestBody Game game) {
        try {
            Game gameCreated = this.gameService.saveGame(game);
            return ResponseEntity.ok(GameDTO.fromGame(gameCreated));
        } catch (Exception e) {
            System.err.println("Error saving game: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Endpoint para obtener un juego por su ID
    @Override
    public ResponseEntity<GameDTO> getGameById(Long id) {
        try {
            Game game = this.gameService.getGameById(id);
            return ResponseEntity.ok(GameDTO.fromGame(game));
        } catch (Exception e) {
            System.err.println("Error getting game by id: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoint para actualizar un juego existente por su Id
    @Override
    public ResponseEntity<GameDTO> updateGameById(@PathVariable Long id, @RequestBody Game gameRequest) {
        try {
            Game updatedGame = this.gameService.updateGame(id, gameRequest);
            return ResponseEntity.ok(GameDTO.fromGame(updatedGame));
        } catch (Exception e) {
            System.err.println("Error updating game: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Endpoint para eliminar un juego por su Id
    @Override
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        try {
            gameService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting game: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Endpoint para obtener el nombre de usuario desde el encabezado de la solicitud
    @Override
    public ResponseEntity<String> getUserName(@RequestHeader("userIdRequest") String user) {
        System.out.println(user);
        return ResponseEntity.ok(user);
    }
}



