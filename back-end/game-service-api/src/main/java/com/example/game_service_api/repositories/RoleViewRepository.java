package com.example.game_service_api.repositories;

import com.example.game_service_api.commons.entities.RoleView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleViewRepository extends JpaRepository<RoleView, Long> {
    Optional<RoleView> findByName(String name);
} 