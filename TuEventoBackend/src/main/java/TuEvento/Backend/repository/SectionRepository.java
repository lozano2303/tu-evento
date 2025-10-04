package TuEvento.Backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import TuEvento.Backend.model.Section;
import java.util.Optional;

public interface SectionRepository extends JpaRepository<Section, Integer> {
    Optional<Section> findByEventID_IdAndSectionNameID_SectionNameID(int eventId, Integer sectionNameID);
}
