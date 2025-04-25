package com.example.authservice.controllers;

import com.example.authservice.commons.constants.ApiPathConstants;
import com.example.authservice.commons.dtos.TokenResponse;
import com.example.authservice.commons.dtos.UserRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Esta interfaz define la ruta base para las operaciones de autenticación
@RequestMapping(ApiPathConstants.V1_ROUTE + ApiPathConstants.AUTH_ROUTE)
public interface AuthApi {
    // Endpoint para registrar un nuevo usuario
    @PostMapping(value = "/register")
    ResponseEntity<TokenResponse> createUser(@RequestBody @Valid UserRequest userRequest);

    // Endpoint para iniciar sesión de un usuario existente
    @PostMapping(value = "/login")
    ResponseEntity<TokenResponse> login(@RequestBody @Valid UserRequest userRequest);

    // Endpoint para obtener información sobre un usuario por su ID
    @GetMapping
    ResponseEntity<String> getUser(@RequestAttribute(name = "X-User-Id") String userId);
}
