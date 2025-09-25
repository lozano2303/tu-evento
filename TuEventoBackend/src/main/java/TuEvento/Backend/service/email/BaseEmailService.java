package TuEvento.Backend.service.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public abstract class BaseEmailService {

    @Autowired
    protected JavaMailSender mailSender;

    protected boolean emailSender(String adressMail, String subject, String bodyMail) throws MessagingException {
        try {
            // Crear un mensaje MIME
            MimeMessage message = mailSender.createMimeMessage();
            // Crear un helper para construir el mensaje
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            // Establecer los valores del correo
            helper.setTo(adressMail);  // Establecer la dirección del destinatario
            helper.setSubject(subject); // Establecer el asunto del correo
            helper.setText(bodyMail, true);   // Establecer el contenido del mensaje

            // Enviar el correo electrónico
            mailSender.send(message);
            return true; // Si todo va bien, se devuelve true
        } catch (MessagingException e) {
            // Si ocurre una excepción durante el envío, se imprime el mensaje de error
            System.out.println(e.getMessage());
        }
        return false; // Si hubo un error, se devuelve false
    }
}