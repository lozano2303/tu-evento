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
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                return http
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(
                                                autRequest -> autRequest
                                                                .requestMatchers("/api/v1/public/**").permitAll()
                                                                .requestMatchers("/oauth2/authorization/**").permitAll()
                                                                .requestMatchers("/login/oauth2/code/**").permitAll()
                                                                .requestMatchers("/api/v1/**").permitAll()           
                                                                .anyRequest().authenticated())
                                // .formLogin(withDefaults())
                                // .build();
                                .sessionManagement(sessionManagement -> sessionManagement
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                                .oauth2Login(oauth2 -> oauth2
                                                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                                        )
                                                                
                               

                                .authenticationProvider(authProvider)
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                                .build();
        }
}