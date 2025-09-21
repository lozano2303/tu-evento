package TuEvento.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import TuEvento.Backend.model.NotificationUser;
import TuEvento.Backend.model.User;

public interface NotificationUserRepository extends JpaRepository<NotificationUser, Integer> {

    void findByUser(User user);

}
