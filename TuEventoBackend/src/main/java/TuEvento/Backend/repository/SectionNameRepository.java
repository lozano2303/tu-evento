package TuEvento.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import TuEvento.Backend.model.SectionName;
import java.util.List;
import java.util.Optional;

public interface SectionNameRepository extends JpaRepository<SectionName, Integer> {

    // Find section name by name
    Optional<SectionName> findByNameIgnoreCase(String name);

    // Find section names containing name
    List<SectionName> findByNameContainingIgnoreCase(String name);
}