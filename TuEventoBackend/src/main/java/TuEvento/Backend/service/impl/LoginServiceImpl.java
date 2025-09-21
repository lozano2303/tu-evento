package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.LoginDto;
import TuEvento.Backend.dto.RecoverPasswordDto;
import TuEvento.Backend.dto.requests.ChangePasswordDto;
import TuEvento.Backend.dto.requests.RequestLoginDTO;
import TuEvento.Backend.dto.requests.ResetPasswordDTO;
import TuEvento.Backend.dto.responses.ResponseDto;

import TuEvento.Backend.model.Login;
import TuEvento.Backend.repository.LoginRepository;
import TuEvento.Backend.service.LoginService;
import TuEvento.Backend.service.RecoverPasswordService;
import TuEvento.Backend.service.email.ActivationCodeEmailService;
import TuEvento.Backend.service.jwt.jwtService;
import TuEvento.Backend.dto.requests.TokenInfo;
import TuEvento.Backend.dto.responses.ResponseLogin;
import TuEvento.Backend.dto.responses.ResponseLoginSm;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DataAccessException;
import org.springframework.scheduling.annotation.Scheduled;
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
    public ResponseLoginSm LoginSM(RequestLoginDTO loginDTO) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginDTO.getEmail(),
                loginDTO.getPassword()
            )
        );

        Login userEntity = loginRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        String token = jwtService.generateToken(userEntity);
        return new ResponseLoginSm(token);
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

        resetTokens.put(token, new TokenInfo(email, expiry));
        RecoverPasswordDto recoverPasswordDto = new RecoverPasswordDto();
        recoverPasswordDto.setUserID(optionalUser.get().getUserID());
        recoverPasswordDto.setCode(token);
        recoverPasswordDto.setCodeStatus(false); 
        recoverPasswordDto.setExpieres(expiry);
        recoverPasswordDto.setLastPasswordChange(oldPasswordHash);  

    // Guardar en base de datos con tu servicio
    recoverPasswordService.insertRecoverPassword(recoverPasswordDto);
        System.out.println("Token generado para " + email + ": " + token);
        emailService.passwordResetEmail(email, token);

        return ResponseDto.ok("Se ha enviado un enlace de recuperación.");
    }

    // Método para restablecer la contraseña solo para si se le olvido, no se necesita iniciar sesión
    public ResponseDto<String> resetPassword(ResetPasswordDTO dto) {
        TokenInfo info = resetTokens.get(dto.getToken());

        if (info == null) {
            return ResponseDto.error("Token inválido");
        }

        if (info.getExpiry().isBefore(LocalDateTime.now())) {
            resetTokens.remove(dto.getToken());
            return ResponseDto.error("El token ha expirado");
        }

        Optional<Login> optionalUser = loginRepository.findByEmail(info.getEmail());

        if (!optionalUser.isPresent()) {
            return ResponseDto.error("Usuario no encontrado");
        }

        Login usuario = optionalUser.get();
        usuario.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        loginRepository.save(usuario);
        RecoverPasswordDto recoverPasswordDto = new RecoverPasswordDto();
        recoverPasswordDto.setCodeStatus(true); 
        
    // Guardar en base de datos con tu servicio
    recoverPasswordService.updateRecoverPassword(dto.getToken(), recoverPasswordDto);
        resetTokens.remove(dto.getToken()); // token usado token eliminado

        return ResponseDto.ok("Contraseña actualizada correctamente");
    }

    @Scheduled(fixedRate = 900000) // cada 15 minutos
    public void eliminarTokensExpirados() {
        LocalDateTime ahora = LocalDateTime.now();
        resetTokens.entrySet().removeIf(entry -> entry.getValue().getExpiry().isBefore(ahora));
        System.out.println("Tokens expirados eliminados.");
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