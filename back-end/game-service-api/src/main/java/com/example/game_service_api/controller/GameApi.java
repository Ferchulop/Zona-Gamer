package com.example.game_service_api.controller;

import com.example.game_service_api.commons.dto.GameCreateRequest;
import com.example.game_service_api.commons.dto.GameDTO;
import com.example.game_service_api.commons.constans.ApiPathVariables;
import com.example.game_service_api.commons.entities.Game;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Esta interfaz define la ruta base para los endpoints de la API games.
@RequestMapping(ApiPathVariables.V1_ROUTE + ApiPathVariables.GAME_ROUTE)
public interface GameApi {
   
   @GetMapping
   ResponseEntity<List<GameDTO>> getAllGames();

   @PostMapping
   ResponseEntity<GameDTO> saveGame(@RequestBody Game game);
   
   @PostMapping("/create")
   ResponseEntity<GameDTO> createGame(@RequestBody GameCreateRequest request, 
                                   @RequestHeader("userIdRequest") Integer userId);
   
   @GetMapping("/{id}")
   ResponseEntity<GameDTO> getGameById(@PathVariable Long id);
   
   @PutMapping("/{id}")
   ResponseEntity<GameDTO> updateGameById(@PathVariable Long id, @RequestBody Game gameRequest);
   
   @DeleteMapping("/{id}")
   ResponseEntity<Void> deleteGame(@PathVariable Long id);
   
   @GetMapping("/user")
   ResponseEntity<String> getUserName(@RequestHeader("userIdRequest") String user);
}
