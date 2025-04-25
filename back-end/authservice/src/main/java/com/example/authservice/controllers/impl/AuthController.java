package com.example.authservice.controllers.impl;

import com.example.authservice.commons.dtos.TokenResponse;
import com.example.authservice.commons.dtos.UserRequest;
import com.example.authservice.controllers.AuthApi;
import com.example.authservice.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
//  Esta clase se encarga de manejar las solicitudes relacionadas con la autenticación de usuarios en la aplicación, actúa como controlador REST.
public class AuthController implements AuthApi {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Método para crear un nuevo usuario
    @Override
    public ResponseEntity<TokenResponse> createUser(UserRequest userRequest) {
        return ResponseEntity.ok(authService.createUser(userRequest));
    }

    // Método para obtener un usuario por su Id
    @Override
    public ResponseEntity<String> getUser(String userId) {
        return ResponseEntity.ok(userId);
    }

    // Método para iniciar sesión de un usuario
    @Override
    public ResponseEntity<TokenResponse> login(UserRequest userRequest) {
        return ResponseEntity.ok(authService.loginUser(userRequest));
    }
}
