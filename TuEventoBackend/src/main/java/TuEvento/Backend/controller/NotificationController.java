package TuEvento.Backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import TuEvento.Backend.dto.NotificationDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.service.NotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/create")
    public ResponseDto<NotificationDto> createNotification(@RequestBody NotificationDto notificationDto) {
        return notificationService.insertNotification(notificationDto);
    }

    @PutMapping("/update")
    public ResponseDto<NotificationDto> updateNotification(@RequestBody NotificationDto notificationDto) {
        return notificationService.updateNotification(notificationDto);
    }

    @DeleteMapping("/{id}")
    public ResponseDto<NotificationDto> deleteNotification(@PathVariable int id) {
        return notificationService.deleteNotification(id);
    }

    @GetMapping("/{id}")
    public ResponseDto<NotificationDto> getNotification(@PathVariable int id) {
        return notificationService.getNotification(id);
    }

    @GetMapping("/event/{eventID}")
    public ResponseDto<List<NotificationDto>> getNotificationsByEvent(@PathVariable int eventID) {
        return notificationService.getNotifications(eventID);
    }
}