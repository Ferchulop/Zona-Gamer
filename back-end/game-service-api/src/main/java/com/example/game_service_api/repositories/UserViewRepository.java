package com.example.game_service_api.repositories;

import com.example.game_service_api.commons.entities.UserView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserViewRepository extends JpaRepository<UserView, Long> {
    Optional<UserView> findByEmail(String email);
} 