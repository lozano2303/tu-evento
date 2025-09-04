package TuEvento.Backend.repository;

import TuEvento.Backend.model.OrganizerPetition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizerPetitionRepository extends JpaRepository<OrganizerPetition, Integer> {
    boolean existsByUserID_UserID(int userID);
}
