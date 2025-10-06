package TuEvento.Backend.service.jwt;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;

import TuEvento.Backend.model.Login;
import TuEvento.Backend.model.User;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class jwtService {

    private static final String SECRET_KEY = "pCrbWA1TUFdZY0+sCHHpbJenCguvnNAGspn66f6xSbA="; // Cambia esto por tu clave segura en base64

    // Genera un token JWT que incluye userID, fullName, email y rol (enum)
    public String generateToken(Login login) {
        Map<String, Object> extraClaims = new HashMap<>();
        User user = login.getUserID();
        extraClaims.put("userID", user.getUserID());
        extraClaims.put("fullName", user.getFullName());
        extraClaims.put("role", user.getRole().name()); // Guardamos el nombre del enum como string
        return generateToken(extraClaims, login);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {  
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 15)) // 15 minutos
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String getUsernameFromToken(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Integer getUserIDFromToken(String token) {
        Claims claims = extractAllClaims(token);
        Object userIDObj = claims.get("userID");
        if (userIDObj instanceof Integer) {
            return (Integer) userIDObj;
        }
        try {
            return Integer.valueOf(userIDObj.toString());
        } catch (Exception e) {
            return null;
        }
    }

    public String getFullNameFromToken(String token) {
        Claims claims = extractAllClaims(token);
        Object fullNameObj = claims.get("fullName");
        return fullNameObj != null ? fullNameObj.toString() : null;
    }

    public String getEmailFromToken(String token) {
        Claims claims = extractAllClaims(token);
        Object emailObj = claims.get("email");
        return emailObj != null ? emailObj.toString() : null;
    }

    // Devuelve el nombre del rol como String (ADMIN, USER)
    public String getRoleFromToken(String token) {
        Claims claims = extractAllClaims(token);
        Object roleObj = claims.get("role");
        return roleObj != null ? roleObj.toString() : null;
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Refresca el token con los mismos claims y 15 minutos de expiración
    public String refreshToken(String token, UserDetails userDetails) {
        Claims claims = extractAllClaims(token);
        Map<String, Object> extraClaims = new HashMap<>(claims);
        // Elimina campos estándar para evitar conflictos
        extraClaims.remove("exp");
        extraClaims.remove("iat");
        return generateToken(extraClaims, userDetails);
    }
}