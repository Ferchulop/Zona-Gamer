package com.example.authservice.repositories;

import com.example.authservice.commons.entities.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Esta interfaz se encarga de gestionar las operaciones de acceso a datos  para la entidad de UserModel que extiende de JPA.
public interface UserRepository extends JpaRepository<UserModel, Long> {
    Optional<UserModel> findByEmail(String email);
}