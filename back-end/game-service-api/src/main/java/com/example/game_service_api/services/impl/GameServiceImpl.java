package com.example.game_service_api.services.impl;

import com.example.game_service_api.commons.dto.GameDTO;
import com.example.game_service_api.commons.entities.Game;
import com.example.game_service_api.repositories.GameRepository;
import com.example.game_service_api.services.GameParticipationService;
import com.example.game_service_api.services.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.game_service_api.commons.entities.GameStatus;
import com.example.game_service_api.kafka.GameEventProducer;
import com.example.game_service_api.commons.dto.GameCreateRequest;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GameServiceImpl implements GameService {

    private final GameRepository gameRepository;
    private final GameEventProducer gameEventProducer;
    
    @Autowired
    private GameParticipationService participationService;

    public GameServiceImpl(GameRepository gameRepository, GameEventProducer gameEventProducer) {
        this.gameRepository = gameRepository;
        this.gameEventProducer = gameEventProducer;
    }

    @Override
    public Game saveGame(Game gameRequest) {
        Game savedGame = this.gameRepository.save(gameRequest);
        gameEventProducer.sendGameCreatedEvent(savedGame);
        return savedGame;
    }
    @Override 
    public Game createGameFromRequest(GameCreateRequest request, Integer userId) {
        Game game = new Game();
        game.setName(request.getName());
        game.setPlayers(request.getPlayers());
        game.setGameType(request.getGameType());
        game.setUserId(userId);
        game.setStatus(GameStatus.ACTIVO);
        game.setIsPublic(request.getIsPublic());
        game.setAllowSpectators(request.getAllowSpectators());
        game.setEnableChat(request.getEnableChat());
        game.setRecordStats(request.getRecordStats());

        Date now = new Date();
        game.setCreatedAt(now);
        game.setLastUpdated(now);
        game.setTimeElapsed(0L);
        
        Game savedGame = gameRepository.save(game);
        // Activar el evento de Kafka para notificar la creación del juego
        gameEventProducer.sendGameCreatedEvent(savedGame);
        return savedGame;
    }

    @Override
    public Game getGameById(Long id) {
        return this.gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error Game Not Found"));
    }


    @Override
    public Game updateGame(Long id, Game gameRequest) {
       Game existingGame = this.gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error Game Not Found"));
       
       // Solo actualizar el nombre si se proporciona
       if (gameRequest.getName() != null) {
           existingGame.setName(gameRequest.getName());
       }
       
       // Solo actualizar el estado si se proporciona
       if (gameRequest.getStatus() != null) {
           existingGame.setStatus(gameRequest.getStatus());
       }
       
       // Siempre actualizar la marca de tiempo
       existingGame.setLastUpdated(new Date());

       Game updatedGame = gameRepository.save(existingGame);
       
       // Activar el evento de Kafka para notificar el cambio de estado
       gameEventProducer.sendGameStatusChangedEvent(updatedGame);
       
       return updatedGame;
    }

    @Override
    public void deleteById(Long id) {
        Game game = getGameById(id);
        game.setStatus(GameStatus.CANCELADO);
        game.setLastUpdated(new Date());
        Game canceledGame = gameRepository.save(game);
        gameEventProducer.sendGameStatusChangedEvent(canceledGame);

    }

    @Override
    public List<Game> findAll() {
        return gameRepository.findAll();
    }
    
    @Override
    public List<Game> getAllGames() {
        System.out.println("=== GET ALL GAMES START ===");
        List<Game> games = gameRepository.findAll();
        System.out.println("Found " + games.size() + " games");
        
        // Actualizar las métricas de participación para cada juego
        for (Game game : games) {
            try {
                System.out.println("Processing game " + game.getId());
                
                // Contar participantes activos
                int activeParticipants = participationService.getActiveParticipantsCount(game.getId());
                System.out.println("Game " + game.getId() + " has " + activeParticipants + " active participants");
                
                // Calcular tiempo promedio
                Double avgTimePlayed = participationService.getAverageTimePlayedForGame(game.getId());
                System.out.println("Game " + game.getId() + " average time played: " + avgTimePlayed);
                
                // Actualizar el juego con las métricas
                game.setActiveParticipants(activeParticipants);
                game.setAverageTimePlayed(avgTimePlayed != null ? avgTimePlayed : 0.0);
                
            } catch (Exception e) {
                System.err.println("Error processing metrics for game " + game.getId() + ": " + e.getMessage());
                e.printStackTrace();
                game.setActiveParticipants(0);
                game.setAverageTimePlayed(0.0);
            }
        }
        
        System.out.println("=== GET ALL GAMES END ===");
        return games;
    }

}
