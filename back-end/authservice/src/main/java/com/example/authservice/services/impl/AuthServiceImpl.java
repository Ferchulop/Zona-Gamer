package com.example.authservice.services.impl;

import com.example.authservice.commons.dtos.TokenResponse;
import com.example.authservice.commons.dtos.UserRequest;
import com.example.authservice.commons.entities.UserModel;
import com.example.authservice.commons.entities.Role;
import com.example.authservice.repositories.UserRepository;
import com.example.authservice.repositories.RoleRepository;
import com.example.authservice.services.AuthService;
import com.example.authservice.services.JwtService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    // Esta clase implementa la lógica de autenticación y gestión de usuarios
    public AuthServiceImpl(UserRepository userRepository, RoleRepository roleRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
    }
    
    @Override
    public TokenResponse createUser(UserRequest userRequest) {
        return Optional.of(userRequest)
                .map(this::mapToEntity)
                .map(userRepository::save)
                .map(userCreated -> jwtService.generateToken(userCreated))
                .orElseThrow(() -> new RuntimeException("Error creating user"));
    }
    
    @Override
    public TokenResponse loginUser(UserRequest userRequest) {
        return userRepository.findByEmail(userRequest.getEmail())
                .filter(user -> user.getPassword().equals(userRequest.getPassword()))
                .map(user -> {
                    // Actualizar el campo lastLogin
                    user.setLastLogin(LocalDateTime.now());
                    // Guardar el usuario con el lastLogin actualizado
                    userRepository.save(user);
                    // Generar y devolver el token
                    return jwtService.generateToken(user);
                })
                .orElseThrow(() -> new RuntimeException("Error credentials"));
    }
    
    // Método modificado para manejar roles correctamente
    private UserModel mapToEntity(UserRequest userRequest) {
        // Determinar qué rol asignar
        String roleName = userRequest.getRole() != null && !userRequest.getRole().isEmpty() 
                ? userRequest.getRole() 
                : "ROLE_USER";
        
        // Crear el usuario
        UserModel user = UserModel.builder()
                .email(userRequest.getEmail())
                .password(userRequest.getPassword())
                .name(userRequest.getName())
                .role(roleName) // Mantener el campo role por compatibilidad
                .build();
        
        // Buscar el rol por nombre
        Role role = roleRepository.findByName(roleName);
        
        // Si el rol existe, añadirlo a la colección de roles del usuario
        if (role != null) {
            user.getRoles().add(role);
        }
        
        return user;
    }
}
