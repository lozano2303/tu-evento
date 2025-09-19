package TuEvento.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import TuEvento.Backend.model.Seat;

public interface SeatRepository extends JpaRepository<Seat, Integer>{
}
