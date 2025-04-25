package com.example.game_service_api.services.impl;

import com.example.game_service_api.commons.entities.RoleView;
import com.example.game_service_api.repositories.RoleViewRepository;
import com.example.game_service_api.services.RoleViewInitializerService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoleViewInitializerServiceImpl implements RoleViewInitializerService {

    private final RoleViewRepository roleViewRepository;
    
    @Autowired
    public RoleViewInitializerServiceImpl(RoleViewRepository roleViewRepository) {
        this.roleViewRepository = roleViewRepository;
    }
    
    @PostConstruct
    @Transactional
    @Override
    public void ensureRolesExist() {
        List<String> roleNames = List.of("ROLE_ADMIN", "ROLE_USER");
        
        for (String name : roleNames) {
            if (roleViewRepository.findByName(name).isEmpty()) {
                RoleView role = new RoleView();
                role.setName(name);
                // Asignamos ID 1 para ROLE_ADMIN y 2 para ROLE_USER para que coincidan con authservice
                role.setId(name.equals("ROLE_ADMIN") ? 1L : 2L);
                roleViewRepository.save(role);
            }
        }
    }
} 