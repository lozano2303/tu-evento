package TuEvento.Backend.service.notification;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import TuEvento.Backend.model.Event;
import TuEvento.Backend.model.Login;
import TuEvento.Backend.model.Notification;
import TuEvento.Backend.model.NotificationUser;
import TuEvento.Backend.repository.LoginRepository;
import TuEvento.Backend.repository.NotificationRepository;
import TuEvento.Backend.repository.NotificationUserRepository;

@Service
public class SendNotification {

    @Autowired
    private NotificationUserRepository notificationUserRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private JavaMailSender mailSender;

    // Método programado para ejecutarse diariamente y enviar notificaciones dos días antes del evento
    @Scheduled(cron = "0 26 15 * * ?") // Todos los días a las 3:26 PM
    public void sendNotificationsTwoDaysBeforeEvent() {
        LocalDate twoDaysFromNow = LocalDate.now().plusDays(2); 

        // Obtener todas las notificaciones
        List<Notification> notifications = notificationRepository.findAll();

        for (Notification notification : notifications) {
            Event event = notification.getEventID();
            if (event != null && event.getStartDate().equals(twoDaysFromNow)) {
                // Encontrar usuarios asociados a esta notificación
                List<NotificationUser> notificationUsers = notificationUserRepository.findAll();
                for (NotificationUser nu : notificationUsers) {
                    if (nu.getNotification().getNotificationID() == notification.getNotificationID()) {
                        // Obtener el email del usuario
                        Optional<Login> loginOpt = loginRepository.findByUserID(nu.getUser());
                        if (loginOpt.isPresent() && loginOpt.get().getEmail() != null) {
                            sendEmail(loginOpt.get().getEmail(), notification.getMessage(), event.getEventName());
                        }
                    }
                }
            }
        }
    }

    // Método para enviar email
    private void sendEmail(String to, String message, String eventName) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(to);
            mailMessage.setSubject("Recordatorio: Evento " + eventName + " en dos días");
            mailMessage.setText("Hola,\n\n" + message + "\n\nSaludos,\nTuEvento Team");
            mailSender.send(mailMessage);
        } catch (Exception e) {
            // Log error
            System.err.println("Error sending email to " + to + ": " + e.getMessage());
        }
    }

    // Método alternativo que recibe datos de NotificationUserDto para enviar notificación específica
    public void sendNotificationForUser(NotificationUser notificationUser) {
        try {
            Notification notification = notificationUser.getNotification();
            Event event = notification.getEventID();
            LocalDate twoDaysFromNow = LocalDate.now().plusDays(2);

            if (event != null && event.getStartDate().equals(twoDaysFromNow)) {
                Optional<Login> loginOpt = loginRepository.findByUserID(notificationUser.getUser());
                if (loginOpt.isPresent() && loginOpt.get().getEmail() != null) {
                    sendEmail(loginOpt.get().getEmail(), notification.getMessage(), event.getEventName());
                }
            }
        } catch (Exception e) {
            System.err.println("Error al enviar notificación para usuario: " + e.getMessage());
        }
    }
}
