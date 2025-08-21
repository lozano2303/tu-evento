package TuEvento.Backend.service.email;

import TuEvento.Backend.dto.email.ActivationCodeEmailDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class ActivationCodeEmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Sends the activation code to the user who just registered.
     * @param dto contains recipient's email, activation code, and user full name
     */
    public void sendActivationCodeEmail(ActivationCodeEmailDto dto) {
        String subject = "Account Activation - SoftComerce";
        String body = String.format(
            "Hello %s,\n\n" +
            "Thanks for registering at SoftComerce!\n\n" +
            "To activate your account, please enter the following activation code:\n\n" +
            "%s\n\n" +
            "This code will expire in 1 minute for security reasons.\n\n" +
            "If you did not create this account, please ignore this email.\n\n" +
            "Best regards,\n" +
            "SoftComerce Team",
            dto.getUserFullName(),
            dto.getActivationCode()
        );

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(dto.getTo());
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}