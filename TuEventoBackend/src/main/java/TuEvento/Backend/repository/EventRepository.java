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
    List<Event> findAllByUserID_UserIDAndStatusNot(int userId, int status);
    List<Event> findByEventNameContainingIgnoreCaseAndStatusNot(String name, int i);
    List<Event> findByEventNameContainingIgnoreCase(String name);
    List<Event> findByStartDateOrFinishDateAndStatusNot(LocalDate date, LocalDate date2, int i);
    List<Event> findByStartDateOrFinishDate(LocalDate date, LocalDate date2);
    List<Event> findByLocationID_LocationIDAndStatusNot(Integer locationId, int i);
    List<Event> findByLocationID_LocationID(Integer locationId);
    List<Event> findAllByUserID_UserID(int userId);
    List<Event> findByEventNameContainingIgnoreCaseAndStatusNotIn(String name, List<Integer> excludedStatuses);
    List<Event> findByStartDateOrFinishDateAndStatusNotIn(LocalDate date, LocalDate date2,
            List<Integer> excludedStatuses);
    List<Event> findByLocationID_LocationIDAndStatusNotIn(Integer locationId, List<Integer> excludedStatuses);
    List<Event> findAllByStatusNotIn(List<Integer> excludedStatuses);
}
