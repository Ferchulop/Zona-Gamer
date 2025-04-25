package com.example.game_service_api.services;

import com.example.game_service_api.commons.entities.Game;
import com.example.game_service_api.commons.entities.UserView;
import com.example.game_service_api.repositories.GameRepository;
import com.example.game_service_api.repositories.UserViewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DataReconciliationService {
    private static final Logger log = LoggerFactory.getLogger(DataReconciliationService.class);
    
    private final GameRepository gameRepository;
    private final UserViewRepository userViewRepository;
    
    @Autowired
    public DataReconciliationService(
            GameRepository gameRepository,
            UserViewRepository userViewRepository) {
        this.gameRepository = gameRepository;
        this.userViewRepository = userViewRepository;
    }
    
    /**
     * Verifica juegos con referencias a usuarios que no existen
     * y aplica una estrategia de mitigación
     */
    @Scheduled(fixedDelayString = "${reconciliation.schedule.interval:3600000}")
    @Transactional
    public void reconcileOrphanedGames() {
        log.info("Iniciando reconciliación de juegos huérfanos");
        
        List<Game> allGames = gameRepository.findAll();
        int orphanCount = 0;
        
        for (Game game : allGames) {
            // Si el juego tiene un creador pero no existe en UserView
            if (game.getCreator() != null && 
                !userViewRepository.existsById(game.getCreator().getId())) {
                
                // Estrategia: Intentar encontrar userId del campo legado
                if (game.getUserId() != null) {
                    Optional<UserView> userView = userViewRepository.findById(Long.valueOf(game.getUserId()));
                    if (userView.isPresent()) {
                        // Actualizar con un usuario existente
                        game.setCreator(userView.get());
                        gameRepository.save(game);
                        log.info("Juego ID {} actualizado con usuario correcto", game.getId());
                    } else {
                        // Marcar como huérfano pero no eliminar
                        game.setCreator(null);
                        gameRepository.save(game);
                        log.warn("Juego ID {} marcado como huérfano", game.getId());
                    }
                }
                orphanCount++;
            }
        }
        
        log.info("Reconciliación completada. Encontrados {} juegos huérfanos", orphanCount);
    }
    
    /**
     * Ejecuta reconciliación al iniciar la aplicación
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("Ejecutando reconciliación inicial de datos");
        reconcileOrphanedGames();
    }
} 