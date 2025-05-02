package com.example.game_service_api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
// Habilita la programación de tareas de Spring, limpieza de datos de usuarios, sincronización de datos de usuarios...
public class SchedulingConfig {
    // La anotación @EnableScheduling permite el uso de @Scheduled
} 