package TuEvento.Backend.service.impl;

import TuEvento.Backend.dto.UserDto;
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
import org.springframework.dao.DataAccessException;
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
            throw new IllegalArgumentException("User with ID " + userId + " not found.");
        }

        User user = userOpt.get();

        String activationCode = String.format("%06d", new Random().nextInt(999999));
        AccountActivation activation = new AccountActivation();
        activation.setUserID(user);
        activation.setActivationCode(activationCode);
        activation.setActivation(false);
        activation.setExpirationTime(LocalDateTime.now().plusMinutes(1)); // 1 minute for test

        activationRepository.save(activation);

        Optional<Login> loginOpt = loginRepository.findByUserID(user);
        if (loginOpt.isPresent()) {
            String email = loginOpt.get().getEmail();
            String fullName = user.getFullName();
            ActivationCodeEmailDto dto = new ActivationCodeEmailDto(email, activationCode, fullName);
            emailService.sendActivationCodeEmail(dto);
        } else {
            throw new IllegalStateException("Login not found for user ID: " + userId);
        }
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
            return ResponseDto.error("No activation record found for user");
        }

        AccountActivation activation = optActivation.get();

        if (activation.isExpired()) {
            return ResponseDto.error("Activation code has expired");
        }

        if (activation.getActivation()) {
            return ResponseDto.error("Account is already activated");
        }

        if (!activation.getActivationCode().equals(activationCode)) {
            return ResponseDto.error("Invalid activation code");
        }

        activation.setActivation(true);
        activationRepository.save(activation);

        Optional<User> optUser = userRepository.findById(userId);
        if (optUser.isEmpty()) {
            return ResponseDto.error("User not found");
        }

        User user = optUser.get();

        if (!user.isActivated()) {
            user.setActivated(true);
            userRepository.save(user);
        }

        return ResponseDto.ok("Account activated successfully");
    }
}
