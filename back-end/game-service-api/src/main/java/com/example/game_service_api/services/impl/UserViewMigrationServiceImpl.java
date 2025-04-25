package com.example.game_service_api.services.impl;

import com.example.game_service_api.commons.entities.Game;
import com.example.game_service_api.commons.entities.RoleView;
import com.example.game_service_api.commons.entities.UserView;
import com.example.game_service_api.repositories.GameRepository;
import com.example.game_service_api.repositories.RoleViewRepository;
import com.example.game_service_api.repositories.UserViewRepository;
import com.example.game_service_api.services.UserViewMigrationService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserViewMigrationServiceImpl implements UserViewMigrationService {

    private final GameRepository gameRepository;
    private final UserViewRepository userViewRepository;
    private final RoleViewRepository roleViewRepository;
    
    @Autowired
    public UserViewMigrationServiceImpl(
            GameRepository gameRepository,
            UserViewRepository userViewRepository,
            RoleViewRepository roleViewRepository) {
        this.gameRepository = gameRepository;
        this.userViewRepository = userViewRepository;
        this.roleViewRepository = roleViewRepository;
    }
    
    @PostConstruct
    @Transactional
    @Override
    public void migrateExistingGames() {
        // Obtener todos los juegos
        List<Game> games = gameRepository.findAll();
        
        // Para cada juego, crear/asignar un UserView si falta
        for (Game game : games) {
            Integer userId = game.getUserId();
            
            if (userId != null && game.getCreator() == null) {
                // Buscar o crear un UserView para este userId
                UserView userView = userViewRepository.findById(userId.longValue())
                        .orElseGet(() -> createDefaultUserView(userId.longValue()));
                
                // Asignar el UserView al juego
                game.setCreator(userView);
                gameRepository.save(game);
            }
        }
    }
    
    private UserView createDefaultUserView(Long userId) {
        UserView userView = new UserView();
        userView.setId(userId);
        userView.setEmail("user" + userId + "@example.com");
        userView.setName("User " + userId);
        userView.setCreatedAt(LocalDateTime.now());
        
        // Asignar el rol USER por defecto
        Set<RoleView> roles = new HashSet<>();
        roleViewRepository.findByName("ROLE_USER").ifPresent(roles::add);
        userView.setRoles(roles);
        
        return userViewRepository.save(userView);
    }
} 