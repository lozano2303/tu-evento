package TuEvento.Backend.service.email;

import TuEvento.Backend.dto.email.ActivationCodeEmailDto;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class ActivationCodeEmailService {

    @Autowired
    private JavaMailSender mailSender;
    public void basicEmail(String email,String user, String password) {
    try {
        String adressMail = email;
        String subject = "🔔 Recordatorio de Medicación";
        String dynamicUrl = "http://127.0.0.1:5500/notificaciones.html?id=" ; // URL dinámica con el ID
        
        String bodyMail = "<!DOCTYPE html>" +
                "<html lang='es'>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "    <style>" +
                "        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); color: #1f1d2e; line-height: 1.6; }" +
                "        .email-wrapper { max-width: 650px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.08); }" +
                "        .email-header { background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a855f7 100%); color: white; padding: 40px 30px; text-align: center; position: relative; }" +
                "        .email-header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"25\" cy=\"25\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/><circle cx=\"75\" cy=\"75\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.08\"/><circle cx=\"50\" cy=\"10\" r=\"0.5\" fill=\"%23ffffff\" opacity=\"0.06\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>'); }" +
                "        .email-header h1 { margin: 0; font-size: 26px; font-weight: 600; position: relative; z-index: 1; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }" +
                "        .header-subtitle { font-size: 14px; opacity: 0.9; margin-top: 8px; position: relative; z-index: 1; }" +
                "        .email-body { padding: 40px 30px; }" +
                "        .email-body h2 { margin-top: 0; color: #6d28d9; font-size: 22px; font-weight: 600; margin-bottom: 20px; }" +
                "        .greeting-text { font-size: 16px; margin-bottom: 25px; color: #374151; }" +
                "        .info-card { background: linear-gradient(135deg, #faf7ff 0%, #f3f0ff 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #8b5cf6; box-shadow: 0 2px 8px rgba(124, 58, 237, 0.06); }" +
                "        .info-row { display: flex; align-items: center; margin: 12px 0; padding: 8px 0; border-bottom: 1px solid rgba(139, 92, 246, 0.1); }" +
                "        .info-row:last-child { border-bottom: none; margin-bottom: 0; }" +
                "        .info-icon { width: 24px; height: 24px; margin-right: 12px; background: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; flex-shrink: 0; }" +
                "        .info-label { font-weight: 600; color: #6d28d9; min-width: 100px; margin-right: 15px; }" +
                "        .info-value { color: #374151; font-weight: 500; }" +
                "        .reminder-text { background: #eff6ff; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #3b82f6; color: #1e40af; font-size: 15px; }" +
                // Estilos para el botón
                "        .button-container { text-align: center; margin: 30px 0; }" +
                "        .action-button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); transition: all 0.3s ease; border: none; cursor: pointer; }" +
                "        .action-button:hover { background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4); }" +
                "        .action-button:active { transform: translateY(0); }" +
                "        .email-footer { text-align: center; font-size: 13px; color: #6b7280; padding: 30px 20px; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-top: 1px solid #e5e7eb; }" +
                "        .footer-note { margin-bottom: 10px; }" +
                "        .footer-signature { font-weight: 500; color: #8b5cf6; }" +
                "        @media only screen and (max-width: 650px) {" +
                "            .email-wrapper { margin: 10px; border-radius: 12px; }" +
                "            .email-body, .email-header { padding: 25px 20px; }" +
                "            .email-header h1 { font-size: 22px; }" +
                "            .info-card { padding: 20px 15px; }" +
                "            .info-row { flex-direction: column; align-items: flex-start; }" +
                "            .info-label { min-width: auto; margin-bottom: 5px; }" +
                "            .action-button { padding: 12px 24px; font-size: 14px; }" +
                "        }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='email-wrapper'>" +
                "        <div class='email-header'>" +
                "            <h1>Recordatorio de Medicación</h1>" +
                "            <div class='header-subtitle'>Sistema de Seguimiento Médico</div>" +
                "        </div>" +
                "        <div class='email-body'>" +
                "            <h2>Hola, " + user + ".</h2>" +
                "            <p class='greeting-text'>Te recordamos que es momento de tomar tu medicamento según la programación establecida.</p>" +
                "            " +
                "            <div class='info-card'>" +
                "                <div class='info-row'>" +
                "                    <div class='info-icon'>1</div>" +
                "                    <div class='info-label'>Tu contraseña es:</div>" +
                "                    <div class='info-value'>" + password + ".</div>" +
                "                </div>" +
                "                <div class='info-row'>" +
                "                    <div class='info-icon'>2</div>" +
                "                    <div class='info-label'>Medicamento:</div>" +
                "                    <div class='info-value'>" + user + "</div>" +
                "                </div>" +
                "                <div class='info-row'>" +
                "                    <div class='info-icon'>3</div>" +
                "                    <div class='info-label'>Dosis:</div>" +
                "                    <div class='info-value'>" + user + " gm</div>" +
                "                </div>" +
                "            </div>" +
                "            " +
                "            <div class='reminder-text'>" +
                "                <strong>Importante:</strong> Recuerda seguir estrictamente las indicaciones de tu profesional de salud. La adherencia al tratamiento es fundamental para tu bienestar." +
                "            </div>" +
                "            " +

                "            <div class='button-container'>" +
                "                <a href='" + dynamicUrl + "' class='action-button' target='_blank'>Configurar Recordatorio</a>" +
                "            </div>" +
                "        </div>" +   
                "        <div class='email-footer'>" +
                "            <div class='footer-note'>Este correo fue generado automáticamente por el sistema. No respondas a este mensaje.</div>" +
                "            <div class='footer-signature'>Sistema de Gestión Médica</div>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
            emailSender(adressMail, subject, bodyMail); // Aquí se envía el correo HTML
        } catch (Exception e) {
            e.printStackTrace(); // Muestra el error en consola para depuración
        }
    }
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
    public boolean emailSender(String adressMail, String subject, String bodyMail) throws MessagingException {
        try {
            // Crear un mensaje MIME
            MimeMessage message = mailSender.createMimeMessage();
            // Crear un helper para construir el mensaje
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            // Establecer los valores del correo
            helper.setTo(adressMail);  // Establecer la dirección del destinatario
            helper.setSubject(subject); // Establecer el asunto del correo
            helper.setText(bodyMail,true);   // Establecer el contenido del mensaje
            
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