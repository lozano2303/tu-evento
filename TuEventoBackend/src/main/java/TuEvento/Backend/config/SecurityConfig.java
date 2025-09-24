package TuEvento.Backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import TuEvento.Backend.config.OAuth2LoginSuccessHandler;

import TuEvento.Backend.service.oauth.customOauht2UserService;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final AuthenticationProvider authProvider;
    private final TuEvento.Backend.jwt.jwtAuthenticationFilter jwtAuthenticationFilter;
    @Autowired
    @Lazy
    private customOauht2UserService customOAuth2UserService;
    @Autowired
    @Lazy
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/public/**").permitAll()
                .requestMatchers("/api/v1/login/**").permitAll()
                .requestMatchers("/api/v1/account-activation/**").permitAll()
                .requestMatchers("/api/v1/register").permitAll()
                .requestMatchers("/api/v1/users/**").permitAll()
                .requestMatchers("/oauth2/authorization/**").permitAll()
                .requestMatchers("/login/oauth2/code/**").permitAll()
                .requestMatchers("/api/v1/departments/**").permitAll()
                .requestMatchers("/api/v1/cities/**").permitAll()
                .requestMatchers("/api/v1/addresses/**").permitAll()
                .requestMatchers("/api/v1/locations/**").permitAll()
                .requestMatchers("/api/v1/event/**").permitAll()
                .requestMatchers(
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/v3/api-docs",
                        "/v3/api-docs/**",
                        "/v3/api-docs.yaml",
                        "/swagger-resources/**",
                        "/webjars/**"
                    ).permitAll()
                .requestMatchers("/api/v1/eventLayout/**").permitAll()
                .requestMatchers("/api/v1/eventRating/**").permitAll()
                .requestMatchers("/api/v1/organizer-petitions/**").permitAll()
                .requestMatchers("/api/v1/sections/**").permitAll()
                .requestMatchers("/api/v1/tickets/**").permitAll()
                .requestMatchers("/api/v1/notifications/**").permitAll()
                .requestMatchers("/api/v1/seats/**").permitAll()
                .requestMatchers("/api/v1/categories/**").permitAll()
                .requestMatchers("/api/v1/category-events/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .formLogin(form -> form.disable())
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .successHandler(oAuth2LoginSuccessHandler)
                // ⬇️ IMPORTANTE: Deshabilitar OAuth2 para rutas públicas
                .authorizationEndpoint(authorization -> authorization
                    .baseUri("/oauth2/authorization") // Mantener solo para esta ruta
                )
            )
            .authenticationProvider(authProvider)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    } 
}