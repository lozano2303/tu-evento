
package TuEvento.Backend.service;

import java.util.List;

import TuEvento.Backend.dto.NotificationUserDto;
import TuEvento.Backend.dto.responses.ResponseDto;

public interface NotificationUserService {
    ResponseDto<NotificationUserDto> deleteNotificationUser(int id);
    ResponseDto<NotificationUserDto> insertNotificationUser(NotificationUserDto notificationUserDto);
    ResponseDto<List<NotificationUserDto>> getAll();

}
