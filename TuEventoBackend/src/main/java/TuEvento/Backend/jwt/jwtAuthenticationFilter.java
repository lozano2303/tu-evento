package TuEvento.Backend.jwt;

import java.io.IOException;
import java.util.Optional;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import TuEvento.Backend.model.Login;

import TuEvento.Backend.repository.LoginRepository;
import TuEvento.Backend.service.jwt.jwtService;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Filtro JWT adaptado para el modelo TuEvento.
 * - Expone userID del token como atributo en la request.
 * - Actualiza el token en cada petición válida (desliza expiración de 15 min).
 * - Busca en repositorio Login, mantiene fallback a UserDetailsService.
 * - Roles y authorities desde User (enum Role).
 */
@Component
@RequiredArgsConstructor
public class jwtAuthenticationFilter extends OncePerRequestFilter {

    private final jwtService jwtService;
    private final LoginRepository loginRepository;
    private final UserDetailsService userDetailsService;


    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Skip JWT processing for public endpoints
        String requestURI = request.getRequestURI();
        if (requestURI.startsWith("/api/v1/event/") ||
            requestURI.startsWith("/api/v1/public/") ||
            requestURI.startsWith("/api/v1/login/") ||
            requestURI.startsWith("/api/v1/account-activation/") ||
            requestURI.startsWith("/api/v1/register") ||
            requestURI.startsWith("/api/v1/users/") ||
            requestURI.startsWith("/oauth2/authorization/") ||
            requestURI.startsWith("/login/oauth2/code/") ||
            requestURI.startsWith("/api/v1/departments/") ||
            requestURI.startsWith("/api/v1/cities/") ||
            requestURI.startsWith("/api/v1/addresses/") ||
            requestURI.startsWith("/api/v1/locations/") ||
            requestURI.startsWith("/api/v1/eventLayout/") ||
            requestURI.startsWith("/api/v1/eventRating/") ||
            requestURI.startsWith("/api/v1/organizer-petitions/") ||
            requestURI.startsWith("/api/v1/sections/") ||
            requestURI.startsWith("/api/v1/tickets/") ||
            requestURI.startsWith("/api/v1/notifications/") ||
            requestURI.startsWith("/api/v1/seats/") ||
            requestURI.startsWith("/api/v1/categories/") ||
            requestURI.startsWith("/api/v1/category-events/") ||
            requestURI.startsWith("/api/v1/event-img/") ||
            requestURI.startsWith("/swagger-ui.html") ||
            requestURI.startsWith("/swagger-ui/") ||
            requestURI.startsWith("/v3/api-docs") ||
            requestURI.startsWith("/swagger-resources/") ||
            requestURI.startsWith("/webjars/")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        String jwt = null;
        String username = null;
        Integer userId = null;

        // Extracción segura del token y usuario
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                username = jwtService.getUsernameFromToken(jwt);
                userId = jwtService.getUserIDFromToken(jwt); // extrae el userId del token
            } catch (ExpiredJwtException e) {
                logger.warn("JWT expired: " + e.getMessage());
            } catch (JwtException e) {
                logger.warn("JWT invalid: " + e.getMessage());
            }
        }

        // Exponer el userId del token como atributo en la request (si existe)
        if (userId != null) {
            request.setAttribute("userID", userId);
        }

        // Solo procesar si hay username y no hay autenticación previa
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Busca primero en el repositorio Login por username (alias/email)
            Optional<Login> optionalLogin = loginRepository.findByEmail(username);
            if (optionalLogin.isPresent()) {
                Login login = optionalLogin.get();
                UserDetails userDetails = login;
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // Refresca el token para extender la expiración
                    String refreshedToken = jwtService.refreshToken(jwt, userDetails);
                    response.setHeader("Authorization", "Bearer " + refreshedToken);

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities() // roles se mantienen igual
                    );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    filterChain.doFilter(request, response);
                    return;
                }
            } else {
                // Si no está en el repositorio, intenta con UserDetailsService estándar
                try {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    if (jwtService.isTokenValid(jwt, userDetails)) {
                        String refreshedToken = jwtService.refreshToken(jwt, userDetails);
                        response.setHeader("Authorization", "Bearer " + refreshedToken);

                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities()
                                );
                        authToken.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request)
                        );
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                } catch (UsernameNotFoundException ex) {
                    logger.warn("User not found in UserDetailsService: " + ex.getMessage());
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}