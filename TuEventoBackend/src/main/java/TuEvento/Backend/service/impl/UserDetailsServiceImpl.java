package TuEvento.Backend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


import TuEvento.Backend.repository.LoginRepository;
import TuEvento.Backend.service.UserDetailsService;

/**
 * Implementación de UserDetailsService para autenticar usando la entidad Login.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final LoginRepository loginRepository;

    @Autowired
    public UserDetailsServiceImpl(LoginRepository loginRepository) {
        this.loginRepository = loginRepository;
    }

    /**
     * Carga el usuario por su email (o alias, depende de tu lógica).
     * @param username email o alias
     * @return UserDetails (Login)
     * @throws UsernameNotFoundException si no existe
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Puedes buscar por email o alias según tu modelo
        return loginRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }
}