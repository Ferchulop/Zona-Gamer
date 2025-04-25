package com.example.authservice.commons.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.*;

// Esta clase representa la solicitud que un usuario envía cuando intenta autenticarse o registrarse.
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserRequest {
    @NotNull
    private String email;
    @NotNull
    private String password;
    
    private String name;
    private String role;
}
