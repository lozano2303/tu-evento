package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.LoginDto;
import TuEvento.Backend.dto.RecoverPasswordDto;
import TuEvento.Backend.dto.requests.ChangePasswordDto;
import TuEvento.Backend.dto.requests.RequestLoginDTO;
import TuEvento.Backend.dto.requests.ResetPasswordDTO;
import TuEvento.Backend.dto.responses.ResponseDto;

import TuEvento.Backend.model.Login;
import TuEvento.Backend.model.RecoverPassword;
import TuEvento.Backend.repository.LoginRepository;
import TuEvento.Backend.repository.RecoverPasswordRepository;
import TuEvento.Backend.service.LoginService;
import TuEvento.Backend.service.RecoverPasswordService;
import TuEvento.Backend.service.email.ActivationCodeEmailService;
import TuEvento.Backend.service.jwt.jwtService;
import TuEvento.Backend.dto.requests.TokenInfo;
import TuEvento.Backend.dto.responses.ResponseLogin;


import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DataAccessException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginServiceImpl implements LoginService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    @Lazy
    private AuthenticationManager authenticationManager;

    private final Map<String, TokenInfo> resetTokens = new ConcurrentHashMap<>();

    @Autowired
    private ActivationCodeEmailService emailService;

    @Autowired
    private jwtService jwtService;

    @Autowired
    private LoginRepository loginRepository;
    @Autowired
    private RecoverPasswordService recoverPasswordService; 
    @Autowired
    private RecoverPasswordRepository recoverPasswordRepository;

    public Optional<Login> findByEmail(String email) {
        return loginRepository.findByEmail(email);
    }

    @Override
    public ResponseDto<ResponseLogin> login(LoginDto loginDto) {
        try {
            Optional<Login> optionalLogin = findByEmail(loginDto.getEmail());
            if (optionalLogin.isEmpty()) {
                return ResponseDto.error("Email no registrado");
            }

            Login login = optionalLogin.get();

            if (!login.getUserID().isActivated()) {
                return ResponseDto.error("Cuenta no activada. Revisa tu correo para activar la cuenta.");
            }

            if (!passwordEncoder.matches(loginDto.getPassword(), login.getPassword())) {
                return ResponseDto.error("Contraseña incorrecta");
            }

            // Autenticación con AuthenticationManager
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    login.getUsername(),
                    loginDto.getPassword()
                )
            );

            String token = jwtService.generateToken(login);

            // Construir la respuesta con solo los datos necesarios: token, userID, role
            ResponseLogin responseLogin = new ResponseLogin(
                token,
                login.getUserID().getUserID(),
                login.getUserID().getRole().name()
            );
            return ResponseDto.ok("Login exitoso", responseLogin);

        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al iniciar sesión");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al iniciar sesión: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<String> save(RequestLoginDTO requestLoginDTO) {
        try {
            // Validar si el email ya existe
            if (loginRepository.findByEmail(requestLoginDTO.getEmail()).isPresent()) {
                return ResponseDto.error("Correo electrónico existente");
            }

            Login login = new Login();
            login.setEmail(requestLoginDTO.getEmail());
            login.setUserID(requestLoginDTO.getUserID());
            login.setPassword(passwordEncoder.encode(requestLoginDTO.getPassword()));
            login.setUsername(requestLoginDTO.getUsername());
            login.setLoginDate(LocalDateTime.now());
            loginRepository.save(login);
            return ResponseDto.ok("Usuario registrado exitosamente");

        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al guardar el usuario");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al guardar el usuario: " + e.getMessage());
        }
    }

    public Optional<Login> findByUsername(String username) {
        return loginRepository.findByUsername(username);
    }

    public ResponseDto<ResponseLogin> loginOAuth2(String email, String name) {
        // Buscar usuario existente
        Login userEntity = loginRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));

        // Generar token
        String token = jwtService.generateToken(userEntity);

            ResponseLogin responseLogin = new ResponseLogin(
                token,
                userEntity.getUserID().getUserID(),
                userEntity.getUserID().getRole().name()
            );
        return ResponseDto.ok("Login OAuth2 exitoso", responseLogin);
    }

    // Metodos para enviar un token para cambiar la contraseña
    public ResponseDto<String> forgotPassword(String email) {
        Optional<Login> optionalUser = loginRepository.findByEmail(email);
        if (!optionalUser.isPresent()) {
            return ResponseDto.error("Usuario no encontrado");
        }
        String oldPasswordHash = optionalUser.get().getPassword();
        String token = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 6);
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(15);

        RecoverPasswordDto recoverPasswordDto = new RecoverPasswordDto();
        recoverPasswordDto.setUserID(optionalUser.get().getUserID());
        recoverPasswordDto.setCode(token);
        recoverPasswordDto.setCodeStatus(false); 
        recoverPasswordDto.setExpieres(expiry);
        recoverPasswordDto.setLastPasswordChange(oldPasswordHash);  

    // Guardar en base de datos con tu servicio
        resetTokens.put(token, new TokenInfo(optionalUser.get().getUserID().getUserID(), token));
        recoverPasswordService.insertRecoverPassword(recoverPasswordDto);
        System.out.println("Token generado para " + email + ": " + token);
        emailService.passwordResetEmail(email, token);

        return ResponseDto.ok("Se ha enviado un enlace de recuperación.");
    }

    // Método para restablecer la contraseña solo para si se le olvido, no se necesita iniciar sesión
    public ResponseDto<String> validateResetToken(String token) {
        Optional<RecoverPassword> optionalRecoverPassword = recoverPasswordRepository.findByCode(token);
        if (!optionalRecoverPassword.isPresent()) {
            return ResponseDto.error("Token inválido");
        }
        RecoverPassword recoverPassword = optionalRecoverPassword.get();
        if (recoverPassword.getExpieres().isBefore(LocalDateTime.now())) {
            return ResponseDto.error("El token ha expirado");
        } 
        return ResponseDto.ok("Token válido");
    }

    /**
     * Cambia la contraseña usando un token previamente validado.
     */
    public ResponseDto<String> resetPasswordWithToken(ResetPasswordDTO dto) {
        try {
            Optional<RecoverPassword> optionalRecoverPassword = recoverPasswordRepository.findByCode(dto.getToken());
            if (!optionalRecoverPassword.isPresent()) {
                return ResponseDto.error("Token inválido");
            }

            RecoverPassword recoverPassword = optionalRecoverPassword.get();
            if (recoverPassword.getExpieres().isBefore(LocalDateTime.now())) {
                return ResponseDto.error("El token ha expirado");
            }

            Optional<Login> optionalUser = loginRepository.findById(recoverPassword.getUserID().getUserID());
            if (!optionalUser.isPresent()) {
                return ResponseDto.error("Usuario no encontrado");
            }

            Login usuario = optionalUser.get();

            if (passwordEncoder.matches(dto.getNewPassword(), usuario.getPassword())) {
                return ResponseDto.error("La nueva contraseña no puede ser igual a la anterior");
            }

            if (dto.getNewPassword().length() < 8) {
                return ResponseDto.error("La nueva contraseña debe tener al menos 8 caracteres");
            }
            if (!dto.getNewPassword().matches("^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$")) {
                return ResponseDto.error("La contraseña debe incluir mayúsculas, minúsculas, número y símbolo");
            }

            usuario.setPassword(passwordEncoder.encode(dto.getNewPassword()));
            loginRepository.save(usuario);

            
            resetTokens.remove(dto.getToken());
            recoverPassword.setCodeStatus(true); // El true es de que ya se usó el código y cambio de contraseña
            recoverPasswordRepository.save(recoverPassword);

            return ResponseDto.ok("Contraseña cambiada correctamente");

        } catch (DataAccessException e) {
            return ResponseDto.error("Error de base de datos al cambiar la contraseña");
        } catch (Exception e) {
            return ResponseDto.error("Error inesperado al cambiar la contraseña: " + e.getMessage());
        }
    }

    public ResponseDto<String> changePassword(String email, ChangePasswordDto dto) {
        Optional<Login> optionalUser = loginRepository.findByEmail(email);

        if (!optionalUser.isPresent()) {
            return ResponseDto.error("Usuario no encontrado");
        }

        Login usuario = optionalUser.get();

        if (!passwordEncoder.matches(dto.getOldPassword(), usuario.getPassword())) {
            return ResponseDto.error("La contraseña actual no es correcta");
        }

        if (dto.getNewPassword().length() < 8) {
            return ResponseDto.error("La nueva contraseña debe tener al menos 8 caracteres");
        }

        if (dto.getOldPassword().equals(dto.getNewPassword())) {
            return ResponseDto.error("La nueva contraseña no puede ser igual a la anterior");
        }

        usuario.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        loginRepository.save(usuario);

        return ResponseDto.ok("Contraseña cambiada correctamente");
    }
}