package com.example.authservice.services.impl;

import com.example.authservice.commons.entities.Role;
import com.example.authservice.commons.entities.UserModel;
import com.example.authservice.repositories.RoleRepository;
import com.example.authservice.repositories.UserRepository;
import com.example.authservice.services.RoleMigrationService;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RoleMigrationServiceImpl implements RoleMigrationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Autowired
    public RoleMigrationServiceImpl(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    
    @PostConstruct
    @Transactional
    @Override
    public void migrateRoles() {
        // Primero asegurarse de que existan los roles básicos
        ensureRolesExist();
        
        // Luego migrar usuarios con 'role' a la relación roles
        List<UserModel> users = userRepository.findAll();
        for (UserModel user : users) {
            if (user.getRole() != null && !user.getRole().isEmpty() && (user.getRoles() == null || user.getRoles().isEmpty())) {
                // Buscar el rol
                Role role = roleRepository.findByName(user.getRole());
                
                // Si no existe, crearlo usando SQL directo
                if (role == null) {
                    try {
                        // Crear secuencia si no existe (idempotente)
                        Query createSeqQuery = entityManager.createNativeQuery(
                            "CREATE SEQUENCE IF NOT EXISTS roles_id_seq");
                        createSeqQuery.executeUpdate();
                        
                        // Insertar con ID explícito
                        Query getNextIdQuery = entityManager.createNativeQuery(
                            "SELECT nextval('roles_id_seq')");
                        Long nextId = ((Number) getNextIdQuery.getSingleResult()).longValue();
                        
                        Query insertQuery = entityManager.createNativeQuery(
                            "INSERT INTO roles (id, name) VALUES (?, ?)");
                        insertQuery.setParameter(1, nextId);
                        insertQuery.setParameter(2, user.getRole());
                        insertQuery.executeUpdate();
                        
                        // Recuperar el rol creado
                        role = roleRepository.findByName(user.getRole());
                    } catch (Exception e) {
                        System.err.println("Error al crear rol para usuario: " + e.getMessage());
                        e.printStackTrace();
                        continue; // Saltar este usuario y continuar con los demás
                    }
                }
                
                if (role != null) {
                    // Asignar el rol al usuario
                    Set<Role> roles = new HashSet<>();
                    roles.add(role);
                    user.setRoles(roles);
                    
                    userRepository.save(user);
                }
            }
        }
    }
    
    @Override
    @Transactional
    public void ensureRolesExist() {
        List<String> roleNames = List.of("ROLE_ADMIN", "ROLE_USER");
        for (String name : roleNames) {
            Role role = roleRepository.findByName(name);
            if (role == null) {
                try {
                    // Crear secuencia si no existe (idempotente)
                    Query createSeqQuery = entityManager.createNativeQuery(
                        "CREATE SEQUENCE IF NOT EXISTS roles_id_seq");
                    createSeqQuery.executeUpdate();
                    
                    // Usar nextval para la secuencia
                    Query query = entityManager.createNativeQuery(
                        "INSERT INTO roles (id, name) VALUES (nextval('roles_id_seq'), ?)");
                    query.setParameter(1, name);
                    query.executeUpdate();
                } catch (Exception e) {
                    System.err.println("Error al crear rol mediante SQL nativo: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        }
    }
} 