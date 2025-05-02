package com.example.authservice.commons.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
// Representa una entidad de rol en el sistem de autenticación, utiliza anotacion JPA para mapear la clase a una tabla
// de la base de datos llamada "roles", incluye un identificador unico y un nombre de rol.
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String name;
    
    public Role(String name) {
        this.name = name;
    }
} 