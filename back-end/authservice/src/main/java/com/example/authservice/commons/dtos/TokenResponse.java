package com.example.authservice.commons.dtos;

import lombok.*;
// Esta clase representa la respuesta que contiene JWT que se envía al cliente después de una autenticación válida.
// implemento lombok para generar setters, getters y patrón builder

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TokenResponse {
    private String accesstoken;
}
