package TuEvento.Backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import TuEvento.Backend.model.Seat;
import TuEvento.Backend.model.SeatTicket;
import TuEvento.Backend.model.SeatTicketId;
import TuEvento.Backend.model.Ticket;

public interface SeatTicketRepository extends JpaRepository<SeatTicket, SeatTicketId> {
    List<SeatTicket> findByTicket(Ticket ticket);
    List<SeatTicket> findBySeat(Seat seat);
}

