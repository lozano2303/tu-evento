package TuEvento.Backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import TuEvento.Backend.model.Event;


@Repository
public interface EventRepository extends JpaRepository<Event, Integer> {
    Optional<Event> findByEventNameAndStatusNot(String eventName, int status);
    Optional<Event> findByStartDateAndStatusNot(LocalDate startDate, int status);
    Optional<Event> findByFinishDateAndStatusNot(LocalDate finishDate, int status);
    List<Event> findAllByStatusNot(int status);
    Optional<Event> findByStatus(int status);
    Optional<Event> findByEventNameAndStartDateAndFinishDateAndStatus(String eventName, LocalDate startDate,
            LocalDate finishDate, int status);
}
