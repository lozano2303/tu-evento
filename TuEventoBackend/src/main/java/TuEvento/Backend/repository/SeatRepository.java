package TuEvento.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import TuEvento.Backend.model.Seat;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Integer>{
    List<Seat> findBySectionID_SectionID(int sectionId);
}
