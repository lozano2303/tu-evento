package TuEvento.Backend.repository;

import TuEvento.Backend.model.Location;
import TuEvento.Backend.model.Address; // Importar Address para la búsqueda
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Integer> {
    // Verifica si ya existe una Location con un nombre y una Address específicos.
    boolean existsByNameAndAddress(String name, Address address);

    @Query("SELECT l FROM location l LEFT JOIN FETCH l.address a LEFT JOIN FETCH a.city")
    List<Location> findAllWithAddressAndCity();

    @Query("SELECT l FROM location l LEFT JOIN FETCH l.address a LEFT JOIN FETCH a.city WHERE l.locationID = :locationID")
    Location findByIdWithAddressAndCity(int locationID);

    @Query("SELECT l FROM location l JOIN FETCH l.address a JOIN FETCH a.city c WHERE c.cityID = :cityID")
    List<Location> findByCityId(int cityID);
}