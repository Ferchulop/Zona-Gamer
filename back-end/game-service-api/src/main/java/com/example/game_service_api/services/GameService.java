package com.example.game_service_api.services;

import com.example.game_service_api.commons.entities.Game;
import com.example.game_service_api.commons.dto.GameCreateRequest;
import java.util.List;

public interface GameService {


    Game saveGame(Game gameRequest);

    Game createGameFromRequest(GameCreateRequest request, Integer userId);

    Game getGameById(Long id);

    Game updateGame(Long id,Game gameRequest);

    void deleteById(Long id);

    List<Game> findAll();

    List<Game> getAllGames();
}
