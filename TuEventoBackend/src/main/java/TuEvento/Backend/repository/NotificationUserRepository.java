package TuEvento.Backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import TuEvento.Backend.model.Notification;
import TuEvento.Backend.model.NotificationUser;
import TuEvento.Backend.model.User;

public interface NotificationUserRepository extends JpaRepository<NotificationUser, Integer> {

    void findByUser(User user);

    List<NotificationUser> findByNotification(Notification notification);

}
