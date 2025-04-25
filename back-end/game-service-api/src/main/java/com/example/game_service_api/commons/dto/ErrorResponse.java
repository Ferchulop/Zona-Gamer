package com.example.game_service_api.commons.dto;

import lombok.*;
// Esta clase se encarga de estructurar y representar las respuestas de error que la API games puede devolver a los clientes.
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private Integer codeStatus;
    private String message;
}
