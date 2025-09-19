package TuEvento.Backend.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import TuEvento.Backend.dto.NotificationDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.Event;
import TuEvento.Backend.model.Notification;
import TuEvento.Backend.repository.EventRepository;
import TuEvento.Backend.repository.NotificationRepository;
import TuEvento.Backend.service.NotificationService;
@Service
public class NotificationServiceImpl implements NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private EventRepository eventRepository;

    @Override
    public ResponseDto<NotificationDto> insertNotification(NotificationDto notificationDto) {
        try {
            Notification notification = new Notification();
            notification.setEventID(eventRepository.findById(notificationDto.getEventID()).orElse(null));
            notification.setMessage(notificationDto.getMessage());
            notification.setSendDate(notificationDto.getSendDate());

            notificationRepository.save(notification);

            return new ResponseDto<>(true, "Notificación creada exitosamente");
        } catch (Exception e) {
            return new ResponseDto<>(false, "Error creando notificación: " + e.getMessage());
        }
    }

    @Override

    public ResponseDto<NotificationDto> updateNotification(NotificationDto notificationDto) {
        try {
            // Buscar notificación existente
            Notification notification = notificationRepository.findById(notificationDto.getNotificationID())
                    .orElse(null);

            if (notification == null) {
                return new ResponseDto<>(false, "Notificación no encontrada");
            }

            // Validar evento
            Event event = eventRepository.findById(notificationDto.getEventID()).orElse(null);
            if (event == null) {
                return new ResponseDto<>(false, "Evento no encontrado");
            }

            // Actualizar campos
            notification.setEventID(event);
            notification.setMessage(notificationDto.getMessage());
            notification.setSendDate(LocalDateTime.now());

            notificationRepository.save(notification);

            // Convertir a DTO de respuesta
            NotificationDto updatedDto = new NotificationDto();
            updatedDto.setNotificationID(notification.getNotificationID());
            updatedDto.setEventID(notification.getEventID().getId());
            updatedDto.setMessage(notification.getMessage());
            updatedDto.setSendDate(notification.getSendDate());

            return new ResponseDto<>(true, "Notificación actualizada exitosamente", updatedDto);
        } catch (Exception e) {
            return new ResponseDto<>(false, "Error actualizando notificación: " + e.getMessage());
        }
    }

    @Override
    public ResponseDto<NotificationDto> deleteNotification(int id) {
        try {
            notificationRepository.deleteById(id);
            return new ResponseDto<>(true, "Notificación eliminada exitosamente");
        } catch (Exception e) {
            return new ResponseDto<>(false, "Error eliminando notificación: " + e.getMessage());
        }
    }
    @Override
    public ResponseDto<NotificationDto> getNotification(int id) {
        try {
            Notification notification = notificationRepository.findById(id).orElse(null);
            if (notification == null) {
                return new ResponseDto<>(false, "Notificación no encontrada");
            }

            NotificationDto notificationDto = new NotificationDto();
            notificationDto.setNotificationID(notification.getNotificationID());
            notificationDto.setMessage(notification.getMessage());
            notificationDto.setEventID(notification.getEventID().getId()); 
            notificationDto.setSendDate(notification.getSendDate());

            return new ResponseDto<>(true, "Notificación encontrada", notificationDto);
        } catch (Exception e) {
            return new ResponseDto<>(false, "Error obteniendo notificación: " + e.getMessage());
        }
    }


public ResponseDto<List<NotificationDto>> getNotifications(int eventID) {
    try {
        Event event = eventRepository.findById(eventID).orElse(null);
        if (event == null) {
            return new ResponseDto<>(false, "Evento no encontrado");
        }

        List<Notification> notifications = notificationRepository.findByEvent(eventRepository.findById(eventID).orElse(null));
        if (notifications.isEmpty()) {
            return new ResponseDto<>(false, "No hay notificaciones para este evento");
        }

        List<NotificationDto> notificationDtos = new ArrayList<>();
        for (Notification n : notifications) {
            NotificationDto dto = new NotificationDto();
            dto.setNotificationID(n.getNotificationID());
            dto.setMessage(n.getMessage());
            dto.setEventID(n.getEventID().getId()); // Extraemos el int del Event
            dto.setSendDate(n.getSendDate());
            notificationDtos.add(dto);
        }

        return new ResponseDto<>(true, "Notificaciones encontradas", notificationDtos);
    } catch (Exception e) {
        return new ResponseDto<>(false, "Error obteniendo notificaciones: " + e.getMessage());
    }
}

}
