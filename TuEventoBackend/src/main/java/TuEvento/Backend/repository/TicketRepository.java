package TuEvento.Backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import TuEvento.Backend.model.Event;
import TuEvento.Backend.model.Ticket;
import TuEvento.Backend.model.User;

public interface TicketRepository extends JpaRepository<Ticket, Integer> {

    List<Ticket> findByEventId(Event eventId);
    List<Ticket> findByUserId(User user);



}
