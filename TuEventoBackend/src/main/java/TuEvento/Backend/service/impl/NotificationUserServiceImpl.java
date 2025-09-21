package TuEvento.Backend.service.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import TuEvento.Backend.dto.NotificationUserDto;
import TuEvento.Backend.dto.responses.ResponseDto;
import TuEvento.Backend.model.Notification;
import TuEvento.Backend.model.NotificationUser;
import TuEvento.Backend.model.User;
import TuEvento.Backend.repository.NotificationRepository;
import TuEvento.Backend.repository.NotificationUserRepository;
import TuEvento.Backend.repository.UserRepository;
import TuEvento.Backend.service.NotificationUserService;

public class NotificationUserServiceImpl implements NotificationUserService{
    @Autowired
    private NotificationUserRepository notificationUserRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private UserRepository userRepository;
    @Override
    public ResponseDto<NotificationUserDto> insertNotificationUser(NotificationUserDto notificationUserDto) {
        try { 
            Optional<Notification> optionalNotification = notificationRepository.findById(notificationUserDto.getNotification());
            if (!optionalNotification.isPresent()) {
                throw new IllegalArgumentException("Notification no encontrada");
            }
            Optional<User> optionalUser = userRepository.findById(notificationUserDto.getUser());
            if (!optionalUser.isPresent()) {
                throw new IllegalArgumentException("Usuario no encontrado");
            }
            NotificationUser notificationUser=new NotificationUser();
            notificationUser.setNotificationUserId(notificationUserDto.getNotificationUserId());
            notificationUser.setUser(optionalUser.get());
            notificationUser.setNotification(optionalNotification.get());
            notificationUserRepository.save(notificationUser);
            return ResponseDto.ok("Usuario notificado insertado correctamente");
        } catch (Exception e) {
            return ResponseDto.error("Error interno: no se pudo insertar el usuario notificado");
        }
    }
    @Override
    public ResponseDto<NotificationUserDto>  deleteNotificationUser(int id) {
        try {
            Optional<User> optionalUser = userRepository.findById(id);
            if (!optionalUser.isPresent()) {
                throw new IllegalArgumentException("Usuario no encontrado");
            }
            notificationUserRepository.findByUser(optionalUser.get());
            notificationUserRepository.deleteById(id);
            return ResponseDto.ok("Usuario notificado eliminado correctamente");
        } catch (Exception e) {
            return ResponseDto.error("Error interno: no se pudo eliminar el usuario");
        }
    }
    @Override
    public ResponseDto<List<NotificationUserDto>> getAll () {
        try {
            List<NotificationUser> notificationUserList = notificationUserRepository.findAll();
            List<NotificationUserDto> notificationUserDtoList = new java.util.ArrayList<>();
            for (NotificationUser notificationUser : notificationUserList) {
                NotificationUserDto notificationUserDto = new NotificationUserDto();
                notificationUserDto.setNotificationUserId(notificationUser.getNotificationUserId());
                notificationUserDto.setUser(notificationUser.getUser().getUserID());
                notificationUserDto.setNotification(notificationUser.getNotification().getNotificationID());
                notificationUserDtoList.add(notificationUserDto);
            }
            return ResponseDto.ok("Lista de usuarios notificados correctamente", notificationUserDtoList);
        } catch (Exception e) {
            return ResponseDto.error("Error interno: no se pudo obtener la lista de usuarios notificados");
        }
    }
}
