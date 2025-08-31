package TuEvento.Backend.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

/**
 * Interfaz personalizada de UserDetailsService para TuEvento.
 * Puedes extender org.springframework.security.core.userdetails.UserDetailsService si lo prefieres.
 */
public interface UserDetailsService {
    UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;
}