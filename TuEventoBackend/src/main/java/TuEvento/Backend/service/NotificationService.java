package TuEvento.Backend.service;

import java.util.List;

import TuEvento.Backend.dto.NotificationDto;
import TuEvento.Backend.dto.responses.ResponseDto;

public interface NotificationService {

    ResponseDto<NotificationDto> insertNotification(NotificationDto notification);

    ResponseDto<NotificationDto> updateNotification(NotificationDto notification);

    ResponseDto<NotificationDto> deleteNotification(int id);

    ResponseDto<NotificationDto> getNotification(int id);

    ResponseDto<List<NotificationDto>> getNotifications(int eventID);

}
