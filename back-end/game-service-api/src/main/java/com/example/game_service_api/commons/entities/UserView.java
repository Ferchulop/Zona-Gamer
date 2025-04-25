package com.example.game_service_api.commons.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users") // Usando el mismo nombre que en authservice
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserView {
    
    @Id
    private Long id; // No es generado aquí, sino sincronizado con authservice
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String name;
    
    // No incluimos el password ni otros datos sensibles
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    // Mantener la relación con roles para ser consistente
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles", 
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<RoleView> roles = new HashSet<>();
} 