package com.example.authservice.services.impl;

import com.example.authservice.repositories.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
// Esta clase UserDetailsServiceImpl implementa la interfaz UserDetailsService, y
// se encarga de cargar los detalles de un usuario basado en su nombre de usuario (que en este caso es el email).
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;  // Repositorio para acceder a los datos de usuario.

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Carga los detalles del usuario por su nombre de usuario (en este caso, el email).
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
