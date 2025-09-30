package TuEvento.Backend.repository;

import TuEvento.Backend.model.Address;
import TuEvento.Backend.model.City; // Importar City para la búsqueda
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {
    // Busca una Dirección por el nombre exacto de la calle y la Ciudad asociada.
    Optional<Address> findByStreetAndCity(String street, City city);
}