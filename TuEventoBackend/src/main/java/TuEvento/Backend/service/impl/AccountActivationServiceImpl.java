package TuEvento.Backend.service.impl;


import TuEvento.Backend.dto.email.ActivationCodeEmailDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.AccountActivation;
import TuEvento.Backend.model.User;
import TuEvento.Backend.model.Login;
import TuEvento.Backend.repository.AccountActivationRepository;
import TuEvento.Backend.repository.UserRepository;
import TuEvento.Backend.repository.LoginRepository;
import TuEvento.Backend.service.AccountActivationService;
import TuEvento.Backend.service.email.ActivationCodeEmailService;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AccountActivationServiceImpl implements AccountActivationService {

    @Autowired
    private AccountActivationRepository activationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private ActivationCodeEmailService emailService;

    @Override
    @Transactional
    public void createActivationForUser(int userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Usuario con el ID " + userId + " no fue encontrado");
        }

        User user = userOpt.get();

        String activationCode = String.format("%06d", new Random().nextInt(999999));
        AccountActivation activation = new AccountActivation();
        activation.setUserID(user);
        activation.setActivationCode(activationCode);
        activation.setActivation(true);
        activation.setExpirationTime(LocalDateTime.now().plusMinutes(1)); // 1 minute for test

        activationRepository.save(activation);

        Optional<Login> loginOpt = loginRepository.findByUserID(user);
        if (loginOpt.isPresent()) {
            String email = loginOpt.get().getEmail();
            String fullName = user.getFullName();
            ActivationCodeEmailDto dto = new ActivationCodeEmailDto(email, activationCode, fullName);
            emailService.sendActivationCodeEmail(dto);
        } else {
            throw new IllegalStateException("El correo ingresado no existe, verifica si lo escribiste correctamente");
        }
    }

    @Override
    @Transactional
    public void resendActivationCode(int userId) {
        // Buscar usuario
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario con el ID " + userId + " no fue encontrado"));

        // Buscar la activación existente
        AccountActivation activation = activationRepository.findByUserID_UserID(userId)
                .orElseThrow(() -> new IllegalStateException("No existe activación previa para el usuario con ID: " + userId));

        // Generar nuevo código
        String newActivationCode = String.format("%06d", new Random().nextInt(999999));
        activation.setActivationCode(newActivationCode);
        activation.setActivation(false);
        activation.setExpirationTime(LocalDateTime.now().plusMinutes(1)); // ⏰ Cambia a más tiempo en producción

        // Guardar cambios
        activationRepository.save(activation);

        // Buscar login para enviar correo
        loginRepository.findByUserID(user).ifPresentOrElse(login -> {
            String email = login.getEmail();
            String fullName = user.getFullName();
            ActivationCodeEmailDto dto = new ActivationCodeEmailDto(email, newActivationCode, fullName);
            emailService.sendActivationCodeEmail(dto);
        }, () -> {
            throw new IllegalStateException("El correo ingresado no existe, verifica si lo escribiste correctamente");
        });
    }

    @Override
    public User getUserById(int userId) {
        return userRepository.findById(userId).orElse(null);
    }

    @Override
    @Transactional
    public ResponseDto<String> verifyActivationCode(int userId, String activationCode) {
        Optional<AccountActivation> optActivation = activationRepository.findByUserID_UserID(userId);

        if (optActivation.isEmpty()) {
            return ResponseDto.error("No se encontró ningún registro de activación para el usuario");
        }

        AccountActivation activation = optActivation.get();

        if (activation.isExpired()) {
            return ResponseDto.error("El código de activación ha expirado");
        }

        if (activation.getActivation()) {
            return ResponseDto.error("La cuenta ya está activada");
        }

        if (!activation.getActivationCode().equals(activationCode)) {
            return ResponseDto.error("Código de activación no válido");
        }

        activation.setActivation(true);
        activationRepository.save(activation);

        Optional<User> optUser = userRepository.findById(userId);
        if (optUser.isEmpty()) {
            return ResponseDto.error("Usuario no encontrado");
        }

        User user = optUser.get();

        if (!user.isActivated()) {
            user.setActivated(true);
            userRepository.save(user);
        }

        return ResponseDto.ok("Cuenta activada exitosamente");
    }
}
