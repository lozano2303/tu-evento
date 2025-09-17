package TuEvento.Backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import TuEvento.Backend.model.Section;
public interface SectionRepository extends JpaRepository<Section, Integer> {
    
}
