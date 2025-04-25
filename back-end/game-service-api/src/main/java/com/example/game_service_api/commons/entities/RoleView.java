package com.example.game_service_api.commons.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roles") // Usando el mismo nombre que en authservice
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleView {
    
    @Id
    private Long id; // No es generado aquí, sino sincronizado con authservice
    
    @Column(unique = true, nullable = false, length = 50)
    private String name;
    
    public RoleView(String name) {
        this.name = name;
    }
} 