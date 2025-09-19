package TuEvento.Backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import TuEvento.Backend.model.Event;
import TuEvento.Backend.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByEvent(Event eventID);
}
