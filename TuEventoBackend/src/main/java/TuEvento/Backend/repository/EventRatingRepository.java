package TuEvento.Backend.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import TuEvento.Backend.model.Event;
import TuEvento.Backend.model.EventRating;
import TuEvento.Backend.model.User;

public interface EventRatingRepository extends JpaRepository<EventRating, Integer> {

    Optional<EventRating> findByComment(String comment);

    Optional<EventRating> findByEventId(Event eventId);

    List<EventRating> findAllByEventId(Event eventId);

    Optional<EventRating> findByUserId(User userId);

}
