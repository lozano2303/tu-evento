package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.LoginDto;
import TuEvento.Backend.dto.requests.ChangePasswordDto;
import TuEvento.Backend.dto.requests.RequestLoginDTO;
import TuEvento.Backend.dto.requests.ResetPasswordDTO;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.dto.responses.ResponseLogin;
import TuEvento.Backend.model.Login;
import TuEvento.Backend.repository.LoginRepository;
import TuEvento.Backend.service.LoginService;
import TuEvento.Backend.service.email.ActivationCodeEmailService;
import TuEvento.Backend.service.jwt.jwtService;
import TuEvento.Backend.dto.requests.TokenInfo;

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
            return ResponseDto.ok(responseLogin);

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
            return ResponseDto.error("Error inesperado al guardar el usuario");
        }
    }

    // Este método se puede eliminar si ya usas el de arriba con ResponseDto<ResponseLogin>
    public ResponseLogin login(RequestLoginDTO loginDTO) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginDTO.getUsername(),
                loginDTO.getPassword()
            )
        );

        Login userEntity = loginRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        String token = jwtService.generateToken(userEntity);
        return new ResponseLogin(
            token,
            userEntity.getUserID().getUserID(),
            userEntity.getUserID().getRole().name()
        );
    }

    public Optional<Login> findByUsername(String username) {
        return loginRepository.findByUsername(username);
    }

    // Metodos para enviar un token para cambiar la contraseña
    public ResponseDto<String> forgotPassword(String email) {
        Optional<Login> optionalUser = loginRepository.findByEmail(email);

        if (!optionalUser.isPresent()) {
            return ResponseDto.error("Usuario no encontrado");
        }

        String token = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(15);

        resetTokens.put(token, new TokenInfo(email, expiry));

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

        resetTokens.remove(dto.getToken()); // token usado token eliminado

        return ResponseDto.ok("Contraseña actualizada correctamente");
    }

    // eliminar tokens expirados cada 5 minutos
    @Scheduled(fixedRate = 300000)
    public void eliminarTokensExpirados() {
        LocalDateTime ahora = LocalDateTime.now();
        resetTokens.entrySet().removeIf(entry -> entry.getValue().getExpiry().isBefore(ahora));
        System.out.println("Tokens expirados eliminados.");
    }

    public ResponseDto<String> changePassword(String username, ChangePasswordDto dto) {
        Optional<Login> optionalUser = loginRepository.findByUsername(username);

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