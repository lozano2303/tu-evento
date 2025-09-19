package TuEvento.Backend.service.notification;

import org.springframework.beans.factory.annotation.Autowired;

import TuEvento.Backend.service.EventService;
import TuEvento.Backend.service.NotificationService;

public class SendNotification {
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private EventService eventService;
    

}
