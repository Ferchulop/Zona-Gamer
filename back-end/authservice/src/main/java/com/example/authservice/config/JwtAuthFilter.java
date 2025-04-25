package com.example.authservice.config;

import com.example.authservice.repositories.UserRepository;
import com.example.authservice.services.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component // Añado @component para la detección automática en Spring
//Esta clase extiende OncePerRequestFilter para procesar la solicitud una vez.
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    // Obtiene el encabezado de autorización, lo valida y extrae el ID de usuario.
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // Lista de rutas públicas que deben omitirse para la autenticación
        final List<String> publicPaths = Arrays.asList(
            "/v1/auth/register", 
            "/v1/auth/login",
            "/v3/api-docs",
            "/swagger-ui"
        );
        
        String requestPath = request.getServletPath();
        
        // Omitir la autenticación para rutas públicas
        boolean isPublicPath = publicPaths.stream()
                .anyMatch(path -> requestPath.startsWith(path));
        
        if (isPublicPath) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Procesar autenticación JWT para rutas protegidas
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String jwt = authHeader.substring(7);
        Integer userId = jwtService.extractUserId(jwt);
        
        if (userId != null && !jwtService.isExpired(jwt)) {
            userRepository.findById(Long.valueOf(userId))
                .ifPresent(userDetails -> {
                    request.setAttribute("X-User-Id", userDetails.getId());
                    
                    // Crear token de autenticación
                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(
                            userDetails, 
                            null, 
                            userDetails.getAuthorities()
                        );
                    
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // IMPORTANTE: Establecer el token en el contexto de seguridad
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                });
        }
        
        filterChain.doFilter(request, response);
    }
}