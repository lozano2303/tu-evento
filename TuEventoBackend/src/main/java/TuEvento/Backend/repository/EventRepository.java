package TuEvento.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import TuEvento.Backend.model.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Integer> {

}
