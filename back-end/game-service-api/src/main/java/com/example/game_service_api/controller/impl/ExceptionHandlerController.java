package com.example.game_service_api.controller.impl;

import com.example.game_service_api.commons.exceptions.GameException;
import com.example.game_service_api.commons.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice // Combino  ControllerAdvice con ResponseBody para controlar excepciones en toda la app.
@Slf4j // Anotación de lombok para crear automáticamente mensajes en una app,(logger).
// Esta clase maneja excepciones específicas.
public class ExceptionHandlerController {
    @ExceptionHandler(value = {GameException.class})
    ResponseEntity<ErrorResponse> handleError(GameException gameException) {
        log.error("new Exception", gameException);
        var errorResponse = ErrorResponse.builder()
                .codeStatus(gameException.getHttpStatus().value())
                .message(gameException.getMessage())
                .build();

        return ResponseEntity.status(gameException.getHttpStatus()).body(errorResponse);
    }
}

