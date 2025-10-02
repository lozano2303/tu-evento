package TuEvento.Backend.service.notification;

import java.time.LocalDate;
import java.util.List;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import TuEvento.Backend.model.Event;
import TuEvento.Backend.model.Notification;
import TuEvento.Backend.model.NotificationUser;
import TuEvento.Backend.repository.LoginRepository;
import TuEvento.Backend.repository.NotificationRepository;
import TuEvento.Backend.repository.NotificationUserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class SendNotification {

    private static final Logger logger = LoggerFactory.getLogger(SendNotification.class);

    @Autowired
    private NotificationUserRepository notificationUserRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Job programado: envía notificaciones 2 días antes del evento
     * Se ejecuta todos los días a las 22:33 (hora Bogotá)
     */
    @Scheduled(cron = "0 47 22 * * ?", zone = "America/Bogota")
    public void sendNotificationsTwoDaysBeforeEvent() {
        LocalDate twoDaysFromNow = LocalDate.now().plusDays(2);
        logger.info("Ejecutando job de notificaciones para la fecha: {}", twoDaysFromNow);

        // Obtener todas las notificaciones
        List<Notification> notifications = notificationRepository.findAll();

        for (Notification notification : notifications) {
            Event event = notification.getEventID();

            if (event != null && event.getStartDate().equals(twoDaysFromNow)) {
                logger.info("Evento {} programado para dentro de 2 días. Buscando usuarios...", event.getEventName());

                // Obtener solo los usuarios relacionados con esa notificación
                List<NotificationUser> notificationUsers =
                        notificationUserRepository.findByNotification(notification);

                for (NotificationUser nu : notificationUsers) {
                    loginRepository.findByUserID(nu.getUser()).ifPresent(login -> {
                        if (login.getEmail() != null) {
                            sendEmail(login.getEmail(), notification.getMessage(), event.getEventName());
                        }
                    });
                }
            }
        }
    }

    /**
     * Método para enviar email con diseño HTML
     */
    private void sendEmail(String to, String message, String eventName) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("🎉 Recordatorio: Evento " + eventName + " en dos días");

            String bodyMail = String.format("""
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Recordatorio de Evento</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9fb; margin: 0; padding: 0; color: #1f1d2e; }
                        .container { max-width: 650px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                        .header { background: linear-gradient(135deg, #8b5cf6, #a855f7, #c084fc); padding: 40px; text-align: center; color: white; }
                        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
                        .content { padding: 35px; }
                        .content h2 { margin-top: 0; color: #6d28d9; font-size: 22px; }
                        .content p { font-size: 16px; line-height: 1.6; color: #374151; }
                        .event-card { background: #faf7ff; border-left: 5px solid #8b5cf6; padding: 20px; border-radius: 10px; margin: 25px 0; }
                        .event-card h3 { margin: 0; font-size: 20px; color: #4c1d95; }
                        .event-card p { margin: 10px 0 0; }
                        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
                        .footer strong { color: #8b5cf6; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>¡Tu Evento se Acerca!</h1>
                            <p>Faltan solo 2 días 🎉</p>
                        </div>
                        <div class="content">
                            <h2>Hola,</h2>
                            <p>%s</p>
                            <div class="event-card">
                                <h3>📅 %s</h3>
                                <p>Este es un recordatorio de tu evento. ¡No faltes!</p>
                            </div>
                            <p>Gracias por confiar en <strong>TuEvento</strong>. ¡Te esperamos!</p>
                        </div>
                        <div class="footer">
                            <p>Este correo fue generado automáticamente por <strong>TuEvento</strong>.<br>No respondas a este mensaje.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, message, eventName);

            helper.setText(bodyMail, true);
            mailSender.send(mimeMessage);

            logger.info("Correo HTML enviado correctamente a {}", to);
        } catch (Exception e) {
            logger.error("Error enviando correo a {}: {}", to, e.getMessage());
        }
    }

    /**
     * Método alternativo para enviar notificación específica a un usuario
     */
    public void sendNotificationForUser(NotificationUser notificationUser) {
        try {
            Notification notification = notificationUser.getNotification();
            Event event = notification.getEventID();
            LocalDate twoDaysFromNow = LocalDate.now().plusDays(2);

            if (event != null && event.getStartDate().equals(twoDaysFromNow)) {
                loginRepository.findByUserID(notificationUser.getUser()).ifPresent(login -> {
                    if (login.getEmail() != null) {
                        sendEmail(login.getEmail(), notification.getMessage(), event.getEventName());
                    }
                });
            }
        } catch (Exception e) {
            logger.error("Error al enviar notificación para usuario {}: {}",
                         notificationUser.getUser(), e.getMessage());
        }
    }
}
