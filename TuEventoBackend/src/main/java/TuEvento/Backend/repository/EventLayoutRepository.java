package TuEvento.Backend.repository;





import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import TuEvento.Backend.model.Event;
import TuEvento.Backend.model.EventLayout;

public interface EventLayoutRepository extends JpaRepository<EventLayout, Integer> {

    // Buscar layout por evento
    Optional<EventLayout> findByEventID(Event event);

    // Verificar si existe layout para un evento
    boolean existsByEventID(Event event);
}
