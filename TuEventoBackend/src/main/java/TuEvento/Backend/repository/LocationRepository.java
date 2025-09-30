package TuEvento.Backend.repository;

import TuEvento.Backend.model.Location;
import TuEvento.Backend.model.Address; // Importar Address para la búsqueda
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Integer> {
    // Verifica si ya existe una Location con un nombre y una Address específicos.
    boolean existsByNameAndAddress(String name, Address address);
}