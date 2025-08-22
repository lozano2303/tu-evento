package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.LoginDto;

import TuEvento.Backend.dto.requests.RequestLoginDTO;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.dto.responses.ResponseLogin;
import TuEvento.Backend.model.Login;
import TuEvento.Backend.repository.LoginRepository;
import TuEvento.Backend.service.LoginService;
import TuEvento.Backend.service.jwt.jwtServices;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DataAccessException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class LoginServiceImpl implements LoginService {
    @Autowired
    @Lazy
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private jwtServices jwtService;
    @Autowired
    private LoginRepository loginRepository;
    public Optional<Login> findByEmail(String email) {
        return loginRepository.findByEmail(email);
    }
    @Override
    public ResponseDto<String> login(LoginDto loginDto) {
        try {
            Optional<Login> optionalLogin = findByEmail(loginDto.getEmail());
            if (optionalLogin.isEmpty()) {
                return ResponseDto.error("Email no registrado");
            }

            Login login = optionalLogin.get();
            
            // En producción, compara el hash, no el texto plano
            if (!login.getPassword().equals(loginDto.getPassword())) {
                return ResponseDto.error("Contraseña incorrecta");
            }

            // Aquí luego puedes retornar el JWT token
            return ResponseDto.ok("Login exitoso");

        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al iniciar sesión");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al iniciar sesión");
        }
    }
    public ResponseDto<String> save(RequestLoginDTO requestLoginDTO) {
        try {
            // Validar si el email ya existe
            if (loginRepository.findByEmail(requestLoginDTO.getEmail()).isPresent()) {
                return ResponseDto.error("El email ya está registrado");
            }

            Login login = new Login();
            login.setEmail(requestLoginDTO.getEmail());
            login.setUserID(requestLoginDTO.getUserID());
            login.setPassword(requestLoginDTO.getPassword()); 
            login.setUsername(requestLoginDTO.getUsername());
            login.setLoginDate(LocalDateTime.now());
            loginRepository.save(login);
            return ResponseDto.ok("Usuario registrado exitosamente");

        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al guardar el usuario");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al guardar el usuario");
        }
    }
    public ResponseLogin login(RequestLoginDTO loginDTO) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginDTO.getUsername(),
                loginDTO.getPassword()
            )
        );

        Login userEntity = loginRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        String token = jwtService.getToken(userEntity);
        return new ResponseLogin(token);
    }
    public Optional<Login> findByUsername(String username) {
        return loginRepository.findByUsername(username);
    }
}