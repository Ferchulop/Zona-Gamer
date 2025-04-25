package com.example.authservice.commons.entities;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity // Indica que esta clase es una entidad JPA.
@Table(name = "users") // Especifica que esta entidad está mapeada a la tabla "users".
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
//Esta clase implementa UserDetails para integrarse con el sistema de seguridad de Spring.
public class UserModel implements UserDetails {
    @Id // Indica que este campo es la clave primaria de la entidad.
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String password;
    private String name;
    
    // Mantenemos este campo para compatibilidad con código existente
    private String role;
    
    // Nuevos campos
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles", 
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        
        // Añadir el rol original (compatibilidad)
        if (role != null && !role.isEmpty()) {
            authorities.add(new SimpleGrantedAuthority(role));
        }
        
        // Añadir roles de la relación
        if (roles != null && !roles.isEmpty()) {
            roles.forEach(r -> authorities.add(new SimpleGrantedAuthority(r.getName())));
        }
        
        return authorities;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    // Indica que la cuenta no está bloqueada.
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    // Indica que las credenciales no han expirado.
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // Indica que la cuenta está habilitada.
    @Override
    public boolean isEnabled() {
        return true;
    }
}
