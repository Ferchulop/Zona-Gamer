package com.example.authservice.services.impl;

import com.example.authservice.commons.dtos.TokenResponse;
import com.example.authservice.commons.entities.UserModel;
import com.example.authservice.services.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtServiceImpl implements JwtService {
    private final String secretKey;

    // Constructor que recibe la clave secreta desde la configuración de la aplicación.
    public JwtServiceImpl(@Value("${jwt.secret}") String secretKey) {
        this.secretKey = secretKey;
    }

    // Se genera un token JWT para el usuario dado.
    @Override
    public TokenResponse generateToken(Long userId) {
        Date expirationDate = new Date(Long.MAX_VALUE);
        String token = Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(expirationDate)
                .signWith(Keys.hmacShaKeyFor(secretKey.getBytes()), Jwts.SIG.HS512)
                .compact();
        return TokenResponse.builder()
                .accesstoken(token)
                .build();
    }
    
    @Override
    public TokenResponse generateToken(UserModel user) {
        Date expirationDate = new Date(Long.MAX_VALUE);
        
        Map<String, Object> claims = new HashMap<>();
        if (user.getName() != null) {
            claims.put("name", user.getName());
        }
        
        // Añadir el rol al token
        claims.put("role", user.getRole());
        
        String token = Jwts.builder()
                .claims(claims)
                .subject(String.valueOf(user.getId()))
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(expirationDate)
                .signWith(Keys.hmacShaKeyFor(secretKey.getBytes()), Jwts.SIG.HS512)
                .compact();
        
        return TokenResponse.builder()
                .accesstoken(token)
                .build();
    }

    @Override
    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(secretKey.getBytes()))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Verifica si el token ha expirado.
    @Override
    public boolean isExpired(String token) {
        try {
            return getClaims(token).getExpiration().before(new Date()); // Comprueba si la fecha de expiración es anterior a la fecha actual.
        } catch (Exception e) {
            return false;
        }
    }

    // Extrae el ID del usuario del token
    @Override
    public Integer extractUserId(String token) {
        try {
            return Integer.parseInt(getClaims(token).getSubject());
        } catch (Exception e) {
            return null;
        }
    }
}
