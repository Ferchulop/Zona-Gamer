package com.example.game_service_api.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador para manejar mensajes WebSocket
 */
@Controller
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:8083"})
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public WebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Endpoint para probar que los WebSockets funcionan
     */
    @MessageMapping("/test")
    @SendTo("/topic/admin/notifications")
    public Map<String, Object> testMessage(Map<String, Object> message) {
        System.out.println("Recibido mensaje de prueba WebSocket: " + message);
        Map<String, Object> response = new HashMap<>();
        response.put("type", "TEST");
        response.put("message", "Prueba de WebSocket: " + message.get("text"));
        return response;
    }
    
    /**
     * Endpoint REST para probar el envío de mensajes a través de WebSocket
     */
    @PostMapping("/api/admin/test-notification")
    @ResponseBody
    @CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:8083"})
    public Map<String, String> sendTestNotification(@RequestBody Map<String, Object> payload) {
        System.out.println("Recibida solicitud de notificación de prueba: " + payload);
        
        // Si el payload no tiene un tipo, establecer a TEST_ADMIN
        if (!payload.containsKey("type")) {
            payload.put("type", "TEST_ADMIN");
        }
        
        // Asegurarse de que hay un mensaje
        if (!payload.containsKey("message")) {
            payload.put("message", "Notificación de prueba sin mensaje");
        }
        
        // Añadir timestamp si no existe
        if (!payload.containsKey("timestamp")) {
            payload.put("timestamp", System.currentTimeMillis());
        }
        
        // Enviar el mensaje a través de WebSocket
        try {
            messagingTemplate.convertAndSend("/topic/admin/notifications", payload);
            System.out.println("Notificación enviada correctamente a /topic/admin/notifications");
            return Map.of(
                "status", "sent", 
                "message", "Notificación de prueba enviada",
                "destination", "/topic/admin/notifications"
            );
        } catch (Exception e) {
            System.err.println("Error enviando notificación: " + e.getMessage());
            e.printStackTrace();
            return Map.of(
                "status", "error", 
                "message", "Error enviando notificación: " + e.getMessage()
            );
        }
    }
} 