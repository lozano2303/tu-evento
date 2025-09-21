package TuEvento.Backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {
     @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Permitir solicitudes desde todos los orígenes (descomenta para todos los orígenes)
        // config.addAllowedOrigin("*");
        config.addAllowedOrigin("http://192.168.0.17:8081");
        config.addAllowedOrigin("http://localhost:5173");
        // Puedes agregar más orígenes permitidos con más líneas como la anterior

        // Permitir solicitudes con estos métodos HTTP
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");

        // Permitir el envío de ciertos encabezados en las solicitudes
        config.addAllowedHeader("Authorization");
        config.addAllowedHeader("Content-Type");
        // config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
