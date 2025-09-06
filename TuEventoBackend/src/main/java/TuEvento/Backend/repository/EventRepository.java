package TuEvento.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import TuEvento.Backend.model.Event;

public interface EventRepository extends JpaRepository<Event, Integer> {

}
